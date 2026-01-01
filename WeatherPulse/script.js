const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");
const historyList = document.querySelector(".history-list");
const toggleUnitBtn = document.getElementById("toggleUnit");

let isCelsius = false;
let currentWeatherData = null;
let lang = {};
let currentLang = "en"; // default

// Load language JSON
async function loadLanguageData() {
    const response = await fetch("lang.json");
    lang = await response.json();
    updateLabels();
}
loadLanguageData();

// Render search history
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
function renderSearchHistory() {
    historyList.innerHTML = "";
    searchHistory.forEach(cityName => {
        const li = document.createElement("li");
        li.textContent = cityName;
        li.addEventListener("click", () => {
            searchBox.value = cityName;
            checkingWeather(cityName);
        });
        historyList.appendChild(li);
    });
}
renderSearchHistory();

// Update labels based on language
function updateLabels() {
    toggleUnitBtn.textContent = isCelsius ? lang[currentLang].showInF : lang[currentLang].showInC;
    document.querySelector(".search-history h4").textContent = lang[currentLang].recentSearches;
    document.querySelector(".forecast h3").textContent = lang[currentLang].forecast5Day;
    if(currentWeatherData) updateWeatherUI(currentWeatherData);
}

// Geolocation on load
window.addEventListener("load", () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos => {
            checkingWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        });
    }
});

// Fetch weather by coordinates
async function checkingWeatherByCoords(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    if(response.status == 404) return;
    const data = await response.json();
    currentWeatherData = data;
    updateWeatherUI(data);
    showForecast(data.name);
}

// Main weather fetch
async function checkingWeather(city){
    const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
    if(response.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".forecast").style.display = "none";
    } else {
        const data = await response.json();
        currentWeatherData = data;
        updateWeatherUI(data);
        showForecast(city);

        if(!searchHistory.includes(city)){
            searchHistory.unshift(city);
            if(searchHistory.length > 5) searchHistory.pop();
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            renderSearchHistory();
        }
    }
}

// Update weather UI
function updateWeatherUI(data){
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = isCelsius ? ((data.main.temp - 32) * 5/9).toFixed(1) + "°C" : Math.round(data.main.temp) + "°F";
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = isCelsius ? (data.wind.speed * 0.44704).toFixed(1) + " m/s" : data.wind.speed + " mph";

    // Labels
    document.querySelector(".humidity + p").textContent = lang[currentLang].humidity;
    document.querySelector(".wind + p").textContent = lang[currentLang].wind;

    // Weather icon
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
    const timezoneOffset = data.timezone;
    const utcTime = new Date().getTime() + new Date().getTimezoneOffset()*60000; 
    const localTime = new Date(utcTime + timezoneOffset*1000);
    const options = {hour: 'numeric', minute:'2-digit', hour12:true};
    document.querySelector(".local-time").textContent = `${lang[currentLang].localTime}: ${localTime.toLocaleTimeString('en-US', options)}`;

    // Weather animations
    setWeatherAnimation(data.weather[0].main, data);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

// Weather animations (sun, moon, clouds, rain)
function setWeatherAnimation(weatherMain, data) {
    const animationContainer = document.querySelector(".weather-animation");
    animationContainer.innerHTML = "";

    const timezoneOffset = data.timezone;
    const utcTime = new Date().getTime() + new Date().getTimezoneOffset()*60000; 
    const localTime = new Date(utcTime + timezoneOffset*1000);
    const hours = localTime.getHours();

    // Sun or moon
    if(weatherMain === "Clear"){
        const sunMoon = document.createElement("div");
        sunMoon.className = hours >= 6 && hours < 18 ? "sun" : "moon";
        animationContainer.appendChild(sunMoon);
    }

    // Clouds
    if(weatherMain === "Clouds" || weatherMain === "Mist" || weatherMain === "Drizzle"){
        for(let i=0; i<5; i++){
            const cloud = document.createElement("div");
            cloud.className = "cloud";
            cloud.style.top = (10 + Math.random()*30) + "%";
            cloud.style.left = Math.random()*100 + "%";
            cloud.style.animationDuration = (20 + Math.random()*20) + "s";
            animationContainer.appendChild(cloud);
        }
    }

    // Rain
    if(weatherMain === "Rain"){
        for(let i=0;i<30;i++){
            const drop = document.createElement("div");
            drop.className = "raindrop";
            drop.style.left = Math.random()*100 + "%";
            drop.style.animationDuration = (0.5 + Math.random()) + "s";
            animationContainer.appendChild(drop);
        }
    }
}

// Event listeners
searchButton.addEventListener("click", () => checkingWeather(searchBox.value));
searchBox.addEventListener("keypress", e => { if(e.key==="Enter") checkingWeather(searchBox.value); });

// Unit toggle
toggleUnitBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;
    toggleUnitBtn.textContent = isCelsius ? lang[currentLang].showInF : lang[currentLang].showInC;
    if(currentWeatherData) updateWeatherUI(currentWeatherData);
});

// Language toggle button
document.getElementById("toggleLang").addEventListener("click", () => {
    currentLang = currentLang === "en" ? "es" : "en";
    updateLabels();
});

// 5-Day Forecast
async function showForecast(city){
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if(response.status == 404) return;

    const data = await response.json();
    currentWeatherData.forecastData = data;

    const forecastContainer = document.querySelector(".forecast-cards");
    forecastContainer.innerHTML = "";

    const forecastByDay = {};
    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if(!forecastByDay[day]) forecastByDay[day] = [];
        forecastByDay[day].push(item);
    });

    const days = Object.keys(forecastByDay).slice(0,5);
    days.forEach(day => {
        const dayData = forecastByDay[day];
        const temps = dayData.map(d => d.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        let iconUrl = "";
        switch(dayData[0].weather[0].main){
            case "Clouds": iconUrl = "images/clouds.png"; break;
            case "Clear": iconUrl = "images/clear.png"; break;
            case "Rain": iconUrl = "images/rain.png"; break;
            case "Drizzle": iconUrl = "images/drizzle.png"; break;
            case "Mist": iconUrl = "images/mist.png"; break;
            default: iconUrl = "images/clear.png";
        }

        const cardForecast = document.createElement("div");
        cardForecast.className = "forecast-card";
        cardForecast.innerHTML = `
            <p>${day}</p>
            <img src="${iconUrl}">
            <p class="temps">${maxTemp}°F / ${minTemp}°F</p>
        `;
        forecastContainer.appendChild(cardForecast);
    });

    document.querySelector(".forecast").style.display = "block";
}
