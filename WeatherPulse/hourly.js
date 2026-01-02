const hourlyContainer = document.querySelector(".hourly-container");
const cityNameEl = document.getElementById("city-name");
const dateDisplay = document.getElementById("date-display");
const backButton = document.getElementById("backButton");
const hourlyCard = document.querySelector(".hourly-card");
const animationContainer = document.querySelector(".weather-animation");

const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

const selectedCity = localStorage.getItem("selectedCity");
const selectedDate = localStorage.getItem("selectedDate"); // YYYY-MM-DD
const currentLang = localStorage.getItem("currentLang") || "en";

if(selectedCity && selectedDate){
    fetchHourly(selectedCity, selectedDate);
}

backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

async function fetchHourly(city, dateStr){
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if(response.status === 404){
        hourlyContainer.innerHTML = "<p>City not found</p>";
        return;
    }
    const data = await response.json();
    cityNameEl.textContent = data.city.name;

    // Filter hourly for selected date
    const hourlyData = data.list.filter(item => item.dt_txt.startsWith(dateStr));

    // Display date nicely
    const firstDate = new Date(dateStr);
    dateDisplay.textContent = firstDate.toLocaleDateString(
        currentLang === "en" ? "en-US" : "es-ES",
        { weekday: 'long', month: 'short', day: 'numeric' }
    );

    hourlyContainer.innerHTML = "";

    // Change background according to first hour
    const weatherMain = hourlyData[0]?.weather[0].main.toLowerCase() || "clear";
    let background = "";
    switch(weatherMain){
        case "clouds": background = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; break;
        case "clear": background = "linear-gradient(135deg, #f6d365, #fda085)"; break;
        case "rain": background = "linear-gradient(135deg, #00c6fb, #005bea)"; break;
        case "drizzle": background = "linear-gradient(135deg, #89f7fe, #66a6ff)"; break;
        case "mist": background = "linear-gradient(135deg, #d7d2cc, #304352)"; break;
        default: background = "linear-gradient(135deg, #00feba, #5b548a)";
    }
    hourlyCard.style.background = background;

    // Show up to 8 hours
    hourlyData.slice(0,8).forEach(item => {
        const hour = new Date(item.dt_txt).toLocaleTimeString(
            currentLang === "en" ? "en-US" : "es-ES",
            { hour:'2-digit', minute:'2-digit', hour12:true }
        );
        const temp = Math.round(item.main.temp) + "°F";
        const icon = `images/${item.weather[0].main.toLowerCase()}.png`;
        const wind = item.wind.speed + " mph";
        const humidity = item.main.humidity + "%";

        const hourDiv = document.createElement("div");
        hourDiv.className = "hour-block";
        hourDiv.innerHTML = `
            <p class="hour">${hour}</p>
            <img src="${icon}" class="hour-icon">
            <p class="temp">${temp}</p>
            <p class="wind">${wind}</p>
            <p class="humidity">${humidity}</p>
        `;
        hourlyContainer.appendChild(hourDiv);
    });

    setHourlyAnimation(weatherMain);
}

function setHourlyAnimation(weatherMain){
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
