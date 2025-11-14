// ====================
// CONFIGURATION
// ====================
// Using Open-Meteo API - 100% Free, No API Key Needed!
const OPENWEATHER_API_KEY = ""; // Not needed for Open-Meteo
const OPENWEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Fixed city - Bangalore
const CITY_NAME = "Bangalore";

// Chart.js instances (global variables)
let dataChart = null;
let airQualityPieChart = null;
let airQualityLineChart = null;
let weatherPieChart = null;
let temperatureLineChart = null;

// ====================
// INITIALIZATION
// ====================
// When page loads, fetch data for Bangalore
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Dashboard loaded! Fetching data for Bangalore...");
  // Load saved theme preference
  loadTheme();
  // Load Bangalore data automatically
  fetchCityData();
  // Update time display
  updateTime();
  setInterval(updateTime, 1000);
});

/**
 * Updates the current time display in header
 */
function updateTime() {
  const timeElement = document.getElementById("currentTime");
  if (timeElement) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const timeString = `${String(displayHours).padStart(
      2,
      "0"
    )}:${minutes}:${seconds} ${ampm}`;
    timeElement.textContent = timeString;
  }
}

// ====================
// MAIN FUNCTION: FETCH ALL CITY DATA
// ====================
/**
 * Main function that fetches weather and air quality data for Bangalore
 * Called automatically when page loads
 */
