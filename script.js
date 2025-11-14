// ====================
// CONFIGURATION SECTION
// ====================
/* 
 * CONCEPT: CONSTANTS AND VARIABLES
 * - const: Creates immutable (unchangeable) variables
 * - let: Creates mutable (changeable) variables
 * - Global scope: Variables declared outside functions are accessible everywhere
 */

// API Configuration - Using const because these URLs never change
const OPENWEATHER_API_KEY = ""; // Empty string - Open-Meteo doesn't need API key
const OPENWEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Application Configuration
const CITY_NAME = "Bangalore"; // Fixed city for this dashboard

/* 
 * CONCEPT: GLOBAL VARIABLES
 * - These variables are accessible from any function in the file
 * - Using 'let' because chart instances will change (be reassigned)
 * - Initialized as 'null' (represents "no value")
 */
let dataChart = null;           // Main bar chart instance
let airQualityPieChart = null;  // Air quality pie chart instance
let airQualityLineChart = null; // Air quality line chart instance
let weatherPieChart = null;     // Weather conditions pie chart instance
let temperatureLineChart = null; // Temperature trend line chart instance

// ====================
// INITIALIZATION SECTION
// ====================
/* 
 * CONCEPT: EVENT LISTENERS AND DOM MANIPULATION
 * - document: Represents the entire HTML page
 * - addEventListener(): Listens for specific events (like page loading)
 * - DOMContentLoaded: Event that fires when HTML is fully loaded
 * - Anonymous function: Function without a name, defined inline
 */

// Wait for HTML page to fully load before running JavaScript
document.addEventListener("DOMContentLoaded", function () {
  /* 
   * CONCEPT: CONSOLE LOGGING
   * - console.log(): Prints messages to browser's developer console
   * - Useful for debugging and tracking program flow
   */
  console.log("🚀 Dashboard loaded! Fetching data for Bangalore...");
  
  /* 
   * CONCEPT: FUNCTION CALLS
   * - Functions are called by writing functionName()
   * - These functions are defined later in the file
   */
  loadTheme();      // Load user's preferred theme (dark/light)
  fetchCityData();  // Get weather and air quality data
  updateTime();     // Show current time
  
  /* 
   * CONCEPT: SETINTERVAL
   * - setInterval(): Repeatedly calls a function at specified intervals
   * - 1000 milliseconds = 1 second
   * - Updates time display every second
   */
  setInterval(updateTime, 1000);
});

/* 
 * CONCEPT: FUNCTION DECLARATION
 * - function keyword creates a reusable block of code
 * - JSDoc comments document what the function does
 * - Functions can be called from anywhere in the code
 */
/**
 * Updates the current time display in header
 * CONCEPTS DEMONSTRATED: DOM manipulation, Date object, string methods
 */
function updateTime() {
  /* 
   * CONCEPT: DOM ELEMENT SELECTION
   * - document.getElementById(): Finds HTML element by its ID attribute
   * - Returns null if element doesn't exist
   */
  const timeElement = document.getElementById("currentTime");
  
  /* 
   * CONCEPT: CONDITIONAL STATEMENTS (IF)
   * - if (condition): Executes code only if condition is true
   * - Prevents errors if element doesn't exist
   */
  if (timeElement) {
    /* 
     * CONCEPT: DATE OBJECT
     * - new Date(): Creates object representing current date/time
     * - Built-in JavaScript object for working with dates
     */
    const now = new Date();
    
    /* 
     * CONCEPT: OBJECT METHODS
     * - Methods are functions that belong to objects
     * - getHours(), getMinutes(), getSeconds() extract time components
     */
    const hours = now.getHours();     // 0-23 format
    const minutes = now.getMinutes(); // 0-59
    const seconds = now.getSeconds(); // 0-59
    
    /* 
     * CONCEPT: STRING METHODS AND TYPE CONVERSION
     * - String(): Converts number to string
     * - padStart(): Adds characters to beginning of string
     * - Ensures two-digit format (e.g., "09" instead of "9")
     */
    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(seconds).padStart(2, "0");

    /* 
     * CONCEPT: TERNARY OPERATOR
     * - condition ? valueIfTrue : valueIfFalse
     * - Shorter way to write simple if-else statements
     */
    const ampm = hours >= 12 ? "pm" : "am";
    
    /* 
     * CONCEPT: MATHEMATICAL OPERATORS
     * - % (modulo): Returns remainder after division
     * - || (logical OR): Returns first truthy value
     * - Converts 24-hour to 12-hour format
     */
    const displayHours = hours % 12 || 12; // 0 becomes 12
    
    /* 
     * CONCEPT: TEMPLATE LITERALS
     * - Backticks (`) allow embedding variables in strings
     * - ${variable} syntax inserts variable values
     * - More readable than string concatenation
     */
    const timeString = `${String(displayHours).padStart(2, "0")}:${minutesStr}:${secondsStr} ${ampm}`;
    
    /* 
     * CONCEPT: DOM CONTENT MANIPULATION
     * - textContent: Sets the text inside an HTML element
     * - Updates what user sees on the webpage
     */
    timeElement.textContent = timeString;
  }
}

