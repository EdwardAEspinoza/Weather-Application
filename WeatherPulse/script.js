const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkingWeather(city){
    const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
    
    if(response.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".forecast").style.display = "none";
    } else {
        const data = await response.json();
       
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°F";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "mph"; 

        if(data.weather[0].main =="Clouds"){
            weatherIcon.src = "images/clouds.png";
        }
        else if(data.weather[0].main == "Clear"){
            weatherIcon.src = "images/clear.png";
        }
        else if(data.weather[0].main == "Rain"){
            weatherIcon.src = "images/rain.png";
        }
        else if(data.weather[0].main == "Drizzle"){
            weatherIcon.src = "images/drizzle.png";
        }
        else if(data.weather[0].main == "Mist"){
            weatherIcon.src = "images/mist.png";
        }

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

async function showForecast(city){
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if(response.status == 404) return;

    const data = await response.json();
    const forecastContainer = document.querySelector(".forecast-cards");
    forecastContainer.innerHTML = "";

    // Group forecast data by day
    const forecastByDay = {};

    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!forecastByDay[day]) {
            forecastByDay[day] = [];
        }
        forecastByDay[day].push(item);
    });

    // Get first 5 days
    const days = Object.keys(forecastByDay).slice(0, 5);

    days.forEach(day => {
        const dayData = forecastByDay[day];

        // Calculate min and max temperature for the day
        const temps = dayData.map(d => d.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        // Use the first entry for the weather icon
        let iconUrl = "";
        switch(dayData[0].weather[0].main){
            case "Clouds": iconUrl = "images/clouds.png"; break;
            case "Clear": iconUrl = "images/clear.png"; break;
            case "Rain": iconUrl = "images/rain.png"; break;
            case "Drizzle": iconUrl = "images/drizzle.png"; break;
            case "Mist": iconUrl = "images/mist.png"; break;
            default: iconUrl = "images/clear.png";
        }

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <p>${day}</p>
            <img src="${iconUrl}">
            <p class="temps">${maxTemp}°F / ${minTemp}°F</p>
        `;
        
        forecastContainer.appendChild(card);
    });

    document.querySelector(".forecast").style.display = "block";
}
