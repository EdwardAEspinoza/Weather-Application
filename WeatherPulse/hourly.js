const hourlyContainer = document.querySelector(".hourly-container");
const cityNameEl = document.getElementById("city-name");
const dateDisplay = document.getElementById("date-display");
const backButton = document.getElementById("backButton");

const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

// Get city, date, and language from localStorage
const selectedCity = localStorage.getItem("selectedCity");
const selectedDate = localStorage.getItem("selectedDate"); // YYYY-MM-DD
const selectedLang = localStorage.getItem("selectedLang") || "en"; // default to English

if (selectedCity && selectedDate) {
    fetchHourly(selectedCity, selectedDate, selectedLang);
}

backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

async function fetchHourly(city, dateStr, lang) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if (response.status === 404) {
        hourlyContainer.innerHTML = "<p>City not found</p>";
        return;
    }
    const data = await response.json();
    cityNameEl.textContent = data.city.name;

    // Filter forecast for the selected date
    const hourlyData = data.list.filter(item => item.dt_txt.startsWith(dateStr));

    // Display the date nicely
    const firstDate = new Date(dateStr);
    dateDisplay.textContent = firstDate.toLocaleDateString(
        lang === "en" ? "en-US" : "es-ES",
        { weekday: 'long', month: 'short', day: 'numeric' }
    );

    hourlyContainer.innerHTML = "";

    if (hourlyData.length === 0) {
        hourlyContainer.innerHTML = "<p>No hourly data available</p>";
        return;
    }

    // Show up to 8 hours
    hourlyData.slice(0, 8).forEach(item => {
        const hour = new Date(item.dt_txt).toLocaleTimeString(
            lang === "en" ? "en-US" : "es-ES",
            { hour: '2-digit', minute:'2-digit', hour12:true }
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
            <p class="wind">Wind: ${wind}</p>
            <p class="humidity">Humidity: ${humidity}</p>
        `;
        hourlyContainer.appendChild(hourDiv);
    });
}