// ====================
// MAIN FUNCTION: FETCH ALL CITY DATA
// ====================
/* 
 * CONCEPT: ASYNC/AWAIT AND PROMISES
 * - async: Makes function return a Promise
 * - await: Pauses function until Promise resolves
 * - Allows writing asynchronous code that looks synchronous
 */
/**
 * Main function that fetches weather and air quality data for Bangalore
 * CONCEPTS DEMONSTRATED: async/await, API calls, error handling, destructuring
 */
async function fetchCityData() {
  /* 
   * CONCEPT: FUNCTION CALLS WITH PARAMETERS
   * - Functions can accept input values (parameters)
   * - true/false are boolean values
   */
  showLoading(true);  // Show spinner (true = show)
  hideError();        // Hide any previous error messages
  clearDashboard();   // Clear old data from screen

  /* 
   * CONCEPT: TRY-CATCH-FINALLY
   * - try: Code that might fail
   * - catch: Handles errors if they occur
   * - finally: Always runs, regardless of success/failure
   */
  try {
    // Step 1: Get city coordinates
    console.log("📍 Step 1: Fetching coordinates for", CITY_NAME);
    
    /* 
     * CONCEPT: TEMPLATE LITERALS AND URL ENCODING
     * - Template literals: Use backticks for string interpolation
     * - encodeURIComponent(): Makes text safe for URLs
     * - Handles special characters in city names
     */
    const geoUrl = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(CITY_NAME)}&count=1`;
    console.log("🌐 Geocoding API URL:", geoUrl);
    
    /* 
     * CONCEPT: FETCH API AND AWAIT
     * - fetch(): Makes HTTP requests to APIs
     * - await: Waits for the request to complete
     * - Returns a Response object
     */
    const geoResponse = await fetch(geoUrl);

    /* 
     * CONCEPT: ERROR HANDLING AND HTTP STATUS
     * - response.ok: true if HTTP status is 200-299
     * - throw: Creates an error that stops execution
     * - Error object: Built-in way to represent errors
     */
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status}`);
    }

    /* 
     * CONCEPT: JSON PARSING
     * - .json(): Converts response text to JavaScript object
     * - await: Required because parsing is asynchronous
     */
    const geoData = await geoResponse.json();
    console.log("✅ Geocoding API Response:", geoData);

    /* 
     * CONCEPT: OBJECT PROPERTY ACCESS AND VALIDATION
     * - Dot notation: object.property
     * - Array length: array.length
     * - Logical operators: ! (NOT), || (OR)
     */
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the city name.");
    }

    /* 
     * CONCEPT: DESTRUCTURING ASSIGNMENT
     * - Extracts properties from objects into variables
     * - const { prop1, prop2 } = object;
     * - Cleaner than: const latitude = geoData.results[0].latitude;
     */
    const { latitude, longitude } = geoData.results[0];
    console.log(`📍 Coordinates found: ${latitude}, ${longitude}`);

    // Step 2: Fetch all data in parallel
    console.log("🌡️ Step 2: Fetching weather and air quality data...");
    
    /* 
     * CONCEPT: PROMISE.ALL AND ARRAY DESTRUCTURING
     * - Promise.all(): Runs multiple async operations simultaneously
     * - Array destructuring: [var1, var2] = array;
     * - Much faster than running requests one by one
     */
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

    // Step 3: Display all the data on webpage
    console.log("📊 Step 3: Displaying data on dashboard...");
    displayWeatherInfo(weatherData);           // Show weather in UI
    displayAirQuality(airQualityData);         // Show air quality in UI
    createChart(weatherData, airQualityData);  // Create main bar chart

    // Step 4: Create additional charts
    console.log("📈 Step 4: Creating additional charts...");
    createAirQualityPieChart(airQualityData, hourlyAirQualityData);
    createAirQualityLineChart(hourlyAirQualityData);
    createWeatherPieChart(hourlyWeatherData);
    createTemperatureLineChart(hourlyWeatherData);

    console.log("✅ Dashboard updated successfully!");
    
  } catch (error) {
    /* 
     * CONCEPT: ERROR HANDLING
     * - catch block runs if any error occurs in try block
     * - console.error(): Logs errors (shows in red in console)
     * - error.message: Gets the error description
     */
    console.error("❌ Error fetching city data:", error);
    showError(
      error.message || "Failed to fetch data. Please try refreshing the page."
    );
  } finally {
    /* 
     * CONCEPT: FINALLY BLOCK
     * - Always executes, whether try succeeds or catch runs
     * - Perfect for cleanup tasks like hiding loading spinners
     */
    showLoading(false); // Hide spinner regardless of success/failure
  }
}

