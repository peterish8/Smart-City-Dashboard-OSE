# Smart City Data Dashboard

A beginner-friendly web dashboard that displays real-time weather and air quality data for any city. This project focuses on learning API integration, data visualization, and clean web development practices.

## 🌟 What It Does

- **Search any city** and get real-time data
- **View weather information**: temperature, humidity, wind speed, and weather description
- **View air quality**: PM2.5 levels and Air Quality Index (AQI) with status
- **Visualize data**: Interactive bar chart using Chart.js showing all metrics

## 🛠️ Technologies Used

- **HTML** - Structure and layout
- **CSS** - Styling and responsive design
- **JavaScript** - API integration and DOM manipulation
- **Chart.js** - Data visualization library

## 🌐 APIs Used

1. **OpenWeatherMap API** - Weather data (Default)

   - URL: https://openweathermap.org/api
   - Free tier: 1,000 calls/day
   - Requires API key (free registration, no credit card)

2. **Open-Meteo API** - Weather data (Alternative - No API Key!)

   - URL: https://open-meteo.com/en/docs
   - **100% Free, no registration, no API key needed**
   - Unlimited calls
   - Great alternative if you don't want to sign up

3. **OpenAQ API** - Air quality data
   - URL: https://openaq.org/
   - Free, no API key required
   - Provides PM2.5 and other air quality metrics

## 🚀 How to Run

### Step 1: Get Your FREE API Key

**Option A: OpenWeatherMap (Free Tier - No Credit Card Required)**

OpenWeatherMap offers a **completely free tier** with 1,000 API calls per day. Here's how to get it:

1. Go to [OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up)
2. Fill in your email, username, and password
3. **IMPORTANT:** When you see pricing plans, look for the **"Free"** plan (it's the default)
4. Click "Get API key" or "Sign Up" - **DO NOT select any paid plans**
5. After signing up, check your email and verify your account
6. Log in to [OpenWeatherMap](https://home.openweathermap.org/)
7. Go to "API keys" tab (in the top menu)
8. You'll see a default API key - copy it (it starts with letters and numbers)
9. **Note:** The API key may take 10-60 minutes to activate after signup

**Option B: Use Open-Meteo (100% Free, No API Key Needed!)**

If you prefer not to register anywhere, you can use Open-Meteo which is completely free and doesn't require any API key or registration:

1. Open `script.js` file
2. Find these lines at the top (around line 6-7):
   ```javascript
   const OPENWEATHER_API_KEY = "YOUR_API_KEY";
   const OPENWEATHER_BASE_URL =
     "https://api.openweathermap.org/data/2.5/weather";
   ```
3. Replace them with:
   ```javascript
   const OPENWEATHER_API_KEY = ""; // Not needed for Open-Meteo
   const OPENWEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
   ```
4. Then update the `fetchWeatherData` function (around line 89) to use Open-Meteo format:

   ```javascript
   async function fetchWeatherData(city) {
     try {
       // First, get coordinates for the city using geocoding
       const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
         city
       )}&count=1`;
       const geoResponse = await fetch(geoUrl);
       const geoData = await geoResponse.json();

       if (!geoData.results || geoData.results.length === 0) {
         throw new Error(
           "City not found. Please check the spelling and try again."
         );
       }

       const { latitude, longitude, name, country_code } = geoData.results[0];

       // Now get weather data
       const url = `${OPENWEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
       const response = await fetch(url);

       if (!response.ok) {
         throw new Error(`Weather API error: ${response.status}`);
       }

       const data = await response.json();

       return {
         temperature: Math.round(data.current.temperature_2m),
         description: getWeatherDescription(data.current.weather_code),
         humidity: data.current.relative_humidity_2m,
         windSpeed: data.current.wind_speed_10m,
         cityName: name,
         country: country_code,
       };
     } catch (error) {
       throw new Error(`Failed to fetch weather data: ${error.message}`);
     }
   }

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
   ```

**💡 Recommendation:** If you're just learning, start with **Option B (Open-Meteo)** - it's easier and requires no registration!

### Step 2: Configure the Project

**If you chose Option A (OpenWeatherMap):**

1. Open `script.js` file
2. Find this line (around line 6):
   ```javascript
   const OPENWEATHER_API_KEY = "YOUR_API_KEY";
   ```
3. Replace `'YOUR_API_KEY'` with your actual API key from Step 1:
   ```javascript
   const OPENWEATHER_API_KEY = "your-actual-api-key-here";
   ```

**If you chose Option B (Open-Meteo):**

- Follow the instructions in Step 1, Option B above
- No API key configuration needed!

### Step 3: Open the Dashboard

1. Open `index.html` in your web browser
2. The dashboard will automatically load data for "Bangalore" (default city)
3. Enter any city name and click "Search" or press Enter

## 📁 Project Structure

```
smart-city-dashboard/
│
├── index.html          # Main HTML file
├── style.css           # All CSS styling
├── script.js           # JavaScript (API calls, DOM manipulation)
└── README.md           # Project documentation
```

## ✨ Features

### 1. City Selection

- Input field to enter city name
- Search button to fetch data
- Enter key support for quick searching
- Default city: Bangalore

### 2. Weather Information Card

- Current temperature (°C)
- Weather description (sunny, cloudy, etc.)
- Humidity percentage
- Wind speed (m/s)
- City name and country

### 3. Air Quality Card

- PM2.5 level (μg/m³)
- Air Quality Index (AQI)
- Status indicator (Good/Moderate/Unhealthy)
- Color-coded status badges

### 4. Data Visualization

- Interactive bar chart using Chart.js
- Displays temperature, humidity, wind speed
- Includes PM2.5 if available
- Responsive and color-coded

### 5. Error Handling

- Shows error messages for invalid cities
- Handles API failures gracefully
- Validates user input
- Loading spinner during data fetch

### 6. Responsive Design

- Works on desktop, tablet, and mobile
- Clean, minimalistic UI
- Card-based layout
- Smooth transitions and hover effects

## 🎨 Design Features

- **Color Scheme:**

  - Primary: Blue (#2196F3)
  - Success: Green (#4CAF50)
  - Warning: Orange (#FF9800)
  - Danger: Red (#F44336)

- **Layout:**
  - Grid-based responsive design
  - Card components with shadows
  - Clean typography
  - Intuitive user interface

## 📚 Learning Objectives

This project helps you learn:

1. **API Integration**

   - How to use `fetch()` API
   - Handling async/await
   - Parsing JSON responses
   - Error handling

2. **DOM Manipulation**

   - Selecting elements
   - Updating content dynamically
   - Event handling

3. **Data Visualization**

   - Using Chart.js library
   - Creating bar charts
   - Customizing chart appearance

4. **CSS Styling**
   - CSS Grid and Flexbox
   - Responsive design
   - CSS variables
   - Modern UI patterns

## 🧪 Testing

Test the dashboard with:

- **Valid cities:** Bangalore, Mumbai, Delhi, New York, London, Tokyo
- **Invalid cities:** Test error handling with misspelled city names
- **Edge cases:** Empty input, special characters
- **Responsive design:** Test on different screen sizes

## ⚠️ Common Issues & Solutions

### Issue: OpenWeatherMap asking for payment/credit card

**Solution:**

- OpenWeatherMap DOES have a free tier - make sure you select the "Free" plan (it's usually the default)
- If you're still having issues, use **Open-Meteo instead** (Option B in Step 1) - it's 100% free with no registration needed!

### Issue: "Invalid API key" error

**Solution:**

- Make sure you've replaced `YOUR_API_KEY` in `script.js` with your actual OpenWeatherMap API key
- Wait 10-60 minutes after signup for the API key to activate
- Or switch to Open-Meteo (Option B) which doesn't need an API key

### Issue: "City not found" error

**Solution:**

- Check the spelling of the city name
- Try using the city name in English
- Some cities might not be available in the database

### Issue: Air quality data not showing

**Solution:**

- OpenAQ might not have data for all cities
- This is normal - the dashboard will show "Data not available" message
- Weather data will still work

### Issue: Chart not displaying

**Solution:**

- Make sure you have internet connection (Chart.js loads from CDN)
- Check browser console for errors
- Try refreshing the page

## 💡 Code Structure

### JavaScript Functions

- `fetchCityData()` - Main function that coordinates data fetching
- `fetchWeatherData(city)` - Fetches weather from OpenWeatherMap
- `fetchAirQualityData(city)` - Fetches air quality from OpenAQ
- `displayWeatherInfo(data)` - Displays weather in UI
- `displayAirQuality(data)` - Displays air quality in UI
- `createChart(weatherData, airQualityData)` - Creates Chart.js visualization
- `showError(message)` - Shows error messages
- `showLoading(show)` - Shows/hides loading spinner

### CSS Organization

- CSS Variables for colors
- Reset and base styles
- Header and footer styles
- Card components
- Responsive media queries

## 🎯 Future Enhancements (Bonus Features)

If you want to extend this project:

- [ ] Add 5-day weather forecast
- [ ] Store last searched city in localStorage
- [ ] Add dark mode toggle
- [ ] Add more chart types (line chart for forecast)
- [ ] Add city suggestions/autocomplete
- [ ] Add unit conversion (Celsius/Fahrenheit)
- [ ] Add more air quality parameters

## 📖 Resources

- **Fetch API:** [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- **Chart.js:** [Official Documentation](https://www.chartjs.org/docs/)
- **OpenWeatherMap:** [API Documentation](https://openweathermap.org/api)
- **OpenAQ:** [API Documentation](https://docs.openaq.org/)

## 📝 Notes

- This project is designed for educational purposes
- API keys should be kept secure (don't commit them to public repositories)
- OpenWeatherMap free tier has rate limits (1,000 calls/day)
- OpenAQ is free and doesn't require an API key

## 🤝 Contributing

This is a learning project. Feel free to:

- Add new features
- Improve the design
- Fix bugs
- Add more data sources

## 📄 License

This project is open source and available for educational use.

---

**Built for learning API integration and data visualization** 🚀

**Happy Coding!** 💻
