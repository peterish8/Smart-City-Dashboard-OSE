// Smart City Dashboard - Streamlined Version
// API Configuration
const API_CONFIG = {
    weather: "https://api.open-meteo.com/v1/forecast",
    airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
    geocoding: "https://geocoding-api.open-meteo.com/v1/search"
};

const CITY_NAME = "Bangalore";
let charts = {};

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Dashboard loading...");
    loadTheme();
    fetchCityData();
    updateTime();
    setInterval(updateTime, 1000);
});

// Time Display
function updateTime() {
    const timeElement = document.getElementById("currentTime");
    if (!timeElement) return;
    
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "pm" : "am";
    
    timeElement.textContent = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

// Main Data Fetching Function
async function fetchCityData() {
    showLoading(true);
    hideError();
    clearDashboard();

    try {
        const coords = await getCoordinates(CITY_NAME);
        const [weather, airQuality, hourlyWeather, hourlyAir] = await Promise.all([
            fetchWeatherData(coords),
            fetchAirQualityData(coords),
            fetchHourlyData(coords, "weather"),
            fetchHourlyData(coords, "air")
        ]);

        displayData(weather, airQuality);
        createAllCharts(weather, airQuality, hourlyWeather, hourlyAir);
        console.log("✅ Dashboard updated successfully!");
    } catch (error) {
        console.error("❌ Error:", error);
        showError(error.message || "Failed to load data. Please refresh.");
    } finally {
        showLoading(false);
    }
}

// Get City Coordinates
async function getCoordinates(city) {
    const url = `${API_CONFIG.geocoding}?name=${encodeURIComponent(city)}&count=1`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);
    
    const data = await response.json();
    if (!data.results?.length) throw new Error("City not found");
    
    return data.results[0];
}

