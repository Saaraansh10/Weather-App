const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");
//initial variables
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
//initialy koi lattitude longitude ki value hogi present to usse kaam chalayenge
getfromSessionStorage();
//old tab mtlb ki current tab, newtab mtlb jis tab me jaana hai
// jis tab me hai uska naam current tab hai
// jis tab pe click krre hai uska naam clicked tab hai
function switchTab(newTab) {
    if(newTab != oldTab) {
        //purane tab ko htake nye tab ke content ko add krre hai (background color active krre hai)
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
        //kya searchform me active class ni hai mtlb vo invisible hai usko visible krna hai
        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //kya your-weather wale tab me jaana hai
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna padega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}
//usertab ko click krne pe kya hoga
userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});
//search tab ko click krne pe kya hoga
searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});
//check if cordinates are already present in session storage(local storage))
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile mtlb access ni mila to grant access wala tab show kro taaki access mile
        grantAccessContainer.classList.add("active");
    }
    //milgye to fetch krk lgao weather ki info cordinates ke aadhar pe
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
//lat longitude se city ki info aur weather nikalke show krre hai
async function fetchUserWeatherInfo(coordinates) {
    //lattitude longitude access krre hai
    const {lat, lon} = coordinates;
    // grant access container ko invisible krre hai
    grantAccessContainer.classList.remove("active");
    // loader ko visible krre hai
    loadingScreen.classList.add("active");
    //API CALL for fetching weather of your city
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();
          //info agyi to loader ko htadere
        loadingScreen.classList.remove("active");
        // userinfo ko visible krake info dikhayenge
        userInfoContainer.classList.add("active");
        // data jo mila hai usme se values nikalke ui me render krega
        renderWeatherInfo(data);
    }
    catch(err) {
        //error ayega to loading screen htayenge
        loadingScreen.classList.remove("active");
        //aur alert show krenge ki access ni hopaya weather info us city ka
        alert("Not able to show weather of your city");
    }
}
//jo info aayi usko store krre hai taaki ui me render krske
function renderWeatherInfo(weatherInfo) {
    //fetchng the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    //weatherinfo show krre hai
    console.log(weatherInfo);
    //fetch values from weatherINfo object and put it UI elements
    //optional chaining operators use krk hm json format ke andr jaake objects ko access krskte hai ?. use kr krk aisa krte hai
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}
//agr support available hai to current position ke co-ordinates lo aur unki weather info leke aao 
//ni hai to alert show krdo ki geolocation support available ni hai
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("No geolocation support available");
    }
}
//geolocation support milne ke baad cordinates leke unko session storage me save krenge aatki aage use krske weather info nikalne ke liye
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
//grant access pe click krne se kya hoga
grantAccessButton.addEventListener("click", getLocation);
//searchcity weather click krne se kya hga
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})
//weather fetching for city
async function fetchSearchWeatherInfo(city) {
    //jbtk city ki weather info leke aara tbtk loading screen lgado
    loadingScreen.classList.add("active");
    //user ke city ke weather ko hatado
    userInfoContainer.classList.remove("active");
    //grant access wale ko bhi htado
    grantAccessContainer.classList.remove("active");
    //response ko leke ayenge aur loader ko htayenge userinfo container ko dikhana pdega
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        //values jo agyi usko render krdenge ui pe
        renderWeatherInfo(data);
    }
    //ni aayi to us city ki weather ni lapare boldenge
    catch(err) {
        alert("Unable to access the weather of specified city");
    }
}