async function fetchCityData() {
  // Step 1: Show loading spinner
  showLoading(true);
  hideError();

  // Step 2: Clear previous data
  clearDashboard();

  try {
    // Step 3: First get city coordinates (needed for both weather and air quality)
    console.log("📍 Step 1: Fetching coordinates for", CITY_NAME);
    const geoUrl = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(
      CITY_NAME
    )}&count=1`;
    console.log("🌐 Geocoding API URL:", geoUrl);
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    console.log("✅ Geocoding API Response:", geoData);

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the city name.");
    }

    const { latitude, longitude } = geoData.results[0];
    console.log(`📍 Coordinates found: ${latitude}, ${longitude}`);

    // Step 4: Fetch weather and air quality data in parallel using coordinates
    console.log("🌡️ Step 2: Fetching weather and air quality data...");
    const [
      weatherData,
      airQualityData,
      hourlyWeatherData,
      hourlyAirQualityData,
    ] = await Promise.all([
      fetchWeatherDataWithCoords(latitude, longitude, geoData.results[0]),
      fetchAirQualityData(latitude, longitude),
      fetchHourlyWeatherData(latitude, longitude),
      fetchHourlyAirQualityData(latitude, longitude),
    ]);

    console.log("✅ Weather Data Received:", weatherData);
    console.log("✅ Air Quality Data Received:", airQualityData);

    // Step 4: Display the data
    console.log("📊 Step 3: Displaying data on dashboard...");
    displayWeatherInfo(weatherData);
    displayAirQuality(airQualityData);
    createChart(weatherData, airQualityData);

    // Step 5: Create new charts
    console.log("📈 Step 4: Creating additional charts...");
    createAirQualityPieChart(airQualityData, hourlyAirQualityData);
    createAirQualityLineChart(hourlyAirQualityData);
    createWeatherPieChart(hourlyWeatherData);
    createTemperatureLineChart(hourlyWeatherData);

    console.log("✅ Dashboard updated successfully!");
  } catch (error) {
    // Step 5: Handle errors
    console.error("❌ Error fetching city data:", error);
    showError(
      error.message || "Failed to fetch data. Please try refreshing the page."
    );
  } finally {
    // Step 6: Hide loading spinner
    showLoading(false);
  }
}

// ====================
// SECTION: WEATHER DATA
// ====================
// Purpose: Fetch weather from Open-Meteo API (Free, No API Key!)
// Input: city name (string)
// Output: temperature, humidity, wind speed, description

/**
 * Fetches weather data from Open-Meteo API using coordinates (Free, No API Key!)
 * @param {number} latitude - Latitude of the city
 * @param {number} longitude - Longitude of the city
 * @param {object} geoResult - Geocoding result with city name and country
 * @returns {object} Weather data object
 */
async function fetchWeatherDataWithCoords(latitude, longitude, geoResult) {
  try {
    // Get weather data using coordinates from real API
    const url = `${OPENWEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    console.log("🌡️ Weather API URL:", url);
    const response = await fetch(url);
    console.log("🌡️ Weather API Response Status:", response.status);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    // Convert response to JSON - REAL API DATA ONLY
    const data = await response.json();
    console.log("🌡️ Weather API Raw Data:", data);

    // Return formatted data from real API
    return {
      temperature: Math.round(data.current.temperature_2m),
      description: getWeatherDescription(data.current.weather_code),
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      cityName: geoResult.name,
      country: geoResult.country_code,
    };
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/**
 * Converts Open-Meteo weather code to description
 * @param {number} code - Weather code from Open-Meteo
 * @returns {string} Weather description
 */
function getWeatherDescription(code) {
  const codes = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "foggy",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
  };
  return codes[code] || "unknown";
}

/**
 * Displays weather information in the weather card
 * @param {object} data - Weather data object
 */
function displayWeatherInfo(data) {
  const weatherInfoDiv = document.getElementById("weatherInfo");

  // Create HTML content
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

// ====================
// SECTION: AIR QUALITY DATA
// ====================
// Purpose: Fetch air quality from Open-Meteo Air Quality API (Free, No API Key!)
// Input: latitude and longitude (numbers)
// Output: PM2.5 value and AQI status from real API

/**
 * Fetches air quality data from Open-Meteo Air Quality API (Free, No API Key!)
 * @param {number} latitude - Latitude of the city
 * @param {number} longitude - Longitude of the city
 * @returns {object} Air quality data object from real API
 */
async function fetchAirQualityData(latitude, longitude) {
  try {
    // Fetch real air quality data from Open-Meteo API
    const url = `${AIR_QUALITY_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=pm2_5,us_aqi&timezone=auto`;
    console.log("🌬️ Air Quality API URL:", url);
    const response = await fetch(url);
    console.log("🌬️ Air Quality API Response Status:", response.status);

    if (!response.ok) {
      throw new Error(`Air Quality API error: ${response.status}`);
    }

    // Convert response to JSON - REAL API DATA ONLY
    const data = await response.json();
    console.log("🌬️ Air Quality API Raw Data:", data);

    // Extract PM2.5 and AQI from real API response
    if (
      !data.current ||
      data.current.pm2_5 === null ||
      data.current.pm2_5 === undefined
    ) {
      return {
        pm25: null,
        aqi: null,
        status: "No air quality data available for this location",
      };
    }

    // Get real PM2.5 value from API
    const pm25 = Math.round(data.current.pm2_5);

    // Use US AQI from API if available, otherwise calculate it
    let aqi = data.current.us_aqi;
    if (!aqi || aqi === null) {
      aqi = calculateAQI(pm25);
    } else {
      aqi = Math.round(aqi);
    }

    const status = getAQIStatus(aqi);

    // Return real API data
    return {
      pm25: pm25,
      aqi: aqi,
      status: status,
    };
  } catch (error) {
    // Log error but don't break the app
    console.warn("Air quality data not available:", error.message);
    return {
      pm25: null,
      aqi: null,
      status: "Air quality data not available",
    };
  }
}

/**
 * Displays air quality information in the air quality card
 * @param {object} data - Air quality data object
 */
function displayAirQuality(data) {
  const airQualityInfoDiv = document.getElementById("airQualityInfo");

  if (!data.pm25) {
    airQualityInfoDiv.innerHTML = `
            <div class="air-quality-info">
                <p class="placeholder">${data.status}</p>
            </div>
        `;
    return;
  }

  // Determine status class for styling
  const statusClass = getStatusClass(data.status);

  // Create HTML content - AQI and status side by side, PM2.5 on right
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

/**
 * Calculates Air Quality Index (AQI) from PM2.5 value
 * Simplified AQI calculation for educational purposes
 * @param {number} pm25 - PM2.5 value in μg/m³
 * @returns {number} AQI value
 */
function calculateAQI(pm25) {
  // Simplified AQI calculation
  // Real AQI calculation is more complex, but this gives a good approximation
  if (pm25 <= 12) {
    return Math.round((pm25 / 12) * 50); // Good (0-50)
  } else if (pm25 <= 35.4) {
    return Math.round(50 + ((pm25 - 12) / 23.4) * 50); // Moderate (51-100)
  } else if (pm25 <= 55.4) {
    return Math.round(100 + ((pm25 - 35.4) / 20) * 50); // Unhealthy for Sensitive (101-150)
  } else if (pm25 <= 150.4) {
    return Math.round(150 + ((pm25 - 55.4) / 95) * 50); // Unhealthy (151-200)
  } else {
    return Math.round(200 + ((pm25 - 150.4) / 49.6) * 100); // Very Unhealthy (201-300+)
  }
}

/**
 * Gets AQI status text based on AQI value
 * @param {number} aqi - AQI value
 * @returns {string} Status text
 */
function getAQIStatus(aqi) {
  if (aqi <= 50) {
    return "Good";
  } else if (aqi <= 100) {
    return "Moderate";
  } else if (aqi <= 150) {
    return "Unhealthy for Sensitive Groups";
  } else if (aqi <= 200) {
    return "Unhealthy";
  } else {
    return "Very Unhealthy";
  }
}

/**
 * Gets CSS class name for AQI status
 * @param {string} status - Status text
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
  if (status.includes("Good")) {
    return "status-good";
  } else if (status.includes("Moderate")) {
    return "status-moderate";
  } else {
    return "status-unhealthy";
  }
}

// ====================
// SECTION: CHART.JS VISUALIZATION
// ====================
// Purpose: Create bar chart showing temperature, humidity, and wind speed
// Uses Chart.js library (loaded via CDN in HTML)

/**
 * Creates a bar chart using Chart.js
 * Shows temperature, humidity, and wind speed
 * @param {object} weatherData - Weather data object
 * @param {object} airQualityData - Air quality data object
 */
function createChart(weatherData, airQualityData) {
  // Get canvas element
  const ctx = document.getElementById("dataChart");

  // Destroy previous chart if it exists
  if (dataChart) {
    dataChart.destroy();
  }

  // Prepare data for chart
  const labels = ["Temperature (°C)", "Humidity (%)", "Wind Speed (m/s)"];
  const values = [
    weatherData.temperature,
    weatherData.humidity,
    weatherData.windSpeed,
  ];

  // Add PM2.5 if available
  if (airQualityData.pm25) {
    labels.push("PM2.5 (μg/m³)");
    values.push(airQualityData.pm25);
  }

  // Color array for bars
  const colors = [
    "rgba(33, 150, 243, 0.8)", // Blue for temperature
    "rgba(76, 175, 80, 0.8)", // Green for humidity
    "rgba(255, 152, 0, 0.8)", // Orange for wind speed
    "rgba(244, 67, 54, 0.8)", // Red for PM2.5
  ];

  // Create new chart
  dataChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Values",
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderColor: colors
            .slice(0, values.length)
            .map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "City Data Comparison",
          font: {
            size: 18,
            weight: "bold",
          },
          color: "#333",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 12,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          ticks: {
            font: {
              size: 12,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// ====================
// SECTION: UI HELPER FUNCTIONS
// ====================
// Purpose: Show/hide loading, errors, and clear dashboard

/**
 * Shows or hides the loading spinner
 * @param {boolean} show - Whether to show the spinner
 */
function showLoading(show) {
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = show ? "block" : "none";
}

// ====================
// SECTION: HOURLY DATA FETCHING
// ====================

/**
 * Fetches hourly weather data for 24 hours
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object} Hourly weather data
 */
async function fetchHourlyWeatherData(latitude, longitude) {
  try {
    const url = `${OPENWEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation&forecast_days=1&timezone=auto`;
    console.log("🌡️ Hourly Weather API URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hourly Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("🌡️ Hourly Weather Data:", data);
    return data;
  } catch (error) {
    console.warn("Hourly weather data not available:", error.message);
    return null;
  }
}

/**
 * Fetches hourly air quality data for 24 hours
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object} Hourly air quality data
 */
async function fetchHourlyAirQualityData(latitude, longitude) {
  try {
    const url = `${AIR_QUALITY_BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide&forecast_days=1&timezone=auto`;
    console.log("🌬️ Hourly Air Quality API URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Hourly Air Quality API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("🌬️ Hourly Air Quality Data:", data);
    return data;
  } catch (error) {
    console.warn("Hourly air quality data not available:", error.message);
    return null;
  }
}

// ====================
// SECTION: CHART CREATION FUNCTIONS
// ====================

/**
 * Creates Air Quality Composition Pie Chart
 * @param {object} currentData - Current air quality data
 * @param {object} hourlyData - Hourly air quality data from API
 */
function createAirQualityPieChart(currentData, hourlyData) {
  const ctx = document.getElementById("airQualityPieChart");
  if (!ctx) return;

  // Destroy previous chart if exists
  if (airQualityPieChart) {
    airQualityPieChart.destroy();
  }

  // Get values from hourly data - use first hour's data or current if available
  let pm25 = 0,
    pm10 = 0,
    ozone = 0,
    no2 = 0,
    co = 0;

  if (hourlyData && hourlyData.hourly) {
    // Use the most recent (first) hour's data
    const hourly = hourlyData.hourly;
    if (hourly.pm2_5 && hourly.pm2_5.length > 0) {
      pm25 = hourly.pm2_5[0] || 0;
    }
    if (hourly.pm10 && hourly.pm10.length > 0) {
      pm10 = hourly.pm10[0] || 0;
    }
    if (hourly.ozone && hourly.ozone.length > 0) {
      ozone = hourly.ozone[0] || 0;
    }
    if (hourly.nitrogen_dioxide && hourly.nitrogen_dioxide.length > 0) {
      no2 = hourly.nitrogen_dioxide[0] || 0;
    }
    if (hourly.carbon_monoxide && hourly.carbon_monoxide.length > 0) {
      co = hourly.carbon_monoxide[0] || 0;
    }
  } else if (hourlyData && hourlyData.current) {
    // Fallback to current data
    pm25 = hourlyData.current.pm2_5 || 0;
    pm10 = hourlyData.current.pm10 || 0;
    ozone = hourlyData.current.ozone || 0;
    no2 = hourlyData.current.nitrogen_dioxide || 0;
    co = hourlyData.current.carbon_monoxide || 0;
  } else if (currentData && currentData.pm25) {
    // Last fallback
    pm25 = currentData.pm25;
  }

  // If all values are 0, don't create chart
  if (pm25 === 0 && pm10 === 0 && ozone === 0 && no2 === 0 && co === 0) {
    console.warn("No air quality composition data available");
    return;
  }

  airQualityPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["PM2.5", "PM10", "Ozone", "NO2", "CO"],
      datasets: [
        {
          data: [pm25, pm10, ozone, no2, co],
          backgroundColor: [
            "rgba(244, 67, 54, 0.8)", // Red for PM2.5
            "rgba(255, 152, 0, 0.8)", // Orange for PM10
            "rgba(33, 150, 243, 0.8)", // Blue for Ozone
            "rgba(76, 175, 80, 0.8)", // Green for NO2
            "rgba(156, 39, 176, 0.8)", // Purple for CO
          ],
          borderColor: [
            "rgba(244, 67, 54, 1)",
            "rgba(255, 152, 0, 1)",
            "rgba(33, 150, 243, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(156, 39, 176, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 8,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.label + ": " + context.parsed.toFixed(2) + " μg/m³"
              );
            },
          },
        },
      },
    },
  });
}

/**
 * Creates PM2.5 Trend Line Chart (24 hours)
 * @param {object} hourlyData - Hourly air quality data from API
 */
function createAirQualityLineChart(hourlyData) {
  if (!hourlyData || !hourlyData.hourly) {
    console.warn("No hourly air quality data for line chart");
    return;
  }

  const ctx = document.getElementById("airQualityLineChart");
  if (!ctx) return;

  // Destroy previous chart if exists
  if (airQualityLineChart) {
    airQualityLineChart.destroy();
  }

  // Get last 24 hours of data
  const times = hourlyData.hourly.time.slice(0, 24);
  const pm25Values = hourlyData.hourly.pm2_5.slice(0, 24);

  // Format time labels (show only hours)
  const timeLabels = times.map((time) => {
    const date = new Date(time);
    return date.getHours() + ":00";
  });

  airQualityLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "PM2.5 (μg/m³)",
          data: pm25Values,
          borderColor: "rgba(244, 67, 54, 1)",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "PM2.5 (μg/m³)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Time (Hours)",
          },
        },
      },
    },
  });
}

