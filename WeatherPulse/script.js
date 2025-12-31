const apiKey = "28d49ae1b3bf92f79d47d6238d907b37";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";

const searchBox = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkingWeather(city){
    const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
    
    if(response.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }else{
        var data = await response.json();
       
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

    }
    
    

}

searchButton.addEventListener("click", ()=>{
    checkingWeather(searchBox.value);

})
