const hourlyContainer = document.querySelector(".hourly-container");
const cityNameEl = document.getElementById("city-name");
const dateDisplay = document.getElementById("date-display");
const backButton = document.getElementById("backButton");

const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=";

// Get city from localStorage
const selectedCity = localStorage.getItem("selectedCity");
if(selectedCity) fetchHourly(selectedCity);

backButton.addEventListener("click", ()=>window.location.href="index.html");

async function fetchHourly(city){
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if(response.status===404){
        hourlyContainer.innerHTML="<p>City not found</p>";
        return;
    }
    const data = await response.json();
    cityNameEl.textContent = data.city.name;

    // Date of first forecast
    const firstDate = new Date(data.list[0].dt_txt);
    dateDisplay.textContent = firstDate.toLocaleDateString();

    hourlyContainer.innerHTML="";

    // Next 24 hours (8 blocks every 3h)
    data.list.slice(0,8).forEach(item=>{
        const hour = new Date(item.dt_txt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:true});
        const temp = Math.round(item.main.temp)+"°F";
        const icon = `images/${item.weather[0].main.toLowerCase()}.png`;
        const wind = item.wind.speed+" mph";
        const humidity = item.main.humidity+"%";

        const hourDiv = document.createElement("div");
        hourDiv.className="hour-block";
        hourDiv.innerHTML=`
            <p class="hour">${hour}</p>
            <img src="${icon}" class="hour-icon">
            <p class="temp">${temp}</p>
            <p class="wind">Wind: ${wind}</p>
            <p class="humidity">Humidity: ${humidity}</p>
        `;
        hourlyContainer.appendChild(hourDiv);
    });
}