/**
 * Creates Weather Conditions Pie Chart
 * @param {object} hourlyData - Hourly weather data from API
 */
function createWeatherPieChart(hourlyData) {
  if (!hourlyData || !hourlyData.hourly) {
    console.warn("No hourly weather data for pie chart");
    return;
  }

  const ctx = document.getElementById("weatherPieChart");
  if (!ctx) return;

  // Destroy previous chart if exists
  if (weatherPieChart) {
    weatherPieChart.destroy();
  }

  // Count weather conditions from last 24 hours
  const weatherCodes = hourlyData.hourly.weather_code.slice(0, 24);
  const conditionCounts = {
    Clear: 0,
    Cloudy: 0,
    Rainy: 0,
    Foggy: 0,
    Other: 0,
  };

  weatherCodes.forEach((code) => {
    if (code === 0 || code === 1) {
      conditionCounts.Clear++;
    } else if (code === 2 || code === 3) {
      conditionCounts.Cloudy++;
    } else if (code >= 61 && code <= 82) {
      conditionCounts.Rainy++;
    } else if (code === 45 || code === 48) {
      conditionCounts.Foggy++;
    } else {
      conditionCounts.Other++;
    }
  });

  weatherPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(conditionCounts).filter(
        (key) => conditionCounts[key] > 0
      ),
      datasets: [
        {
          data: Object.values(conditionCounts).filter((val) => val > 0),
          backgroundColor: [
            "rgba(255, 193, 7, 0.8)", // Yellow for Clear
            "rgba(158, 158, 158, 0.8)", // Gray for Cloudy
            "rgba(33, 150, 243, 0.8)", // Blue for Rainy
            "rgba(189, 189, 189, 0.8)", // Light Gray for Foggy
            "rgba(117, 117, 117, 0.8)", // Dark Gray for Other
          ],
          borderColor: [
            "rgba(255, 193, 7, 1)",
            "rgba(158, 158, 158, 1)",
            "rgba(33, 150, 243, 1)",
            "rgba(189, 189, 189, 1)",
            "rgba(117, 117, 117, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return (
                context.label +
                ": " +
                context.parsed +
                " hours (" +
                percentage +
                "%)"
              );
            },
          },
        },
      },
    },
  });
}

