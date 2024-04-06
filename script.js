var currentLongitude;
var currentLatitude;
var currentLocationLocal;
var units = "imperial";
var unitInText = "F";
var windSpeedUnit = "mph";
var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var backgroundColors = {
    "01d": "#FAF6A0",
    "02d": "#75FDFF",
    "03d": "#85EDEB",
    "04d": "#0F8DD1",
    "09d": "#68A2A3",
    "10d": "#9CA0A2",
    "11d": "#D6D6B5",
    "13d": "#6EF8FF",
    "50d": "#B6F08E",
    "01n": "#213147",
    "02n": "#324B6E",
    "03n": "#2E4463",
    "04n": "#305661",
    "09n": "#3B614F",
    "10n": "#5A7485",
    "11n": "#525144",
    "13n": "#42628F",
    "50n": "#5E7D4A"
};
var favorites = ["St Louis", "New York", "London", "Sydney", "Anchorage"];

function initialPageLoad() {
    searchWeatherInfo("St. Louis", units, false);
    loadFavorites(units);
}

function loadFavorites(units) {
    document.getElementById("current-favorites-weather").innerHTML = "";
    if (favorites.length == 0) {
        document.getElementById("current-favorites-weather").innerHTML = "Add a city to the Favorites list!";
    }
    for (var j = 0; j < favorites.length; j++) {
        searchWeatherInfo(favorites[j], units, true);
    }
}

function changeUnits() {
    event.preventDefault();
    if (units == "imperial") {
        units = "metric";
        unitInText = "C";
        windSpeedUnit = "kph"
    } else {
        units = "imperial";
        unitInText = "F";
        windSpeedUnit = "mph";
    }

    loadWeatherInfo(currentLocationLocal, units, unitInText, windSpeedUnit, backgroundColors);
    loadFavorites(units);

    if (units == "imperial") {
        document.getElementById("change-unit").innerHTML = "&degC";
    } else {
        document.getElementById("change-unit").innerHTML = "&degF";
    }
}

function searchWeather() {
    event.preventDefault();

    var query = document.getElementById("search-box").value;

    searchWeatherInfo(query, units, false);

    document.getElementById("search-box").value = "";
}

function refreshWeather() {
    event.preventDefault();

    loadWeatherInfo(currentLocationLocal, units, unitInText, windSpeedUnit, backgroundColors);
    loadFavorites(units);
}


function searchWeatherInfo(locationString, units, favoritesCol) {
    // I learned how to convert all the spaces to +'s for query searching using split() and join() from
    // https://stackoverflow.com/questions/3794919/replace-all-spaces-in-a-string-with
    // var locationStringToQuery = "q=" + locationString.split(" ").join("+");
    var locationStringToQuery = locationString.split(" ").join("%");

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            currentLocation = JSON.parse(this.responseText);
            // console.log(currentLocation);

            if (favoritesCol === true) {
                loadFavoriteWeatherInfo(currentLocation, units, unitInText, windSpeedUnit, backgroundColors);
            } else {
                loadWeatherInfo(currentLocation, units, unitInText, windSpeedUnit, backgroundColors);
            }
        }
        else {
            var current = document.getElementById("current-weather");
            current.innerHTML = "";

            var infoText = document.createElement("p");
            infoText.setAttribute("class", "info-text");
            infoText.innerHTML = "Location not found. Please use the search bar above to search another location.";
            current.appendChild(infoText);
        }
    }; 

    xhttp.open("GET", "https://dev.virtualearth.net/REST/v1/Locations?query=" + locationStringToQuery + "&key=AvmOMX4c2lzSi12FCu8FFGc5x9LzHEpPu-Ui9qes6UopRpZvBoWaLyZyYFJlRy5o", false);
    xhttp.send();
}

