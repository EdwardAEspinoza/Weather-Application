const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");
const historyList = document.querySelector(".history-list");

const toggleUnitBtn = document.getElementById("toggleUnit");
const langToggleBtn = document.getElementById("lang-toggle");

function formatTemp(tempF) {
    if (isCelsius) {
        return Math.round((tempF - 32) * 5 / 9);
    }
    return Math.round(tempF);
}

// Language labels
let langData = null;
let currentLang = "en";

// Weather data
let isCelsius = false;
let currentWeatherData = null;

// Search history
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// Load language JSON
async function loadLang() {
    const response = await fetch("lang.json");
    langData = await response.json();
    updateLangUI();
}
loadLang();

// Update UI labels based on currentLang
function updateLangUI() {
    if (!langData) return;

    document.getElementById("recentSearches").textContent = langData[currentLang].recentSearches;
    document.getElementById("humidityLabel").textContent = langData[currentLang].humidity;
    document.getElementById("windLabel").textContent = langData[currentLang].wind;
    document.getElementById("forecastTitle").textContent = langData[currentLang].forecast5Day;
    document.getElementById("errorMessage").textContent = langData[currentLang].error || "City not found";
    searchInput.placeholder = langData[currentLang].searchPlaceholder;
    toggleUnitBtn.textContent = isCelsius ? langData[currentLang].showInF : langData[currentLang].showInC;
    langToggleBtn.textContent = langData[currentLang].toggleLang;

    // Update forecast card "Today"
    const forecastCards = document.querySelectorAll(".forecast-card p:first-child");
    if (forecastCards.length > 0) {
        forecastCards[0].textContent = langData[currentLang].today;
    }

    // Update local time
    if (currentWeatherData) {
        const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
        const localTime = new Date(nowUTC.getTime() + currentWeatherData.timezone * 1000);
        const timeFormatter = new Intl.DateTimeFormat(currentLang === "en" ? "en-US" : "es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
        document.querySelector(".local-time").textContent =
            `${langData[currentLang].localTime}: ${timeFormatter.format(localTime)}`;
    }
}

// Toggle language
langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "es" : "en";
    updateLangUI();
    if(currentWeatherData) showForecast(currentWeatherData.name);
});

// Render search history
function renderSearchHistory() {
    historyList.innerHTML = "";
    searchHistory.forEach(cityName => {
        const li = document.createElement("li");
        li.textContent = cityName;
        li.addEventListener("click", () => {
            searchInput.value = cityName;
            checkingWeather(cityName);
        });
        historyList.appendChild(li);
    });
}
renderSearchHistory();

// Geolocation
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            checkingWeatherByCoords(position.coords.latitude, position.coords.longitude);
        });
    }
});

// Fetch weather by coordinates
async function checkingWeatherByCoords(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    if (response.status == 404) return;
    const data = await response.json();
    currentWeatherData = data;
    updateWeatherUI(data);
    showForecast(data.name);
}

// Main weather fetch
async function checkingWeather(city) {
    const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
    if (response.status == 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".forecast").style.display = "none";
    } else {
        const data = await response.json();
        currentWeatherData = data;
        updateWeatherUI(data);
        showForecast(city);

        // Update search history
        if (!searchHistory.includes(city)) {
            searchHistory.unshift(city);
            if (searchHistory.length > 5) searchHistory.pop();
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            renderSearchHistory();
        }
    }
}

// Update weather UI
function updateWeatherUI(data) {
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = isCelsius ? ((data.main.temp - 32) * 5/9).toFixed(1) + "°C" : Math.round(data.main.temp) + "°F";
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = isCelsius ? (data.wind.speed * 0.44704).toFixed(1) + " m/s" : data.wind.speed + " mph";

    const weatherMain = data.weather[0].main.toLowerCase();
    weatherIcon.src = `images/${weatherMain}.png`;

    // Dynamic background
    let background = "";
    switch(weatherMain){
        case "clouds": background = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; break;
        case "clear": background = "linear-gradient(135deg, #f6d365, #fda085)"; break;
        case "rain": background = "linear-gradient(135deg, #00c6fb, #005bea)"; break;
        case "drizzle": background = "linear-gradient(135deg, #89f7fe, #66a6ff)"; break;
        case "mist": background = "linear-gradient(135deg, #d7d2cc, #304352)"; break;
        default: background = "linear-gradient(135deg, #00feba, #5b548a)";
    }
    card.style.background = background;

    // Local time
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60000);
    const localTime = new Date(nowUTC.getTime() + data.timezone*1000);
    const timeFormatter = new Intl.DateTimeFormat(currentLang === "en" ? "en-US" : "es-ES", {hour: '2-digit', minute:'2-digit', hour12:true});
    document.querySelector(".local-time").textContent =
        `${langData[currentLang].localTime}: ${timeFormatter.format(localTime)}`;

    // Weather animations
    setWeatherAnimation(weatherMain);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";

    updateLangUI();
}

