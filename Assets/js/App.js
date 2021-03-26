let search = localStorage.getItem("lastSearch");
if (search === null) search = "Bujumbura";

let savedCities = [];
let showCities = false;

function init() {
  let queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    search +
    "&appid=16da2c71dd8c2c76dfce15f0f75a5dea";

  $.ajax({
    url: queryURL,
    method: "GET",
  })
    .then(function (response) {
      setMainWeatherCard(response);

      let lat = response.coord.lat;
      let lon = response.coord.lon;
      getForecast(lat, lon);

      storeLastSearch();
    })
    .fail(removeLI);
}
// saves and calls cities in local storage
function loadSavedCities() {
  $("#citiesList").html("");
  savedCities = JSON.parse(localStorage.getItem("savedCities"));

  if (savedCities === null) savedCities = [];

  for (let i = 0; i < savedCities.length; i++) {
    let $listItem = $("<li>");
    $listItem.text(savedCities[i]);
    $listItem.addClass("list-group-item");
    $listItem.attr("data-search", savedCities[i]);
    $("#citiesList").append($listItem);
  }
}
// grabs the latitude and longitude to accuratly get location of city
function getForecast(lat, lon) {
  let forecastURL =
    "https://api.openweathermap.org/data/2.5/onecall?appid=16da2c71dd8c2c76dfce15f0f75a5dea&lat=" +
    lat +
    "&lon=" +
    lon;

  $.ajax({
    url: forecastURL,
    method: "GET",
  }).then(function (forecast) {
    $("#forecastDiv").empty();

    let weatherDays = forecast.daily;

    for (let i = 1; i < 6; i++) {
      setForecastCard(weatherDays[i]);
    }

    $("#indexText").text(forecast.current.uvi);
    let uvNum = Math.floor(forecast.current.uvi);
    setUvBackground(uvNum);
  });
}

function setForecastCard(day) {
  let theDate = new Date(day.dt * 1000);
  theDate = moment(theDate).format("MM/DD/YYYY");

  let $newCard = $("<div>");
  $newCard.addClass("col-sm forecast card");
  $("#forecastDiv").append($newCard);

  let $newCardBody = $("<div>");
  $newCardBody.addClass("card-body");
  $newCard.append($newCardBody);

  let $headerRow = $("<div>");
  $headerRow.addClass("row");
  $newCardBody.append($headerRow);
  let $cardheader = $("<h4>");
  $cardheader.text(theDate);
  $cardheader.addClass("lead");
  $headerRow.append($cardheader);

  let dayIcon =
    "http://openweathermap.org/img/wn/" + day.weather[0].icon + ".png";
  let $iconRow = $("<div>");
  $iconRow.addClass("row");
  $newCardBody.append($iconRow);
  let $icon = $("<img>");
  $icon.addClass("row");
  $icon.attr("src", dayIcon);
  $icon.attr("alt", day.weather[0].description);
  $iconRow.append($icon);

  let dayTemp = ((day.temp.day - 273.15) * 9) / 5 + 32;
  dayTemp = dayTemp.toFixed(2);

  //degrees
  let $tempRow = $("<div>");
  $tempRow.addClass("row");
  $newCardBody.append($tempRow);
  let $tempParagraph = $("<p>");
  $tempParagraph.addClass("card-text");
  $tempParagraph.text("Temp: " + dayTemp + "°F");
  $tempRow.append($tempParagraph);

  //humidity
  let $humidityRow = $("<div>");
  $humidityRow.addClass("row");
  $newCardBody.append($humidityRow);
  let $humidityParagraph = $("<p>");
  $humidityParagraph.addClass("card-text");
  $humidityParagraph.text("Humidity: " + day.humidity + "%");
  $humidityRow.append($humidityParagraph);
}

// main weather card using moment date to track the time frame by days
function setMainWeatherCard(weather) {
  let townName = weather.name;
  let townCountry = weather.sys.country;
  let timeStamp = new Date(weather.dt * 1000);
  timeStamp = moment(timeStamp).format("MM/DD/YYYY");
  let headerTitle = townName + ", " + townCountry + " " + "(" + timeStamp + ")";

  let temp = ((weather.main.temp - 273.15) * 9) / 5 + 32;
  temp = temp.toFixed(2);

  let dayIcon =
    "http://openweathermap.org/img/wn/" + weather.weather[0].icon + ".png";
  // units and specs of the weather
  $("#cityHeader").text(headerTitle);
  $("#tempText").text("Temp:  " + temp + "°F");
  $("#humidityText").text("Humidity: " + weather.main.humidity + "%");
  $("#windSpeedText").text("WindSpeed: " + weather.wind.speed + "meter/sec");
  $("#mainCardIcon").attr("src", dayIcon);
  $("#mainCardIcon").attr("alt", weather.weather[0].description);
}

// UV color loop
function setUvBackground(uNum) {
  if (uNum >= 0 && uNum <= 2) {
    $("#indexText").attr("class", "uvLow");
  } else if (uNum >= 3 && uNum <= 5) {
    $("#indexText").attr("class", "uvModerate");
  } else if (uNum >= 6 && uNum <= 7) {
    $("#indexText").attr("class", "uvHigh");
  } else if (uNum >= 8 && uNum <= 10) {
    $("#indexText").attr("class", "uvHigh");
  } else {
    $("#indexText").attr("class", "uvExtreme");
  }
}

function addCityLI() {
  let listText = $("#cityInput").val();
  listText = listText.trim();

  search = listText;

  for (let i = 0; i < $(".list-group-item").length; i++) {
    if (
      $(cityInput).val().toLowerCase() ==
      $(".list-group-item")[i].innerText.toLowerCase()
    ) {
      init();
      return;
    }
  }

  let $listItem = $("<li>");
  $listItem.text(listText);
  $listItem.addClass("list-group-item");
  $listItem.attr("data-search", listText);
  $("#citiesList").append($listItem);
  $("#cityInput").val("");

  savedCities.push(listText);
  localStorage.setItem("savedCities", JSON.stringify(savedCities));
  init();
}
// clears local storage
function clearList() {
  savedCities = [];
  localStorage.clear();
  localStorage.setItem("savedCities", JSON.stringify(savedCities));

  loadSavedCities();
}

function checkForEnter(event) {
  if (event.key === "Enter") addCityLI();
}

function cityClick() {
  search = $(this).data("search");
  showCities = false;
  $(".dropDownContent").css("display", "none");

  init();
}

function removeLI() {
  for (let i = 0; i < $(".list-group-item").length; i++)
    if ($(".list-group-item")[i].innerText === search)
      $(".list-group-item")[i].remove();

  alert(search + " Is an invalid option in the API");

  savedCities.pop();
  localStorage.clear();

  localStorage.setItem("savedCities", JSON.stringify(savedCities));
}

function displayList() {
  if (savedCities.length === 0) {
    alert("no previous city search");
  }
  if (showCities === false) {
    showCities = true;
    $(".dropDownContent").css("display", "block");
    return;
  }
  showCities = false;
  $(".dropDownContent").css("display", "none");
}
// stores the last city searched
function storeLastSearch() {
  localStorage.setItem("lastSearch", search);
}
// buttons
$("#citiesList").on("click", "li", cityClick);

$("#preSetCities").on("click", "li", cityClick);

$("#addBtn").click(addCityLI);

$("#cityInput").keypress(checkForEnter);

$("#clearButton").click(clearList);

$("#savedListButton").click(displayList);

window.addEventListener("click", function (event) {
  if (!event.target.matches("button")) {
    showCities = false;
    $(".dropDownContent").css("display", "none");
  }
});

loadSavedCities();
init();