function loadFavoriteWeatherInfo(currentLocation, units, unitInText, windSpeedUnit, backgroundColorChoices) {
    var currentFavoriteLatitude = currentLocation.resourceSets[0].resources[0].point.coordinates[0];
    var currentFavoriteLongitude = currentLocation.resourceSets[0].resources[0].point.coordinates[1];

    var xhttp3 = new XMLHttpRequest();

    xhttp3.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var currentFavoriteWeather = JSON.parse(this.responseText);

            var insertToFavoritesCol = document.getElementById("current-favorites-weather");
            var individualFavorite = document.createElement("button");
            individualFavorite.setAttribute("class", "individual-favorite-weather");
            individualFavorite.setAttribute("id", currentLocation.resourceSets[0].resources[0].name.split(",", 1)[0].split(" ").join("%"));

            var dayOrNight = currentFavoriteWeather.weather[0].icon.substring(2);
            individualFavorite.style.backgroundColor = backgroundColorChoices[currentFavoriteWeather.weather[0].icon];

            if (dayOrNight == "n") {
                individualFavorite.style.color = "white";
            }

            var individualFavoriteLeft = document.createElement("span");
            individualFavoriteLeft.setAttribute("class", "indiviudal-favorites-city-left");

            var individualCityName = document.createElement("span");
            individualCityName.setAttribute("class", "individual-favorites-city-name");
            individualCityName.innerHTML = currentLocation.resourceSets[0].resources[0].name.split(",", 1)[0];
            individualFavoriteLeft.appendChild(individualCityName);

            var favoriteOffsetTimeCalculation = currentFavoriteWeather.dt + currentFavoriteWeather.timezone;
            var currentFavoriteLocalUnixDateTime = new Date(favoriteOffsetTimeCalculation * 1000);
            var currentFavoriteLocalHour = currentFavoriteLocalUnixDateTime.getUTCHours();
            var currentFavoriteLocalMinute = currentFavoriteLocalUnixDateTime.getUTCMinutes();
            var favoriteAMPM = "AM";

            if (currentFavoriteLocalHour >= 12) {
                favoriteAMPM = "PM";
            }
            if (currentFavoriteLocalHour == 0) {
                currentFavoriteLocalHour = 12;
            }
            if (currentFavoriteLocalHour >= 13) {
                currentFavoriteLocalHour = currentFavoriteLocalHour - 12;
            }
            if (currentFavoriteLocalMinute < 10) {
                currentFavoriteLocalMinute = "0" + currentFavoriteLocalMinute;
            }

            var currentFavoriteLocalUnixDateTimeConverted = currentFavoriteLocalHour + ":" + currentFavoriteLocalMinute + " " + favoriteAMPM;
            var currentFavoriteLocalTime = document.createElement("span");
            currentFavoriteLocalTime.setAttribute("class", "individual-favorites-city-time");
            currentFavoriteLocalTime.innerHTML = currentFavoriteLocalUnixDateTimeConverted;
            individualFavoriteLeft.appendChild(currentFavoriteLocalTime);

            individualFavorite.appendChild(individualFavoriteLeft);

            var individualFavoriteIconName = currentFavoriteWeather.weather[0].icon;
            var individualFavoriteIcon = document.createElement("img");
            individualFavoriteIcon.setAttribute("class", "individual-favorites-weather-icon");
            individualFavoriteIcon.setAttribute("src", "fontawesome-free-5.15.3-web/svgs/solid/" + individualFavoriteIconName + ".svg");
            individualFavoriteIcon.setAttribute("alt", "indiviudal-favorite-icon");
            individualFavorite.appendChild(individualFavoriteIcon);

            var individualTempNumber = Math.round(currentFavoriteWeather.main.temp);
            var individualTemperature = document.createElement("span");
            individualTemperature.setAttribute("class", "individual-favorites-weather-temperature");
            individualTemperature.innerHTML = individualTempNumber + "&deg" + unitInText;
            individualFavorite.appendChild(individualTemperature);

            individualFavorite.addEventListener("click", function () { searchWeatherInfo(individualFavorite.id, units, false); });
            insertToFavoritesCol.appendChild(individualFavorite);
        }
    };

    xhttp3.open("GET", "https://api.openweathermap.org/data/2.5/weather?lat=" + currentFavoriteLatitude + "&lon=" + currentFavoriteLongitude + "&units=" + units + "&appid=fadaf4abdb9acd83b5630fa74da62ab0", true);
    xhttp3.send();
}

