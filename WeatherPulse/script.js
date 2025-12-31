const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");

let isCelsius = false;
let currentWeatherData = null;

// Search history
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const historyList = document.querySelector(".history-list");

function renderSearchHistory(){
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

// Geolocation
window.addEventListener("load", () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            checkingWeatherByCoords(lat, lon);
        });
    }
});

async function checkingWeatherByCoords(lat, lon){
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    if(response.status == 404) return;
    const data = await response.json();
    currentWeatherData = data;
    updateWeatherUI(data);
    showForecast(data.name);
}

// Main weather function
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

        if (!searchHistory.includes(city)) {
            searchHistory.unshift(city);
            if(searchHistory.length > 5) searchHistory.pop();
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            renderSearchHistory();
        }
    }
}

// Update UI function
function updateWeatherUI(data){
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = isCelsius ? ((data.main.temp - 32) * 5/9).toFixed(1) + "°C" : Math.round(data.main.temp) + "°F";
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = isCelsius ? (data.wind.speed * 0.44704).toFixed(1) + " m/s" : data.wind.speed + " mph";

    const weatherMain = data.weather[0].main;
    weatherIcon.src = `images/${weatherMain.toLowerCase()}.png`;

    // Dynamic background
    let background = "";
    switch(weatherMain){
        case "Clouds": background = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; break;
        case "Clear": background = "linear-gradient(135deg, #f6d365, #fda085)"; break;
        case "Rain": background = "linear-gradient(135deg, #00c6fb, #005bea)"; break;
        case "Drizzle": background = "linear-gradient(135deg, #89f7fe, #66a6ff)"; break;
        case "Mist": background = "linear-gradient(135deg, #d7d2cc, #304352)"; break;
        default: background = "linear-gradient(135deg, #00feba, #5b548a)";
    }
    card.style.background = background;

    // Local time
    const timezoneOffset = data.timezone;
    const localTime = new Date(new Date().getTime() + timezoneOffset*1000 - new Date().getTimezoneOffset()*60000);
    document.querySelector(".local-time").textContent = "Local Time: " + localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Weather animations
    setWeatherAnimation(weatherMain);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

// Weather animations
function setWeatherAnimation(weatherMain){
    const animationContainer = document.querySelector(".weather-animation");
    animationContainer.innerHTML = "";

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
searchBox.addEventListener("keypress", (e) => { if(e.key==="Enter") checkingWeather(searchBox.value); });

// Unit conversion
document.getElementById("toggleUnit").addEventListener("click", () => {
    isCelsius = !isCelsius;
    document.getElementById("toggleUnit").textContent = isCelsius ? "Show in °F" : "Show in °C";
    if(currentWeatherData) updateWeatherUI(currentWeatherData);
});

// Forecast
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
        if (!forecastByDay[day]) forecastByDay[day] = [];
        forecastByDay[day].push(item);
    });

    const days = Object.keys(forecastByDay).slice(0, 5);

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