// Fetch Weather Data
async function fetchWeatherData(coords) {
    const params = "current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto";
    const url = `${API_CONFIG.weather}?latitude=${coords.latitude}&longitude=${coords.longitude}&${params}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    
    const data = await response.json();
    return {
        temperature: Math.round(data.current.temperature_2m),
        description: getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        cityName: coords.name,
        country: coords.country_code
    };
}

// Fetch Air Quality Data
async function fetchAirQualityData(coords) {
    try {
        const params = "current=pm2_5,us_aqi&timezone=auto";
        const url = `${API_CONFIG.airQuality}?latitude=${coords.latitude}&longitude=${coords.longitude}&${params}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Air Quality API error: ${response.status}`);
        
        const data = await response.json();
        if (!data.current?.pm2_5) {
            return { pm25: null, aqi: null, status: "No air quality data available" };
        }

        const pm25 = Math.round(data.current.pm2_5);
        const aqi = data.current.us_aqi ? Math.round(data.current.us_aqi) : calculateAQI(pm25);
        
        return { pm25, aqi, status: getAQIStatus(aqi) };
    } catch (error) {
        console.warn("Air quality data unavailable:", error.message);
        return { pm25: null, aqi: null, status: "Air quality data not available" };
    }
}

// Fetch Hourly Data
async function fetchHourlyData(coords, type) {
    try {
        let url, params;
        if (type === "weather") {
            params = "hourly=temperature_2m,weather_code&forecast_days=1&timezone=auto";
            url = `${API_CONFIG.weather}?latitude=${coords.latitude}&longitude=${coords.longitude}&${params}`;
        } else {
            params = "hourly=pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide&forecast_days=1&timezone=auto";
            url = `${API_CONFIG.airQuality}?latitude=${coords.latitude}&longitude=${coords.longitude}&${params}`;
        }
        
        const response = await fetch(url);
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.warn(`Hourly ${type} data unavailable:`, error.message);
        return null;
    }
}

// Weather Code to Description Mapping
function getWeatherDescription(code) {
    const codes = {
        0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
        45: "foggy", 48: "depositing rime fog", 51: "light drizzle", 53: "moderate drizzle",
        55: "dense drizzle", 61: "slight rain", 63: "moderate rain", 65: "heavy rain",
        71: "slight snow", 73: "moderate snow", 75: "heavy snow", 80: "slight rain showers",
        81: "moderate rain showers", 82: "violent rain showers", 85: "slight snow showers",
        86: "heavy snow showers", 95: "thunderstorm"
    };
    return codes[code] || "unknown";
}

// AQI Calculations
function calculateAQI(pm25) {
    if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
    if (pm25 <= 35.4) return Math.round(50 + ((pm25 - 12) / 23.4) * 50);
    if (pm25 <= 55.4) return Math.round(100 + ((pm25 - 35.4) / 20) * 50);
    if (pm25 <= 150.4) return Math.round(150 + ((pm25 - 55.4) / 95) * 50);
    return Math.round(200 + ((pm25 - 150.4) / 49.6) * 100);
}

function getAQIStatus(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    return "Very Unhealthy";
}

function getStatusClass(status) {
    if (status.includes("Good")) return "status-good";
    if (status.includes("Moderate")) return "status-moderate";
    return "status-unhealthy";
}

// Display Functions
function displayData(weather, airQuality) {
    displayWeatherInfo(weather);
    displayAirQuality(airQuality);
}

function displayWeatherInfo(data) {
    const weatherInfoDiv = document.getElementById("weatherInfo");
    weatherInfoDiv.innerHTML = `
        <div class="weather-info">
            <div class="weather-item">
                <span class="label">City:</span>
                <span class="value">${data.cityName}, ${data.country}</span>
            </div>
            <div class="weather-item">
                <span class="label">Temperature:</span>
                <span class="value temperature">${data.temperature}°C</span>
            </div>
            <div class="weather-item">
                <span class="label">Description:</span>
                <span class="value">${capitalizeFirst(data.description)}</span>
            </div>
            <div class="weather-item">
                <span class="label">Humidity:</span>
                <span class="value">${data.humidity}%</span>
            </div>
            <div class="weather-item">
                <span class="label">Wind Speed:</span>
                <span class="value">${data.windSpeed} m/s</span>
            </div>
        </div>
    `;
}

function displayAirQuality(data) {
    const airQualityInfoDiv = document.getElementById("airQualityInfo");
    
    if (!data.pm25) {
        airQualityInfoDiv.innerHTML = `<div class="air-quality-info"><p class="placeholder">${data.status}</p></div>`;
        return;
    }

    const statusClass = getStatusClass(data.status);
    airQualityInfoDiv.innerHTML = `
        <div class="air-quality-info">
            <div class="aqi-container">
                <div class="aqi-value">${data.aqi}</div>
                <div class="aqi-status ${statusClass}">${data.status}</div>
            </div>
            <div class="pm25-item">
                <span class="label">PM2.5:</span>
                <span class="value">${data.pm25} μg/m³</span>
            </div>
        </div>
    `;
}

// Chart Creation Functions
function createAllCharts(weather, airQuality, hourlyWeather, hourlyAir) {
    createChart(weather, airQuality);
    createPieChart("airQualityPieChart", getAirQualityPieData(airQuality, hourlyAir), "Air Quality Composition");
    createPieChart("weatherPieChart", getWeatherPieData(hourlyWeather), "Weather Conditions (24h)");
    createLineChart("airQualityLineChart", getAirQualityLineData(hourlyAir), "PM2.5 Trend", "rgba(244, 67, 54, 1)");
    createLineChart("temperatureLineChart", getTemperatureLineData(hourlyWeather), "Temperature Trend", "rgba(33, 150, 243, 1)");
}

function createChart(weather, airQuality) {
    const ctx = document.getElementById("dataChart");
    if (charts.dataChart) charts.dataChart.destroy();

    const labels = ["Temperature (°C)", "Humidity (%)", "Wind Speed (m/s)"];
    const values = [weather.temperature, weather.humidity, weather.windSpeed];
    const colors = ["rgba(33, 150, 243, 0.8)", "rgba(76, 175, 80, 0.8)", "rgba(255, 152, 0, 0.8)"];

    if (airQuality.pm25) {
        labels.push("PM2.5 (μg/m³)");
        values.push(airQuality.pm25);
        colors.push("rgba(244, 67, 54, 0.8)");
    }

    charts.dataChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Values",
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace("0.8", "1")),
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "City Data Comparison", font: { size: 18, weight: "bold" } }
            },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

function createPieChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !data) return;
    
    if (charts[canvasId]) charts[canvasId].destroy();

    charts[canvasId] = new Chart(ctx, {
        type: "pie",
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: title }
            }
        }
    });
}

function createLineChart(canvasId, data, title, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !data) return;
    
    if (charts[canvasId]) charts[canvasId].destroy();

    charts[canvasId] = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: data.label,
                data: data.values,
                borderColor: color,
                backgroundColor: color.replace("1)", "0.1)"),
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: title }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: data.yLabel } },
                x: { title: { display: true, text: "Time (Hours)" } }
            }
        }
    });
}

// Chart Data Preparation Functions
function getAirQualityPieData(current, hourly) {
    let pm25 = 0, pm10 = 0, ozone = 0, no2 = 0, co = 0;

    if (hourly?.hourly) {
        const h = hourly.hourly;
        pm25 = h.pm2_5?.[0] || 0;
        pm10 = h.pm10?.[0] || 0;
        ozone = h.ozone?.[0] || 0;
        no2 = h.nitrogen_dioxide?.[0] || 0;
        co = h.carbon_monoxide?.[0] || 0;
    } else if (current?.pm25) {
        pm25 = current.pm25;
    }

    if (pm25 === 0 && pm10 === 0 && ozone === 0 && no2 === 0 && co === 0) return null;

    return {
        labels: ["PM2.5", "PM10", "Ozone", "NO2", "CO"],
        datasets: [{
            data: [pm25, pm10, ozone, no2, co],
            backgroundColor: [
                "rgba(244, 67, 54, 0.8)", "rgba(255, 152, 0, 0.8)", "rgba(33, 150, 243, 0.8)",
                "rgba(76, 175, 80, 0.8)", "rgba(156, 39, 176, 0.8)"
            ],
            borderWidth: 2
        }]
    };
}

function getWeatherPieData(hourly) {
    if (!hourly?.hourly?.weather_code) return null;

    const codes = hourly.hourly.weather_code.slice(0, 24);
    const counts = { Clear: 0, Cloudy: 0, Rainy: 0, Foggy: 0, Other: 0 };

    codes.forEach(code => {
        if (code <= 1) counts.Clear++;
        else if (code <= 3) counts.Cloudy++;
        else if (code >= 61 && code <= 82) counts.Rainy++;
        else if (code === 45 || code === 48) counts.Foggy++;
        else counts.Other++;
    });

    const labels = [], values = [];
    Object.entries(counts).forEach(([key, value]) => {
        if (value > 0) {
            labels.push(key);
            values.push(value);
        }
    });

    return {
        labels,
        datasets: [{
            data: values,
            backgroundColor: [
                "rgba(255, 193, 7, 0.8)", "rgba(158, 158, 158, 0.8)", "rgba(33, 150, 243, 0.8)",
                "rgba(189, 189, 189, 0.8)", "rgba(117, 117, 117, 0.8)"
            ],
            borderWidth: 2
        }]
    };
}

function getAirQualityLineData(hourly) {
    if (!hourly?.hourly?.pm2_5) return null;

    const times = hourly.hourly.time.slice(0, 24);
    const values = hourly.hourly.pm2_5.slice(0, 24);
    const labels = times.map(time => new Date(time).getHours() + ":00");

    return { labels, values, label: "PM2.5 (μg/m³)", yLabel: "PM2.5 (μg/m³)" };
}

function getTemperatureLineData(hourly) {
    if (!hourly?.hourly?.temperature_2m) return null;

    const times = hourly.hourly.time.slice(0, 24);
    const values = hourly.hourly.temperature_2m.slice(0, 24);
    const labels = times.map(time => new Date(time).getHours() + ":00");

    return { labels, values, label: "Temperature (°C)", yLabel: "Temperature (°C)" };
}

// UI Helper Functions
function showLoading(show) {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = show ? "block" : "none";
}

function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add("show");
    }
}

function hideError() {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) errorDiv.classList.remove("show");
}

function clearDashboard() {
    const weatherInfo = document.getElementById("weatherInfo");
    const airQualityInfo = document.getElementById("airQualityInfo");
    
    if (weatherInfo) weatherInfo.innerHTML = '<p class="placeholder">Loading...</p>';
    if (airQualityInfo) airQualityInfo.innerHTML = '<p class="placeholder">Loading...</p>';

    Object.values(charts).forEach(chart => chart?.destroy());
    charts = {};
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Theme Functions
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
    
    console.log("Theme switched to:", newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const root = document.documentElement;
    
    root.setAttribute("data-theme", savedTheme);
    
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
}
