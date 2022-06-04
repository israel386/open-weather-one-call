var locationInputEl = document.querySelector("#location-input");
var userFormEl = document.querySelector("#user-form");
var currentWeatherEl = document.querySelector("#current-weather");
var futureWeatherEl = document.querySelector("#future-weather");
var citySearchEl = document.querySelector("#city");
var searchHistoryEl = document.querySelector("#search-history");
var titleEl = document.querySelector("#forcast-title");

var apiKey = "a58133ad736dcde065f7151b948abd7c"

var locations = [];

var saveSearch = function () {
    localStorage.setItem("locations", JSON.stringify(locations));
}

var formSubmitHandler = function (event) {
    event.preventDefault();

    // get vlaue from form
    var location = locationInputEl.value.trim();

    // if input display weather
    if (location) {
        getWeatherApi(location);
        getFutureWeatherApi(location);
        latestSearch(location);
        saveSearch();

        locationInputEl.value = "";
    } else {
        alert("Please enter a city");
    }
}


var getWeatherApi = function (location) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function (response) {
        // request was successful
        if (response.ok) {
            response.json().then(function (data) {
                displayWeather(data, location);
            });
        } else {
            alert('Error:  Not Found');
        }
    })
        .catch(function (error) {
            alert("Unable to connect");
        });
};

var displayWeather = function (weather, searchTerm) {
    // clear old content
    currentWeatherEl.textContent = "";
    citySearchEl.textContent = searchTerm;

    // create date element
    var currentDate = document.createElement("span")
    currentDate.textContent = " (" + moment(weather.dt.value).format("MMM D, YYYY") + ")";
    citySearchEl.appendChild(currentDate);

    //create a span element to hold temperature data
    var tempEl = document.createElement("span");
    tempEl.textContent = "Temperature: " + weather.main.temp + " °F";
    tempEl.classList = "list-group-item"

    // create a span element to hold Humidity data
    var humidityEl = document.createElement("span");
    humidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
    humidityEl.classList = "list-group-item"

    // create a span element to hold Wind data
    var windEl = document.createElement("span");
    windEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
    windEl.classList = "list-group-item"

    // append to container
    currentWeatherEl.appendChild(tempEl);
    currentWeatherEl.appendChild(humidityEl);
    currentWeatherEl.appendChild(windEl);

    // display 5 day forecast
    titleEl.textContent = "5-Day Forecast";

    var lat = weather.coord.lat;
    var lon = weather.coord.lon;
    getUvIndex(lat, lon)
}

var getUvIndex = function (lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon;
    fetch(apiUrl)
        .then(function (response) {
            response.json().then(function (data) {
                displayUvIndex(data)
            });
        });
}

var displayUvIndex = function (index) {
    uvIndexEl = document.createElement("span");
    uvIndexEl.textContent = "UV Index: " + index.value;
    uvIndexEl.classList = "list-group-item"

    uvCondition = document.createElement("div");

    if (index.value <= 2) {
        uvCondition.classList = "favorable"
        uvCondition.textContent = "favorable";
    } else if (index.value > 2 && index.value <= 8) {
        uvCondition.classList = "moderate"
        uvCondition.textContent = "moderate";
    } else if (index.value > 8) {
        uvCondition.classList = "severe"
        uvCondition.textContent = "severe";
    }

    uvIndexEl.appendChild(uvCondition)
    currentWeatherEl.appendChild(uvIndexEl);
}

var getFutureWeatherApi = function (location) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=imperial&appid=" + apiKey;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayFutureWeather(data);
            });
        } else {
            alert('Error: Not Found');
        }
    })
        .catch(function (error) {
            alert("Unable to connect");
        });
}

var displayFutureWeather = function (weather) {
    futureWeatherEl.textContent = ""

    var forecast = weather.list;
    // display future weather
    for (var i = 5; i < forecast.length; i = i + 8) {
        var dailyForecast = forecast[i];

        var forecastEl = document.createElement("div");
        forecastEl.classList = "card bg-dark text-light m-2";

        //create date element
        var forecastDate = document.createElement("h5")
        forecastDate.textContent = moment.unix(dailyForecast.dt).format("MMM D, YYYY");
        forecastDate.classList = "card-header text-center"
        forecastEl.appendChild(forecastDate);

        //create temperature span
        var forecastTempEl = document.createElement("span");
        forecastTempEl.classList = "card-body text-center";
        forecastTempEl.textContent = "" + dailyForecast.main.temp + " °F";

        //append to forecast card

        var forecastHumEl = document.createElement("span");
        forecastHumEl.classList = "card-body text-center";
        forecastHumEl.textContent = "Humidity: " + dailyForecast.main.humidity + "  %";

        // create wind speed element
        var forecastWindEl = document.createElement("span");
        forecastWindEl.classList = "card-body text-center";
        forecastWindEl.textContent = "Wind: " + dailyForecast.wind.speed + " MHP";

        // append to forecast card
        forecastEl.appendChild(forecastWindEl);
        forecastEl.appendChild(forecastTempEl);
        forecastEl.appendChild(forecastHumEl);

        //append to five day container
        futureWeatherEl.appendChild(forecastEl);
    }
}

var latestSearch = function (latestSearch) {
    searchBtn = document.createElement("button");
    searchBtn.classList = "d-flex w-100 btn-light border p-2";
    searchBtn.setAttribute("data-location", latestSearch)
    searchBtn.setAttribute("type", "submit");
    searchBtn.textContent = latestSearch;

    searchHistoryEl.prepend(searchBtn);
}

var displaySearch = function (event) {
    var location = event.target.getAttribute("data-location")
    if (location) {
        getWeatherApi(location);
        getFutureWeatherApi(location);
    }
}

searchHistoryEl.addEventListener("click", displaySearch);
userFormEl.addEventListener("submit", formSubmitHandler);