/**
 * Creates Temperature Trend Line Chart (24 hours)
 * @param {object} hourlyData - Hourly weather data from API
 */
function createTemperatureLineChart(hourlyData) {
  if (!hourlyData || !hourlyData.hourly) {
    console.warn("No hourly weather data for temperature chart");
    return;
  }

  const ctx = document.getElementById("temperatureLineChart");
  if (!ctx) return;

  // Destroy previous chart if exists
  if (temperatureLineChart) {
    temperatureLineChart.destroy();
  }

  // Get last 24 hours of data
  const times = hourlyData.hourly.time.slice(0, 24);
  const temperatures = hourlyData.hourly.temperature_2m.slice(0, 24);

  // Format time labels (show only hours)
  const timeLabels = times.map((time) => {
    const date = new Date(time);
    return date.getHours() + ":00";
  });

  temperatureLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          borderColor: "rgba(33, 150, 243, 1)",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Time (Hours)",
          },
        },
      },
    },
  });
}

/**
 * Shows error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.add("show");
}

/**
 * Hides error message
 */
function hideError() {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.classList.remove("show");
}

/**
 * Clears all data from dashboard
 */
function clearDashboard() {
  document.getElementById("weatherInfo").innerHTML =
    '<p class="placeholder">Loading...</p>';
  document.getElementById("airQualityInfo").innerHTML =
    '<p class="placeholder">Loading...</p>';

  // Clear all charts
  if (dataChart) {
    dataChart.destroy();
    dataChart = null;
  }
  if (airQualityPieChart) {
    airQualityPieChart.destroy();
    airQualityPieChart = null;
  }
  if (airQualityLineChart) {
    airQualityLineChart.destroy();
    airQualityLineChart = null;
  }
  if (weatherPieChart) {
    weatherPieChart.destroy();
    weatherPieChart = null;
  }
  if (temperatureLineChart) {
    temperatureLineChart.destroy();
    temperatureLineChart = null;
  }
}

// ====================
// SECTION: UTILITY FUNCTIONS
// ====================

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ====================
// SECTION: THEME TOGGLE
// ====================

/**
 * Toggles between light and dark theme
 */
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Update icon
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
  }

  console.log(`Theme switched to: ${newTheme}`);
}

/**
 * Loads saved theme preference
 */
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const root = document.documentElement;
  root.setAttribute("data-theme", savedTheme);

  // Update icon
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
  }
}