function loadWeatherInfo(currentLocation, units, unitInText, windSpeedUnit, backgroundColorChoices) {
    currentLocationLocal = currentLocation;
    currentLatitude = currentLocation.resourceSets[0].resources[0].point.coordinates[0];
    currentLongitude = currentLocation.resourceSets[0].resources[0].point.coordinates[1];

    var xhttp2 = new XMLHttpRequest();

    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var currentWeather = JSON.parse(this.responseText);
            // console.log(currentWeather);

            var isFavoriteCheck = false;
            var favoritesButton = document.getElementById("favorites");

            for (var a = 0; a < favorites.length; a++) {
                if (favorites[a] == currentLocation.resourceSets[0].resources[0].name.split(",", 1)[0]) {
                    isFavoriteCheck = true;
                    favoritesButton.innerHTML = "Remove";
                    favoritesButton.style.backgroundColor = "red";
                }
            }

            if (isFavoriteCheck == false) {
                favoritesButton.innerHTML = "Favorite";
                favoritesButton.style.backgroundColor = "#6866F2";
            }

            var background = document.getElementById("entire-background");
            var iconNameString = currentWeather.current.weather[0].icon;
            background.style.backgroundColor = backgroundColorChoices[iconNameString];

            var current = document.getElementById("current-weather");
            current.innerHTML = "";

            var cityName = currentLocation.resourceSets[0].resources[0].name;
            var city = document.createElement("h2");
            city.setAttribute("class", "current-weather-city");
            city.innerHTML = cityName;
            current.appendChild(city);

            var currentTimeDiv = document.createElement("div");
            currentTimeDiv.setAttribute("class", "current-weather-time");

            var currentUnixDateTime = new Date(currentWeather.current.dt * 1000);
            var currentUnixDateTimeConverted = currentUnixDateTime.toLocaleTimeString("en-US");
            var currentTime = document.createElement("p");
            currentTime.setAttribute("class", "current-weather-time-line");
            currentTime.innerHTML = "Updated as of " + currentUnixDateTimeConverted;
            currentTimeDiv.appendChild(currentTime);

            var offsetTimeCalculation = currentWeather.current.dt + currentWeather.timezone_offset;
            var currentLocalUnixDateTime = new Date(offsetTimeCalculation * 1000);
            var currentLocalHour = currentLocalUnixDateTime.getUTCHours();
            var amPM = "AM";
            if (currentLocalHour >= 12) {
                amPM = "PM";
            }
            if (currentLocalHour === 0) {
                currentLocalHour = 12;
            }
            if (currentLocalHour >= 13) {
                currentLocalHour = currentLocalHour - 12;
            }

            var currentLocalMinute = currentLocalUnixDateTime.getUTCMinutes();
            if (currentLocalMinute <= 9) {
                currentLocalMinute = "0" + currentLocalMinute;
            }

            var currentLocalSeconds = currentLocalUnixDateTime.getUTCSeconds();
            if (currentLocalSeconds <= 9) {
                currentLocalSeconds = "0" + currentLocalSeconds;
            }
            var currentLocalUnixDateTimeConverted = currentLocalHour + ":" + currentLocalMinute + ":" + currentLocalSeconds + " " + amPM;
            var currentLocalTime = document.createElement("p");
            currentLocalTime.setAttribute("class", "current-weather-time-line");
            currentLocalTime.innerHTML = "Time in " + currentLocation.resourceSets[0].resources[0].name.split(",", 1)[0] + ": " + currentLocalUnixDateTimeConverted;
            currentTimeDiv.appendChild(currentLocalTime);

            current.appendChild(currentTimeDiv);
            var currentLeft = document.createElement("div");
            currentLeft.setAttribute("id", "current-weather-left");

            var iconName = currentWeather.current.weather[0].icon;
            var weatherImage = document.createElement("img");
            weatherImage.setAttribute("class", "current-weather-image");
            weatherImage.setAttribute("src", "fontawesome-free-5.15.3-web/svgs/solid/" + iconName + ".svg");
            weatherImage.setAttribute("alt", "forecast-icon");
            currentLeft.appendChild(weatherImage);

            var tempNumber = Math.round(currentWeather.current.temp);
            var temperature = document.createElement("p");
            temperature.setAttribute("class", "current-weather-temperature");
            //Learned how to type the degree symbol in HTML using &deg from https://stackoverflow.com/questions/37647769/why-does-the-%C3%82-character-show-on-my-html-page 
            temperature.innerHTML = tempNumber + "&deg" + unitInText;
            currentLeft.appendChild(temperature);

            var tempDescription = currentWeather.current.weather[0].description;
            var description = document.createElement("p");
            description.setAttribute("class", "current-weather-description");
            description.innerHTML = tempDescription;
            currentLeft.appendChild(description);

            current.appendChild(currentLeft);

            var currentRight = document.createElement("div");
            currentRight.setAttribute("id", "current-weather-right");

            var feelsLikeNumber = currentWeather.current.feels_like;
            var feelsLike = document.createElement("p");
            feelsLike.setAttribute("class", "current-weather-right-info");
            feelsLike.innerHTML = "Feels like: " + feelsLikeNumber + "&deg" + unitInText;
            currentRight.appendChild(feelsLike);

            var humidityNumber = currentWeather.current.humidity;
            var humidity = document.createElement("p");
            humidity.setAttribute("class", "current-weather-right-info");
            humidity.innerHTML = "Humidity: " + humidityNumber + "%";
            currentRight.appendChild(humidity);

            var windSpeedNumber = currentWeather.current.wind_speed;
            var windSpeed = document.createElement("p");
            windSpeed.setAttribute("class", "current-weather-right-info");
            windSpeed.innerHTML = "Wind Speed: " + windSpeedNumber + " " + windSpeedUnit;
            currentRight.appendChild(windSpeed);

            current.appendChild(currentRight);

            var sevenDayForecastHeading = document.createElement("h2");
            sevenDayForecastHeading.setAttribute("class", "section-heading");
            sevenDayForecastHeading.setAttribute("id", "seven-day-forecast-heading");
            sevenDayForecastHeading.innerHTML = "8-Day Forecast";
            current.appendChild(sevenDayForecastHeading);

            var sevenDayForecastSection = document.createElement("div");
            sevenDayForecastSection.setAttribute("id", "seven-day-forecast");

            for (var i = 0; i < 8; i++) {
                var individualDay = document.createElement("div");
                individualDay.setAttribute("class", "individual-day-forecast");

                //I learned to pass in Unix time to a date object to be able to parse the month, day, and year
                //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date 
                //I also learned to multiply 1000 to the unix time in order to get the Date object to 
                //recognize the date properly from https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript 
                var unixDateTime = new Date(currentWeather.daily[i].dt * 1000);
                var dayOfWeekHeading = document.createElement("p");
                dayOfWeekHeading.setAttribute("class", "individual-day-of-week");
                if (i == 0) {
                    dayOfWeekHeading.innerHTML = "Today";
                } else {
                    dayOfWeekHeading.innerHTML = dayOfWeek[unixDateTime.getDay()];
                }
                individualDay.appendChild(dayOfWeekHeading);

                var dateOfForecast = document.createElement("p");
                dateOfForecast.setAttribute("class", "individual-date-of-forecast");
                dateOfForecast.innerHTML = unixDateTime.getMonth() + 1 + "/" + unixDateTime.getDate() + "/" + unixDateTime.getFullYear();
                individualDay.appendChild(dateOfForecast);

                var forecastImage = document.createElement("img");
                forecastImage.setAttribute("class", "individual-forecast-image");
                forecastImage.setAttribute("src", "fontawesome-free-5.15.3-web/svgs/solid/" + currentWeather.daily[i].weather[0].icon + ".svg");
                forecastImage.setAttribute("alt", "individual-forecast-image-icon");
                individualDay.appendChild(forecastImage);

                var wholeDayForecast = document.createElement("p");
                wholeDayForecast.setAttribute("class", "individual-whole-day-forecast");
                wholeDayForecast.innerHTML = Math.round(currentWeather.daily[i].temp.day) + "&deg" + unitInText;
                individualDay.appendChild(wholeDayForecast);

                var minMaxForecast = document.createElement("p");
                minMaxForecast.setAttribute("class", "individual-min-max-forecast");
                minMaxForecast.innerHTML = Math.round(currentWeather.daily[i].temp.min) + "&deg" + unitInText + " / " + Math.round(currentWeather.daily[i].temp.max) + "&deg" + unitInText;
                individualDay.appendChild(minMaxForecast);

                var individualForecastDescription = document.createElement("p");
                individualForecastDescription.setAttribute("class", "individual-forecast-description");
                individualForecastDescription.innerHTML = currentWeather.daily[i].weather[0].description;
                individualDay.appendChild(individualForecastDescription);

                sevenDayForecastSection.appendChild(individualDay);

                if (i !== 7) {
                    individualDay.style.borderRight = "2px solid rgba(128, 128, 128, 0.5)";
                }
            }

            current.appendChild(sevenDayForecastSection);

            var hourlyForecastHeading = document.createElement("h2");
            hourlyForecastHeading.setAttribute("class", "section-heading");
            hourlyForecastHeading.setAttribute("id", "hourly-forecast-heading");
            hourlyForecastHeading.innerHTML = "24-Hour Forecast";
            current.appendChild(hourlyForecastHeading);

            var hourlyForecastSection = document.createElement("div");
            hourlyForecastSection.setAttribute("id", "hourly-forecast-section");

            for (var hourlyInsert = 0; hourlyInsert < 24; hourlyInsert++) {
                var individualHour = document.createElement("div");
                individualHour.setAttribute("class", "individual-hour");

                var individualHourTextLeft = document.createElement("div");
                individualHourTextLeft.setAttribute("class", "individual-hour-text-left");

                var hourUnixTime = new Date(currentWeather.hourly[hourlyInsert].dt * 1000);
                var individualHourTime = document.createElement("p");
                individualHourTime.setAttribute("class", "individual-hour-time");
                var hourUnixHour = hourUnixTime.getHours();
                var hourUnixMinute = hourUnixTime.getMinutes();
                var hourAMPM = "AM";

                if (hourUnixHour >= 12) {
                    hourAMPM = "PM";
                }
                if (hourUnixHour == 0) {
                    hourUnixHour = 12;
                }
                if (hourUnixHour >= 13) {
                    hourUnixHour = hourUnixHour - 12;
                }
                if (hourUnixMinute < 10) {
                    hourUnixMinute = "0" + hourUnixMinute;
                }

                individualHourTime.innerHTML = hourUnixHour + ":" + hourUnixMinute + " " + hourAMPM;
                individualHourTextLeft.appendChild(individualHourTime);

                var individualHourDate = document.createElement("em");
                individualHourDate.setAttribute("class", "individual-hour-date");
                individualHourDate.innerHTML = hourUnixTime.getMonth() + 1 + "/" + hourUnixTime.getDate() + "/" + hourUnixTime.getFullYear();
                individualHourTextLeft.appendChild(individualHourDate);

                individualHour.appendChild(individualHourTextLeft);

                var hourIconName = currentWeather.hourly[hourlyInsert].weather[0].icon;
                var individualHourImage = document.createElement("img");
                individualHourImage.setAttribute("class", "individual-hour-icon");
                individualHourImage.setAttribute("src", "fontawesome-free-5.15.3-web/svgs/solid/" + hourIconName + ".svg");
                individualHourImage.setAttribute("alt", "forecast-icon");
                individualHour.appendChild(individualHourImage);

                var individualHourTextRight = document.createElement("div");
                individualHourTextRight.setAttribute("class", "individual-hour-text-right");

                var individualHourTemp = document.createElement("p");
                individualHourTemp.setAttribute("class", "individual-hour-temp");
                individualHourTemp.innerHTML = Math.round(currentWeather.hourly[hourlyInsert].temp) + "&deg" + unitInText;
                individualHourTextRight.appendChild(individualHourTemp);

                var individualHourForecastDescription = document.createElement("p");
                individualHourForecastDescription.setAttribute("class", "individual-hour-description");
                individualHourForecastDescription.innerHTML = currentWeather.hourly[hourlyInsert].weather[0].description;
                individualHourTextRight.appendChild(individualHourForecastDescription);

                individualHour.appendChild(individualHourTextRight);
                if (hourlyInsert !== 11) {
                    individualHour.style.borderBottom = "2px solid rgba(128, 128, 128, 0.5)";
                }

                hourlyForecastSection.appendChild(individualHour);
            }

            current.appendChild(hourlyForecastSection);
        }
        else {
            document.getElementById("current-weather").innerHTML = "Loading weather...";
        }
    };

    xhttp2.open("GET", "https://api.openweathermap.org/data/2.5/onecall?lat=" + currentLatitude + "&lon=" + currentLongitude + "&units=" + units + "&appid=fadaf4abdb9acd83b5630fa74da62ab0", true);
    xhttp2.send();
}

function addRemoveFavorite() {
    event.preventDefault();
    var favoritesButtonCheck = document.getElementById("favorites").innerHTML;

    var newCopyOfArray = [];
    if (favoritesButtonCheck == "Remove") {
        for (var a = 0; a < favorites.length; a++) {
            if (!(favorites[a] == currentLocationLocal.resourceSets[0].resources[0].name.split(",", 1)[0])) {
                newCopyOfArray.push(favorites[a]);
            }
        }
        favorites = newCopyOfArray;
    }
    else {
        favorites.push(currentLocationLocal.resourceSets[0].resources[0].name.split(",", 1)[0]);
    }

    loadWeatherInfo(currentLocationLocal, units, unitInText, windSpeedUnit, backgroundColors);
    loadFavorites(units);
}

initialPageLoad();
document.getElementById("search-form").addEventListener("submit", searchWeather);
document.getElementById("change-unit").addEventListener("click", changeUnits);
document.getElementById("refresh").addEventListener("click", refreshWeather);
document.getElementById("refresh-favorites").addEventListener("click", refreshWeather);
document.getElementById("favorites").addEventListener("click", addRemoveFavorite);