// Weather animation
function setWeatherAnimation(weatherMain){
    const animationContainer = document.querySelector(".weather-animation");
    animationContainer.innerHTML = "";

    if(weatherMain === "rain"){
        for(let i=0;i<30;i++){
            const drop = document.createElement("div");
            drop.className = "raindrop";
            drop.style.left = Math.random()*100 + "%";
            drop.style.animationDuration = (0.5 + Math.random()) + "s";
            animationContainer.appendChild(drop);
        }
    } else if(weatherMain === "clouds"){
        for(let i=0;i<5;i++){
            const cloud = document.createElement("div");
            cloud.className = "cloud";
            cloud.style.top = (10 + Math.random()*40) + "%";
            cloud.style.animationDuration = (20 + Math.random()*10) + "s";
            animationContainer.appendChild(cloud);
        }
    } else if(weatherMain === "clear"){
        const sun = document.createElement("div");
        sun.className = "sun";
        animationContainer.appendChild(sun);
    } else if(weatherMain === "night" || weatherMain === "moon"){
        const moon = document.createElement("div");
        moon.className = "moon";
        animationContainer.appendChild(moon);
    }
}

// Event listeners
searchButton.addEventListener("click", () => checkingWeather(searchInput.value));
searchInput.addEventListener("keypress", e => { if(e.key==="Enter") checkingWeather(searchInput.value); });

// Unit toggle
toggleUnitBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;
    toggleUnitBtn.textContent = isCelsius ? langData[currentLang].showInF : langData[currentLang].showInC;

    if (currentWeatherData) {
        updateWeatherUI(currentWeatherData);
        showForecast(currentWeatherData.name);
    }
});


// Forecast (Today + 4 next days)
// Forecast (Today + 4 days)
// Forecast (Today + 4 days)
async function showForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if (response.status == 404) return;

    const data = await response.json();
    currentWeatherData.forecastData = data;

    const forecastContainer = document.querySelector(".forecast-cards");
    forecastContainer.innerHTML = "";

    // Group forecast by date (YYYY-MM-DD)
    const forecastByDay = {};
    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const dateKey = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        if (!forecastByDay[dateKey]) forecastByDay[dateKey] = [];
        forecastByDay[dateKey].push(item);
    });

    // Get today + next 4 days
    const days = Object.keys(forecastByDay).slice(0, 5);

    days.forEach((dateKey, index) => {
        const dayData = forecastByDay[dateKey];
        const temps = dayData.map(d => d.main.temp);
        const minTemp = formatTemp(Math.min(...temps));
        const maxTemp = formatTemp(Math.max(...temps));


        const firstItem = dayData[0];
        const weatherMain = firstItem.weather[0].main.toLowerCase();
        let iconUrl = `images/${weatherMain}.png`;

        // Format weekday for display
        const dateObj = new Date(dateKey);
        const weekday = index === 0
            ? langData[currentLang].today
            : dateObj.toLocaleDateString(
                currentLang === "en" ? "en-US" : "es-ES",
                { weekday: 'short' }
            ).replace(/^./, s => s.toUpperCase()); // Capitalize first letter

        const cardForecast = document.createElement("div");
        cardForecast.className = "forecast-card";

        cardForecast.innerHTML = `
            <p>${weekday}</p>
            <img src="${iconUrl}">
            <p class="temps">
                ${maxTemp}°${isCelsius ? "C" : "F"} / ${minTemp}°${isCelsius ? "C" : "F"}
            </p>
        `;

        // Click to hourly page
        cardForecast.addEventListener("click", () => {
            localStorage.setItem("selectedCity", city);
            localStorage.setItem("selectedDate", dateKey);
            window.location.href = "hourly.html";
        });

        forecastContainer.appendChild(cardForecast);
    });

    document.querySelector(".forecast").style.display = "block";
    updateLangUI();
}
