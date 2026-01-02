const hourlyContainer = document.querySelector(".hourly-container");
const cityNameEl = document.getElementById("city-name");
const dateDisplay = document.getElementById("date-display");
const backButton = document.getElementById("backButton");
const unitToggle = document.getElementById("unitToggle");
const hourlyCard = document.querySelector(".hourly-card");
const animationContainer = document.querySelector(".weather-animation");

const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const forecastBaseUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

const selectedCity = localStorage.getItem("selectedCity");
const selectedDate = localStorage.getItem("selectedDate");
let currentUnit = localStorage.getItem("unit") || "imperial";

unitToggle.textContent = currentUnit === "imperial" ? "°C" : "°F";

if (selectedCity && selectedDate) {
    fetchHourly(selectedCity, selectedDate);
}

backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

unitToggle.addEventListener("click", () => {
    currentUnit = currentUnit === "imperial" ? "metric" : "imperial";
    localStorage.setItem("unit", currentUnit);
    unitToggle.textContent = currentUnit === "imperial" ? "°C" : "°F";
    fetchHourly(selectedCity, selectedDate);
});

async function fetchHourly(city, dateStr) {
    const response = await fetch(
        `${forecastBaseUrl}${city}&units=${currentUnit}&appid=${apiKey}`
    );

    if (response.status === 404) {
        hourlyContainer.innerHTML = "<p>City not found</p>";
        return;
    }

    const data = await response.json();
    cityNameEl.textContent = data.city.name;

    const hourlyData = data.list.filter(item =>
        item.dt_txt.startsWith(dateStr)
    );

    const displayDate = new Date(dateStr);
    dateDisplay.textContent = displayDate.toLocaleDateString(
        "en-US",
        { weekday: "long", month: "short", day: "numeric" }
    );

    hourlyContainer.innerHTML = "";

    const weatherMain = hourlyData[0]?.weather[0].main.toLowerCase() || "clear";
    setBackground(weatherMain);
    setHourlyAnimation(weatherMain);

    const tempUnit = currentUnit === "imperial" ? "°F" : "°C";
    const windUnit = currentUnit === "imperial" ? "mph" : "m/s";

    hourlyData.slice(0, 8).forEach(item => {
        const hour = new Date(item.dt_txt).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit", hour12: true }
        );

        const temp = Math.round(item.main.temp) + tempUnit;
        const wind = item.wind.speed + " " + windUnit;
        const humidity = item.main.humidity + "%";
        const icon = `images/${item.weather[0].main.toLowerCase()}.png`;

        const block = document.createElement("div");
        block.className = "hour-block";
        block.innerHTML = `
            <p>${hour}</p>
            <img src="${icon}">
            <p>${temp}</p>
            <p>${wind}</p>
            <p>${humidity}</p>
        `;

        hourlyContainer.appendChild(block);
    });
}

function setBackground(weatherMain) {
    let bg;
    switch (weatherMain) {
        case "clouds": bg = "linear-gradient(135deg, #bdc3c7, #2c3e50)"; break;
        case "clear": bg = "linear-gradient(135deg, #f6d365, #fda085)"; break;
        case "rain": bg = "linear-gradient(135deg, #00c6fb, #005bea)"; break;
        case "drizzle": bg = "linear-gradient(135deg, #89f7fe, #66a6ff)"; break;
        case "mist": bg = "linear-gradient(135deg, #d7d2cc, #304352)"; break;
        default: bg = "linear-gradient(135deg, #00feba, #5b548a)";
    }
    hourlyCard.style.background = bg;
}

function setHourlyAnimation(weatherMain) {
    animationContainer.innerHTML = "";

    if (weatherMain === "rain") {
        for (let i = 0; i < 30; i++) {
            const drop = document.createElement("div");
            drop.className = "raindrop";
            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDuration = (0.5 + Math.random()) + "s";
            animationContainer.appendChild(drop);
        }
    } else if (weatherMain === "clouds") {
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement("div");
            cloud.className = "cloud";
            cloud.style.top = (10 + Math.random() * 40) + "%";
            cloud.style.animationDuration = (20 + Math.random() * 10) + "s";
            animationContainer.appendChild(cloud);
        }
    } else if (weatherMain === "clear") {
        const sun = document.createElement("div");
        sun.className = "sun";
        animationContainer.appendChild(sun);
    } else {
        const moon = document.createElement("div");
        moon.className = "moon";
        animationContainer.appendChild(moon);
    }
}

const langToggle = document.getElementById("langToggle");
let currentLang = localStorage.getItem("lang") || "en";
langToggle.textContent = currentLang.toUpperCase();

langToggle.addEventListener("click", () => {
    // Toggle language between English and Spanish
    currentLang = currentLang === "en" ? "es" : "en";
    localStorage.setItem("lang", currentLang);
    langToggle.textContent = currentLang.toUpperCase();
    updateDateLocale();
});

function updateDateLocale() {
    if (!dateDisplay.textContent) return;
    
    const displayDate = new Date(selectedDate);
    dateDisplay.textContent = displayDate.toLocaleDateString(
        currentLang === "en" ? "en-US" : "es-ES",
        { weekday: "long", month: "short", day: "numeric" }
    );
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateDateLocale() {
    if (!dateDisplay.textContent) return;

    const displayDate = new Date(selectedDate);
    let formatted = displayDate.toLocaleDateString(
        currentLang === "en" ? "en-US" : "es-ES",
        { weekday: "long", month: "short", day: "numeric" }
    );

    // Capitalize the first letter of each word (weekday and month)
    formatted = formatted.split(" ").map(word => capitalizeFirstLetter(word)).join(" ");

    dateDisplay.textContent = formatted;
}

// Call once on load
updateDateLocale();