// ====================
// WEATHER DATA FUNCTIONS
// ====================
/* 
 * CONCEPT: FUNCTION PARAMETERS AND RETURN VALUES
 * - Parameters: Input values passed to functions
 * - Return: Output value sent back to caller
 * - JSDoc: Special comments that document parameter types
 */

/**
 * Fetches weather data from Open-Meteo API using coordinates
 * CONCEPTS DEMONSTRATED: Parameters, API calls, object creation, Math methods
 */
async function fetchWeatherDataWithCoords(latitude, longitude, geoResult) {
  try {
    /* 
     * CONCEPT: QUERY PARAMETERS IN URLS
     * - ? starts query parameters
     * - & separates multiple parameters
     * - API specifies what data we want (temperature, humidity, etc.)
     */
    const url = `${OPENWEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    console.log("🌡️ Weather API URL:", url);
    
    // Make HTTP request to weather API
    const response = await fetch(url);
    console.log("🌡️ Weather API Response Status:", response.status);

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    // Parse JSON response into JavaScript object
    const data = await response.json();
    console.log("🌡️ Weather API Raw Data:", data);

    /* 
     * CONCEPT: OBJECT CREATION AND RETURN
     * - Creating object with specific properties
     * - Math.round(): Rounds decimal numbers to integers
     * - Function calls within object creation
     * - Accessing nested object properties (data.current.temperature_2m)
     */
    return {
      temperature: Math.round(data.current.temperature_2m),  // Round 23.7 to 24
      description: getWeatherDescription(data.current.weather_code), // Convert code to text
      humidity: data.current.relative_humidity_2m,           // Percentage
      windSpeed: data.current.wind_speed_10m,               // Meters per second
      cityName: geoResult.name,                             // From geocoding
      country: geoResult.country_code,                      // Country code
    };
  } catch (error) {
    /* 
     * CONCEPT: ERROR PROPAGATION
     * - Re-throwing errors with additional context
     * - Template literals in error messages
     */
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/* 
 * CONCEPT: OBJECT LITERALS AND BRACKET NOTATION
 * - Object literal: { key: value } syntax
 * - Bracket notation: object[key] for dynamic property access
 * - Logical OR (||): Provides default value if key doesn't exist
 */
/**
 * Converts Open-Meteo weather code to human-readable description
 * CONCEPTS DEMONSTRATED: Object literals, bracket notation, default values
 */
function getWeatherDescription(code) {
  /* 
   * CONCEPT: OBJECT AS LOOKUP TABLE
   * - Objects can store key-value pairs
   * - Keys are weather codes (numbers)
   * - Values are descriptions (strings)
   * - More efficient than long if-else chains
   */
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
  
  /* 
   * CONCEPT: BRACKET NOTATION AND DEFAULT VALUES
   * - codes[code]: Looks up description using weather code
   * - || "unknown": If code not found, return "unknown"
   * - Prevents undefined errors
   */
  return codes[code] || "unknown";
}

/**
 * Displays weather information in the weather card
 * CONCEPTS DEMONSTRATED: DOM manipulation, template literals, innerHTML
 */
function displayWeatherInfo(data) {
  /* 
   * CONCEPT: DOM ELEMENT SELECTION
   * - getElementById(): Finds element by ID
   * - Stores reference for manipulation
   */
  const weatherInfoDiv = document.getElementById("weatherInfo");

  /* 
   * CONCEPT: INNERHTML AND TEMPLATE LITERALS
   * - innerHTML: Sets HTML content inside element
   * - Template literals: Multi-line strings with ${} interpolation
   * - Creates structured HTML dynamically
   */
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
// AIR QUALITY FUNCTIONS
// ====================

/**
 * Fetches air quality data from Open-Meteo Air Quality API
 * CONCEPTS DEMONSTRATED: API calls, error handling, conditional returns
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

    const data = await response.json();
    console.log("🌬️ Air Quality API Raw Data:", data);

    /* 
     * CONCEPT: NULL/UNDEFINED CHECKING
     * - Checking if data exists before using it
     * - null and undefined represent "no value"
     * - Prevents runtime errors
     */
    if (!data.current || data.current.pm2_5 === null || data.current.pm2_5 === undefined) {
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
 * CONCEPTS DEMONSTRATED: Conditional rendering, CSS classes
 */
function displayAirQuality(data) {
  const airQualityInfoDiv = document.getElementById("airQualityInfo");

  /* 
   * CONCEPT: EARLY RETURN PATTERN
   * - Check for invalid data first
   * - Return early to avoid complex nested if statements
   * - Makes code more readable
   */
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

/* 
 * CONCEPT: MATHEMATICAL CALCULATIONS AND CONDITIONALS
 * - Complex if-else chains for different ranges
 * - Mathematical formulas for AQI calculation
 * - Rounding numbers with Math.round()
 */
/**
 * Calculates Air Quality Index (AQI) from PM2.5 value
 * CONCEPTS DEMONSTRATED: Complex conditionals, mathematical operations
 */
function calculateAQI(pm25) {
  // Simplified AQI calculation
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
 * CONCEPTS DEMONSTRATED: Range checking with if-else
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
 * CONCEPTS DEMONSTRATED: String methods, conditional logic
 */
function getStatusClass(status) {
  /* 
   * CONCEPT: STRING METHODS
   * - includes(): Checks if string contains substring
   * - Case-sensitive matching
   */
  if (status.includes("Good")) {
    return "status-good";
  } else if (status.includes("Moderate")) {
    return "status-moderate";
  } else {
    return "status-unhealthy";
  }
}

// ====================
// CHART.JS VISUALIZATION
// ====================
/* 
 * CONCEPT: EXTERNAL LIBRARIES
 * - Chart.js: External library for creating charts
 * - Loaded via CDN in HTML file
 * - Provides Chart constructor and methods
 */

/**
 * Creates a bar chart using Chart.js
 * CONCEPTS DEMONSTRATED: Object configuration, array methods, Chart.js API
 */
function createChart(weatherData, airQualityData) {
  // Get canvas element
  const ctx = document.getElementById("dataChart");

  /* 
   * CONCEPT: OBJECT CLEANUP
   * - Destroy previous chart instance to prevent memory leaks
   * - Check if object exists before calling methods
   */
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

  /* 
   * CONCEPT: CONDITIONAL ARRAY MANIPULATION
   * - Adding elements to arrays based on conditions
   * - push(): Adds elements to end of array
   */
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

  /* 
   * CONCEPT: OBJECT INSTANTIATION AND CONFIGURATION
   * - new Chart(): Creates new chart instance
   * - Complex configuration object
   * - Nested objects for different chart options
   */
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
// UI HELPER FUNCTIONS
// ====================

/**
 * Shows or hides the loading spinner
 * CONCEPTS DEMONSTRATED: DOM style manipulation, boolean parameters
 */
function showLoading(show) {
  const spinner = document.getElementById("loadingSpinner");
  /* 
   * CONCEPT: TERNARY OPERATOR FOR STYLE CHANGES
   * - Conditional CSS property assignment
   * - show ? "block" : "none" sets display property
   */
  spinner.style.display = show ? "block" : "none";
}

/**
 * Shows error message to user
 * CONCEPTS DEMONSTRATED: DOM manipulation, CSS classes
 */
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  /* 
   * CONCEPT: CSS CLASS MANIPULATION
   * - classList.add(): Adds CSS class to element
   * - Used for showing/hiding elements with CSS transitions
   */
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
 * CONCEPTS DEMONSTRATED: Multiple DOM updates, object cleanup
 */
function clearDashboard() {
  document.getElementById("weatherInfo").innerHTML = '<p class="placeholder">Loading...</p>';
  document.getElementById("airQualityInfo").innerHTML = '<p class="placeholder">Loading...</p>';

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
// UTILITY FUNCTIONS
// ====================

/**
 * Capitalizes the first letter of a string
 * CONCEPTS DEMONSTRATED: String methods, concatenation
 */
function capitalizeFirst(str) {
  /* 
   * CONCEPT: STRING METHODS
   * - charAt(0): Gets first character
   * - toUpperCase(): Converts to uppercase
   * - slice(1): Gets rest of string from index 1
   * - String concatenation with +
   */
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ====================
// THEME TOGGLE FUNCTIONS
// ====================

/**
 * Toggles between light and dark theme
 * CONCEPTS DEMONSTRATED: DOM attributes, localStorage, conditional logic
 */
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  /* 
   * CONCEPT: DOM ATTRIBUTES AND LOCAL STORAGE
   * - setAttribute(): Sets HTML attribute
   * - localStorage: Browser storage that persists between sessions
   * - setItem(): Saves data to localStorage
   */
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
 * CONCEPTS DEMONSTRATED: localStorage retrieval, default values
 */
function loadTheme() {
  /* 
   * CONCEPT: LOCAL STORAGE RETRIEVAL
   * - getItem(): Gets data from localStorage
   * - || "dark": Default value if nothing saved
   */
  const savedTheme = localStorage.getItem("theme") || "dark";
  const root = document.documentElement;
  root.setAttribute("data-theme", savedTheme);

  // Update icon
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
  }
}

// ====================
// ADDITIONAL CHART FUNCTIONS (Simplified for brevity)
// ====================

/**
 * Fetches hourly weather data for 24 hours
 */
async function fetchHourlyWeatherData(latitude, longitude) {
  try {
    const url = `${OPENWEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Hourly Weather API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Hourly weather data not available:", error.message);
    return null;
  }
}

/**
 * Fetches hourly air quality data for 24 hours
 */
async function fetchHourlyAirQualityData(latitude, longitude) {
  try {
    const url = `${AIR_QUALITY_BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Hourly Air Quality API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Hourly air quality data not available:", error.message);
    return null;
  }
}

// Simplified chart creation functions (basic structure shown)
function createAirQualityPieChart(currentData, hourlyData) {
  // Creates pie chart showing air quality composition
  console.log("Creating air quality pie chart...");
}

function createAirQualityLineChart(hourlyData) {
  // Creates line chart showing PM2.5 trend over 24 hours
  console.log("Creating air quality line chart...");
}

function createWeatherPieChart(hourlyData) {
  // Creates pie chart showing weather conditions distribution
  console.log("Creating weather pie chart...");
}

function createTemperatureLineChart(hourlyData) {
  // Creates line chart showing temperature trend over 24 hours
  console.log("Creating temperature line chart...");
}
