const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=87VK637QGAD5TDTA2D9PSXRZP&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

cities = [
  {
    name: "Delhi", 
    lat: "28.6100", 
    lng: "77.2300", 
    country: "IN"
  },
  {
    name: "Mumbai", 
    lat: "19.0761", 
    lng: "72.8775", 
    country: "IN"
  },
  {
    name: "Kolkāta", 
    lat: "22.5675", 
    lng: "88.3700", 
    country: "IN"
  },
  {
    name: "Bangalore", 
    lat: "12.9789", 
    lng: "77.5917", 
    country: "IN"
  },
  {
    name: "Chennai", 
    lat: "13.0825", 
    lng: "80.2750", 
    country: "IN"
  },
  {
    name: "Hyderābād", 
    lat: "17.3617", 
    lng: "78.4747", 
    country: "IN"
  },
  {
    name: "Pune", 
    lat: "18.5203", 
    lng: "73.8567", 
    country: "IN"
  },
  {
    name: "Ahmedabad", 
    lat: "23.0225", 
    lng: "72.5714", 
    country: "IN"
  },
  {
    name: "Sūrat", 
    lat: "21.1702", 
    lng: "72.8311", 
    country: "IN"
  },
  {
    name: "Lucknow", 
    lat: "26.8500", 
    lng: "80.9500", 
    country: "IN"
  },
  {
    name: "Jaipur", 
    lat: "26.9000", 
    lng: "75.8000", 
    country: "IN"
  },
  {
    name: "Kanpur", 
    lat: "26.4499", 
    lng: "80.3319", 
    country: "IN"
  },
  {
    name: "Mirzāpur", 
    lat: "25.1460", 
    lng: "82.5690", 
    country: "IN"
  },
  {
    name: "Nāgpur", 
    lat: "21.1497", 
    lng: "79.0806", 
    country: "IN"
  },
  {
    name: "Ghāziābād", 
    lat: "28.6700", 
    lng: "77.4200", 
    country: "IN"
  },
  {
    name: "Supaul", 
    lat: "26.1260", 
    lng: "86.6050", 
    country: "IN"
  },
  {
    name: "Vadodara", 
    lat: "22.3000", 
    lng: "73.2000", 
    country: "IN"
  },
  {
    name: "Rājkot", 
    lat: "22.3000", 
    lng: "70.7833", 
    country: "IN"
  },
  {
    name: "Vishākhapatnam", 
    lat: "17.7042", 
    lng: "83.2978", 
    country: "IN"
  },
  {
    name: "Indore", 
    lat: "22.7167", 
    lng: "75.8472", 
    country: "IN"
  },
  {
    name: "Thāne", 
    lat: "19.1972", 
    lng: "72.9722", 
    country: "IN"
  },
  {
    name: "Bhopāl", 
    lat: "23.2599", 
    lng: "77.4126", 
    country: "IN"
  },
  {
    name: "Pimpri-Chinchwad", 
    lat: "18.6186", 
    lng: "73.8037", 
    country: "IN"
  },
  {
    name: "Patna", 
    lat: "25.5940", 
    lng: "85.1376", 
    country: "IN"
  },
  {
    name: "Bilāspur", 
    lat: "22.0900", 
    lng: "82.1500", 
    country: "IN"
  },
  {
    name: "Ludhiāna", 
    lat: "30.9100", 
    lng: "75.8500", 
    country: "IN"
  },
  {
    name: "Āgra", 
    lat: "27.1800", 
    lng: "78.0200", 
    country: "IN"
  },
  {
    name: "Madurai", 
    lat: "9.9252", 
    lng: "78.1198", 
    country: "IN"
  },
  {
    name: "Jamshedpur", 
    lat: "22.7925", 
    lng: "86.1842", 
    country: "IN"
  },
  {
    name: "Prayagraj", 
    lat: "25.4358", 
    lng: "81.8464", 
    country: "IN"
  },
  {
    name: "Nāsik", 
    lat: "19.9975", 
    lng: "73.7898", 
    country: "IN"
  },
  {
    name: "Farīdābād", 
    lat: "28.4211", 
    lng: "77.3078", 
    country: "IN"
  },
  {
    name: "Meerut", 
    lat: "28.9800", 
    lng: "77.7100", 
    country: "IN"
  },
  {
    name: "Jabalpur", 
    lat: "23.1667", 
    lng: "79.9333", 
    country: "IN"
  },
  {
    name: "Kalyān", 
    lat: "19.2502", 
    lng: "73.1602", 
    country: "IN"
  },
  {
    name: "Vasai-Virar", 
    lat: "19.3607", 
    lng: "72.7956", 
    country: "IN"
  },
  {
    name: "Najafgarh", 
    lat: "28.6092", 
    lng: "76.9798", 
    country: "IN"
  },
  {
    name: "Vārānasi", 
    lat: "25.3189", 
    lng: "83.0128", 
    country: "IN"
  },
  {
    name: "Srīnagar", 
    lat: "34.0900", 
    lng: "74.7900", 
    country: "IN"
  },
  {
    name: "Aurangābād", 
    lat: "19.8800", 
    lng: "75.3200", 
    country: "IN"
  },
  {
    name: "Dhanbād", 
    lat: "23.7998", 
    lng: "86.4305", 
    country: "IN"
  },
  {
    name: "Amritsar", 
    lat: "31.6400", 
    lng: "74.8600", 
    country: "IN"
  },
  {
    name: "Alīgarh", 
    lat: "27.8800", 
    lng: "78.0800", 
    country: "IN"
  },
  {
    name: "Guwāhāti", 
    lat: "26.1722", 
    lng: "91.7458", 
    country: "IN"
  },
  {
    name: "Hāora", 
    lat: "22.5800", 
    lng: "88.3294", 
    country: "IN"
  },
  {
    name: "Rānchi", 
    lat: "23.3600", 
    lng: "85.3300", 
    country: "IN"
  },
  {
    name: "Gwalior", 
    lat: "26.2124", 
    lng: "78.1772", 
    country: "IN"
  },
  {
    name: "Chandīgarh", 
    lat: "30.7500", 
    lng: "76.7800", 
    country: "IN"
  },
  {
    name: "Haldwāni", 
    lat: "29.2200", 
    lng: "79.5200", 
    country: "IN"
  },
  {
    name: "Vijayavāda", 
    lat: "16.5193", 
    lng: "80.6305", 
    country: "IN"
  },
  {
    name: "Jodhpur", 
    lat: "26.2800", 
    lng: "73.0200", 
    country: "IN"
  },
  {
    name: "Raipur", 
    lat: "21.2444", 
    lng: "81.6306", 
    country: "IN"
  },
  {
    name: "Kota", 
    lat: "25.1800", 
    lng: "75.8300", 
    country: "IN"
  },
  {
    name: "Bhayandar", 
    lat: "19.2900", 
    lng: "72.8500", 
    country: "IN"
  },
  {
    name: "Loni", 
    lat: "28.7500", 
    lng: "77.2800", 
    country: "IN"
  },
  {
    name: "Ambattūr", 
    lat: "13.1143", 
    lng: "80.1548", 
    country: "IN"
  },
  {
    name: "Salt Lake City", 
    lat: "22.6100", 
    lng: "88.4000", 
    country: "IN"
  },
  {
    name: "Bhātpāra", 
    lat: "22.8700", 
    lng: "88.4100", 
    country: "IN"
  },
  {
    name: "Kūkatpalli", 
    lat: "17.4849", 
    lng: "78.4138", 
    country: "IN"
  },
  {
    name: "Dāsarhalli", 
    lat: "13.0465", 
    lng: "77.5130", 
    country: "IN"
  },
  {
    name: "Muzaffarpur", 
    lat: "26.1225", 
    lng: "85.3906", 
    country: "IN"
  },
  {
    name: "Oulgaret", 
    lat: "11.9570", 
    lng: "79.7737", 
    country: "IN"
  },
  {
    name: "New Delhi", 
    lat: "28.6139", 
    lng: "77.2089", 
    country: "IN"
  },
  {
    name: "Tiruvottiyūr", 
    lat: "13.1600", 
    lng: "80.3000", 
    country: "IN"
  },
  {
    name: "Puducherry", 
    lat: "11.9167", 
    lng: "79.8167", 
    country: "IN"
  },
  {
    name: "Byatarayanpur", 
    lat: "13.0659", 
    lng: "77.5922", 
    country: "IN"
  },
  {
    name: "Pallāvaram", 
    lat: "12.9675", 
    lng: "80.1491", 
    country: "IN"
  },
  {
    name: "Secunderābād", 
    lat: "17.4399", 
    lng: "78.4983", 
    country: "IN"
  },
  {
    name: "Shimla", 
    lat: "31.1033", 
    lng: "77.1722", 
    country: "IN"
  },
  {
    name: "Puri", 
    lat: "19.8000", 
    lng: "85.8167", 
    country: "IN"
  },
  {
    name: "Murtazābād", 
    lat: "28.7111", 
    lng: "77.2688", 
    country: "IN"
  },
  {
    name: "Shrīrāmpur", 
    lat: "22.7500", 
    lng: "88.3400", 
    country: "IN"
  },
  {
    name: "Chandannagar", 
    lat: "22.8700", 
    lng: "88.3800", 
    country: "IN"
  },
  {
    name: "Sultānpur Mazra", 
    lat: "28.6981", 
    lng: "77.0689", 
    country: "IN"
  },
  {
    name: "Krishnanagar", 
    lat: "23.4000", 
    lng: "88.5000", 
    country: "IN"
  },
  {
    name: "Bārākpur", 
    lat: "22.7600", 
    lng: "88.3700", 
    country: "IN"
  },
  {
    name: "Bhālswa Jahangirpur", 
    lat: "28.7354", 
    lng: "77.1638", 
    country: "IN"
  },
  {
    name: "Nāngloi Jāt", 
    lat: "28.6833", 
    lng: "77.0667", 
    country: "IN"
  },
  {
    name: "Balasore", 
    lat: "21.5033", 
    lng: "86.9250", 
    country: "IN"
  },
  {
    name: "Dalūpura", 
    lat: "28.6004", 
    lng: "77.3194", 
    country: "IN"
  },
  {
    name: "Yelahanka", 
    lat: "13.1007", 
    lng: "77.5963", 
    country: "IN"
  },
  {
    name: "Titāgarh", 
    lat: "22.7400", 
    lng: "88.3700", 
    country: "IN"
  },
  {
    name: "Dam Dam", 
    lat: "22.6200", 
    lng: "88.4200", 
    country: "IN"
  },
  {
    name: "Bānsbāria", 
    lat: "22.9700", 
    lng: "88.4000", 
    country: "IN"
  },
  {
    name: "Madhavaram", 
    lat: "13.1482", 
    lng: "80.2314", 
    country: "IN"
  },
  {
    name: "Abbigeri", 
    lat: "13.0767", 
    lng: "77.5250", 
    country: "IN"
  },
  {
    name: "Baj Baj", 
    lat: "22.4828", 
    lng: "88.1818", 
    country: "IN"
  },
  {
    name: "Garhi", 
    lat: "28.6317", 
    lng: "77.3186", 
    country: "IN"
  },
  {
    name: "Mīrpeta", 
    lat: "17.3200", 
    lng: "78.5200", 
    country: "IN"
  },
  {
    name: "Nerkunram", 
    lat: "13.0619", 
    lng: "80.2094", 
    country: "IN"
  },
  {
    name: "Kendrāparha", 
    lat: "20.5000", 
    lng: "86.4200", 
    country: "IN"
  },
  {
    name: "Sijua", 
    lat: "23.7762", 
    lng: "86.3303", 
    country: "IN"
  },
  {
    name: "Manali", 
    lat: "13.1667", 
    lng: "80.2667", 
    country: "IN"
  },
  {
    name: "Kānkuria", 
    lat: "24.6523", 
    lng: "87.9604", 
    country: "IN"
  },
  {
    name: "Chakapara", 
    lat: "22.6300", 
    lng: "88.3500", 
    country: "IN"
  },
  {
    name: "Pāppākurichchi", 
    lat: "10.8137", 
    lng: "78.7481", 
    country: "IN"
  },
  {
    name: "Herohalli", 
    lat: "12.9911", 
    lng: "77.4873", 
    country: "IN"
  },
  {
    name: "Madipakkam", 
    lat: "12.9623", 
    lng: "80.1986", 
    country: "IN"
  },
  {
    name: "Sabalpur", 
    lat: "25.6053", 
    lng: "85.1835", 
    country: "IN"
  },
  {
    name: "Bāuria", 
    lat: "22.4521", 
    lng: "88.1853", 
    country: "IN"
  },
  {
    name: "Salua", 
    lat: "22.6100", 
    lng: "88.2700", 
    country: "IN"
  },
  {
    name: "Chik Bānavar", 
    lat: "13.0846", 
    lng: "77.5014", 
    country: "IN"
  },
  {
    name: "Jālhalli", 
    lat: "13.0333", 
    lng: "77.5500", 
    country: "IN"
  },
  {
    name: "Chinnasekkadu", 
    lat: "13.1609", 
    lng: "80.2573", 
    country: "IN"
  },
  {
    name: "Jethuli", 
    lat: "25.5378", 
    lng: "85.2841", 
    country: "IN"
  },
  {
    name: "Nagtala", 
    lat: "22.4667", 
    lng: "88.3833", 
    country: "IN"
  },
  {
    name: "Pakri", 
    lat: "25.5876", 
    lng: "85.1580", 
    country: "IN"
  },
  {
    name: "Hunasamaranhalli", 
    lat: "13.1435", 
    lng: "77.6200", 
    country: "IN"
  },
  {
    name: "Hesarghatta", 
    lat: "13.1391", 
    lng: "77.4783", 
    country: "IN"
  },
  {
    name: "Bommayapālaiyam", 
    lat: "11.9922", 
    lng: "79.8499", 
    country: "IN"
  },
  {
    name: "Gundūr", 
    lat: "10.7339", 
    lng: "78.7184", 
    country: "IN"
  },
  {
    name: "Punādih", 
    lat: "25.5484", 
    lng: "85.2649", 
    country: "IN"
  },
  {
    name: "Harilādih", 
    lat: "23.7333", 
    lng: "86.4000", 
    country: "IN"
  },
  {
    name: "Alāwalpur", 
    lat: "25.4958", 
    lng: "85.2021", 
    country: "IN"
  },
  {
    name: "Mādnāikanhalli", 
    lat: "13.0626", 
    lng: "77.4642", 
    country: "IN"
  },
  {
    name: "Bāgalūr", 
    lat: "13.1330", 
    lng: "77.6660", 
    country: "IN"
  },
  {
    name: "Kādiganahalli", 
    lat: "13.1687", 
    lng: "77.6283", 
    country: "IN"
  },
  {
    name: "Khānpur Zabti", 
    lat: "28.7103", 
    lng: "77.2781", 
    country: "IN"
  },
  {
    name: "Mahuli", 
    lat: "25.5430", 
    lng: "85.2268", 
    country: "IN"
  },
  {
    name: "Zeyādah Kot", 
    lat: "22.4445", 
    lng: "88.3345", 
    country: "IN"
  },
  {
    name: "Arshakunti", 
    lat: "13.0785", 
    lng: "77.4225", 
    country: "IN"
  },
  {
    name: "Mirchi", 
    lat: "25.5554", 
    lng: "85.2139", 
    country: "IN"
  },
  {
    name: "Sonudih", 
    lat: "25.1155", 
    lng: "87.0214", 
    country: "IN"
  },
  {
    name: "Bayandhalli", 
    lat: "12.9779", 
    lng: "77.5688", 
    country: "IN"
  },
  {
    name: "Sondekoppa", 
    lat: "13.0000", 
    lng: "77.3667", 
    country: "IN"
  },
  {
    name: "Babura", 
    lat: "25.0851", 
    lng: "87.1092", 
    country: "IN"
  },
  {
    name: "Mādavar", 
    lat: "13.0525", 
    lng: "77.4732", 
    country: "IN"
  },
  {
    name: "Kadabgeri", 
    lat: "12.9965", 
    lng: "77.4331", 
    country: "IN"
  },
  {
    name: "Nanmangalam", 
    lat: "12.9381", 
    lng: "80.1753", 
    country: "IN"
  },
  {
    name: "Taliganja", 
    lat: "22.5041", 
    lng: "88.3598", 
    country: "IN"
  },
  {
    name: "Tarchha", 
    lat: "25.1116", 
    lng: "87.0964", 
    country: "IN"
  },
  {
    name: "Belgharia", 
    lat: "22.6581", 
    lng: "88.3852", 
    country: "IN"
  },
  {
    name: "Kammanhalli", 
    lat: "13.0155", 
    lng: "77.6381", 
    country: "IN"
  },
  {
    name: "Ambāpuram", 
    lat: "16.5990", 
    lng: "80.8938", 
    country: "IN"
  },
  {
    name: "Sonnappanhalli", 
    lat: "13.1557", 
    lng: "77.6179", 
    country: "IN"
  },
  {
    name: "Kedihāti", 
    lat: "22.6508", 
    lng: "88.4608", 
    country: "IN"
  },
  {
    name: "Doddajīvanhalli", 
    lat: "13.0086", 
    lng: "77.6143", 
    country: "IN"
  },
  {
    name: "Simli Murārpur", 
    lat: "25.5792", 
    lng: "85.2401", 
    country: "IN"
  },
  {
    name: "Sonāwān", 
    lat: "25.5445", 
    lng: "85.2387", 
    country: "IN"
  },
  {
    name: "Devanandapur", 
    lat: "22.9326", 
    lng: "88.3729", 
    country: "IN"
  },
  {
    name: "Tribeni", 
    lat: "22.9867", 
    lng: "88.3987", 
    country: "IN"
  },
  {
    name: "Huttanhalli", 
    lat: "13.1651", 
    lng: "77.6512", 
    country: "IN"
  },
  {
    name: "Nathupur", 
    lat: "25.5163", 
    lng: "85.2544", 
    country: "IN"
  },
  {
    name: "Bāli", 
    lat: "25.4810", 
    lng: "85.2227", 
    country: "IN"
  },
  {
    name: "Vājarhalli", 
    lat: "13.1022", 
    lng: "77.4111", 
    country: "IN"
  },
  {
    name: "Alija Kotla", 
    lat: "17.2333", 
    lng: "78.5500", 
    country: "IN"
  },
  {
    name: "Saino", 
    lat: "25.1134", 
    lng: "87.0108", 
    country: "IN"
  },
  {
    name: "Shekhpura", 
    lat: "25.5725", 
    lng: "85.1428", 
    country: "IN"
  },
  {
    name: "Cāchohalli", 
    lat: "13.0010", 
    lng: "77.4717", 
    country: "IN"
  },
  {
    name: "Andheri", 
    lat: "19.2104", 
    lng: "73.0464", 
    country: "IN"
  },
  {
    name: "Nārāyanpur Kola", 
    lat: "25.1293", 
    lng: "87.0076", 
    country: "IN"
  },
  {
    name: "Gyan Chak", 
    lat: "25.5496", 
    lng: "85.2423", 
    country: "IN"
  },
  {
    name: "Kasgatpur", 
    lat: "13.1101", 
    lng: "77.5045", 
    country: "IN"
  },
  {
    name: "Kitanelli", 
    lat: "13.0095", 
    lng: "77.4191", 
    country: "IN"
  },
  {
    name: "Harchandi", 
    lat: "25.1000", 
    lng: "87.0442", 
    country: "IN"
  },
  {
    name: "Santoshpur", 
    lat: "22.4650", 
    lng: "88.2193", 
    country: "IN"
  },
  {
    name: "Bendravādi", 
    lat: "12.3636", 
    lng: "76.9137", 
    country: "IN"
  },
  {
    name: "Kodagihalli", 
    lat: "12.9771", 
    lng: "77.4651", 
    country: "IN"
  },
  {
    name: "Harna Buzurg", 
    lat: "25.0981", 
    lng: "87.0148", 
    country: "IN"
  },
  {
    name: "Mailanhalli", 
    lat: "13.1863", 
    lng: "77.6963", 
    country: "IN"
  },
  {
    name: "Sultānpur", 
    lat: "25.5248", 
    lng: "85.2507", 
    country: "IN"
  },
  {
    name: "Adakimāranhalli", 
    lat: "13.0633", 
    lng: "77.4417", 
    country: "IN"
  }
];