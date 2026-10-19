      const weatherButton = document.querySelector("#weather-button");
      const weatherStatus = document.querySelector("#weather-status");
      const weatherResult = document.querySelector("#weather-result");
      const weatherIcon = document.querySelector("#weather-icon");
      const weatherCondition = document.querySelector("#weather-condition");
      const weatherTemperature = document.querySelector("#weather-temperature");

      const weatherCodes = {
        0: ["Clear sky", "☀️"],
        1: ["Mostly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Rime fog", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy drizzle", "🌧️"],
        56: ["Freezing drizzle", "🌧️"],
        57: ["Heavy freezing drizzle", "🌧️"],
        61: ["Light rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        66: ["Freezing rain", "🌧️"],
        67: ["Heavy freezing rain", "🌧️"],
        71: ["Light snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy snow", "❄️"],
        77: ["Snow grains", "❄️"],
        80: ["Light rain showers", "🌦️"],
        81: ["Rain showers", "🌧️"],
        82: ["Heavy rain showers", "🌧️"],
        85: ["Snow showers", "🌨️"],
        86: ["Heavy snow showers", "❄️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with hail", "⛈️"],
        99: ["Heavy thunderstorm with hail", "⛈️"],
      };

      function showWeatherError(message) {
        weatherStatus.textContent = message;
        weatherButton.disabled = false;
        weatherButton.textContent = "Try again";
      }

      function getLocationErrorMessage(error) {
        if (error.code === 1) {
          return "Location access was denied. Allow location in your browser settings and try again.";
        }
        if (error.code === 2) {
          return "Your location couldn’t be determined. Check your device location settings and try again.";
        }
        if (error.code === 3) {
          return "Finding your location took too long. Please try again.";
        }
        return "Your location is unavailable. Please try again.";
      }

      async function loadWeather(latitude, longitude) {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          current: "temperature_2m,weather_code",
          temperature_unit: "celsius",
        });

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Weather service responded with ${response.status}.`);
        }

        const data = await response.json();
        const temperature = data.current?.temperature_2m;
        const code = data.current?.weather_code;
        if (!Number.isFinite(temperature) || !Number.isFinite(code)) {
          throw new Error("The weather service returned an incomplete forecast.");
        }

        const [condition, icon] = weatherCodes[code] ?? ["Current conditions", "🌡️"];
        weatherIcon.textContent = icon;
        weatherCondition.textContent = condition;
        weatherTemperature.textContent = Math.round(temperature);
        weatherResult.hidden = false;
        weatherStatus.textContent = "Here’s the current weather near you.";
        weatherButton.disabled = false;
        weatherButton.textContent = "Refresh weather";
      }

      function requestWeather() {
        if (!("geolocation" in navigator)) {
          showWeatherError("Your browser doesn’t support location access.");
          return;
        }

        weatherButton.disabled = true;
        weatherButton.textContent = "Finding you…";
        weatherStatus.textContent = "Waiting for your location permission…";

        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            weatherStatus.textContent = "Getting the latest local forecast…";
            loadWeather(coords.latitude, coords.longitude).catch((error) => {
              console.error("Could not load local weather:", error);
              showWeatherError("Couldn’t load the weather right now. Check your connection and try again.");
            });
          },
          (error) => {
            showWeatherError(getLocationErrorMessage(error));
          },
          { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
        );
      }

      weatherButton.addEventListener("click", requestWeather);
      requestWeather();
