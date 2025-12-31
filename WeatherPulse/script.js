const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");

let isCelsius = false; // Track unit
let currentWeatherData = null; // Store current weather and forecast

async function checkingWeather(city){
    const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
    
    if(response.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".forecast").style.display = "none";
    } else {
        const data = await response.json();
        currentWeatherData = data; // store for unit conversion

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°F";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " mph"; 

        // Weather icon
        if(data.weather[0].main =="Clouds") weatherIcon.src = "images/clouds.png";
        else if(data.weather[0].main == "Clear") weatherIcon.src = "images/clear.png";
        else if(data.weather[0].main == "Rain") weatherIcon.src = "images/rain.png";
        else if(data.weather[0].main == "Drizzle") weatherIcon.src = "images/drizzle.png";
        else if(data.weather[0].main == "Mist") weatherIcon.src = "images/mist.png";

        // Dynamic card background
        let background = "";
        switch(data.weather[0].main){
            case "Clouds": background = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; break;
            case "Clear": background = "linear-gradient(135deg, #f6d365, #fda085)"; break;
            case "Rain": background = "linear-gradient(135deg, #00c6fb, #005bea)"; break;
            case "Drizzle": background = "linear-gradient(135deg, #89f7fe, #66a6ff)"; break;
            case "Mist": background = "linear-gradient(135deg, #d7d2cc, #304352)"; break;
            default: background = "linear-gradient(135deg, #00feba, #5b548a)";
        }
        card.style.background = background;

        // Keep body dark
        document.body.style.background = "#222";

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

        showForecast(city);
    }
}

searchButton.addEventListener("click", () => {
    const city = searchBox.value;
    checkingWeather(city);
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value;
        checkingWeather(city);
    }
});

// Unit conversion
document.getElementById("toggleUnit").addEventListener("click", () => {
    isCelsius = !isCelsius;
    document.getElementById("toggleUnit").textContent = isCelsius ? "Show in °F" : "Show in °C";
    if(currentWeatherData){
        updateUnits();
    }
});

function updateUnits(){
    if(!currentWeatherData) return;

    // Current weather
    let temp = currentWeatherData.main.temp;
    let wind = currentWeatherData.wind.speed;

    if(isCelsius){
        temp = ((temp - 32) * 5/9).toFixed(1);
        wind = (wind * 0.44704).toFixed(1); // mph → m/s
        document.querySelector(".temp").innerHTML = temp + "°C";
        document.querySelector(".wind").innerHTML = wind + " m/s";
    } else {
        temp = Math.round(currentWeatherData.main.temp);
        wind = currentWeatherData.wind.speed;
        document.querySelector(".temp").innerHTML = temp + "°F";
        document.querySelector(".wind").innerHTML = wind + " mph";
    }

    // Forecast conversion
    const forecastCards = document.querySelectorAll(".forecast-card");
    if(!currentWeatherData.forecastData) return;
    const forecastByDay = {};

    currentWeatherData.forecastData.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!forecastByDay[day]) forecastByDay[day] = [];
        forecastByDay[day].push(item);
    });

    forecastCards.forEach((card, index) => {
        const day = Object.keys(forecastByDay)[index];
        const dayData = forecastByDay[day];
        if(!dayData) return;

        let temps = dayData.map(d => d.main.temp);
        let minTemp = Math.min(...temps);
        let maxTemp = Math.max(...temps);

        if(isCelsius){
            minTemp = ((minTemp - 32) * 5/9).toFixed(1);
            maxTemp = ((maxTemp - 32) * 5/9).toFixed(1);
            card.querySelector(".temps").innerHTML = `${maxTemp}°C / ${minTemp}°C`;
        } else {
            minTemp = Math.round(minTemp);
            maxTemp = Math.round(maxTemp);
            card.querySelector(".temps").innerHTML = `${maxTemp}°F / ${minTemp}°F`;
        }
    });
}

async function showForecast(city){
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if(response.status == 404) return;

    const data = await response.json();
    currentWeatherData.forecastData = data; // store for unit conversion

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
