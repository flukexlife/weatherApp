
const cityName = document.getElementById('cityName');

cityName.addEventListener('keydown', e =>
    e.key === 'Enter' && getWeather()
);

async function getWeather() {
    try {

        let city = cityName.value.trim();

        if (!city) {
            alert("กรอกชื่อเมือง!")
        }
        console.log(city)
        const geoRes = await fetch(`/api/geo?city=${city}`);
        const geoData = await geoRes.json();
        console.log(geoData);
        const geoLat = geoData.lat;
        const geoLon = geoData.lon;
        const weatherRes = await fetch(`http://localhost:3000/api/weather?lat=${geoLat}&lon=${geoLon}`)
        const weatherData = await weatherRes.json();
        console.log(weatherData);
        document.getElementById('weatherTemp').textContent = weatherData.current.temp + "°C";
        getIcon(weatherData.daily.code[0])
        document.getElementById('city').textContent = geoData.name;
        document.getElementById("day").textContent = new Date().toLocaleDateString("en-US", { weekday: "long" });

        document.getElementById('minImg').src = `image/Temperature 01.png`
        document.getElementById("min").textContent = " Min Temperature - " + weatherData.daily.min[0] + "°C";
        document.getElementById('maxImg').src = `image/Temperature 02.png`
        document.getElementById("max").textContent = " Max Temperature - " + weatherData.daily.max[0] + "°C";

        document.getElementById('humImg').src = `image/water.png`
        document.getElementById("humValue").textContent = `${weatherData.current.humidity}%`;
        document.getElementById("humLabel").textContent = "Humidity";
        document.getElementById('windImg').src = `image/wind.png`
        document.getElementById("windValue").textContent = `${weatherData.current.wind}km/h`;
        document.getElementById("windLabel").textContent = "Wind Speed";

        getDaily();
        getOverview();


    } catch (err) {
        console.error(err)
    }
}

async function loadCities() {
    try {
        const cityApiURL = await fetch(`http://localhost:3000/api/cities`)
        const cities = await cityApiURL.json();
        const select = document.getElementById("citySelect");

        cities.data.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            select.appendChild(option);
        });

    } catch (err) {
        console.error(err);
    }
}

const getIcon = (c) => {
    if (c === 0 || c === 1) return document.getElementById('weatherImg').src = `image/vecteezy_sun-on-transparent-background_19781530 1.png`; //แดด
    if (c === 2 || c === 3) return document.getElementById('weatherImg').src = `image/vecteezy_cloudy-on-transparent-background_19781556 1.png`; //เมฆ
    if (c === 45 || c === 48) return document.getElementById('weatherImg').src = `image/vecteezy_windy-cloud-on-transparent-background_19552646 1.png`; //หมอก
    if (c >= 51 && c <= 67) return document.getElementById('weatherImg').src = "image/vecteezy_rain-on-transparent-background_19781571 1.png";
    if (c >= 80 && c <= 82) return document.getElementById('weatherImg').src = "image/vecteezy_rain-on-transparent-background_19781571 1.png";
    if (c >= 95) return document.getElementById('weatherImg').src = "image/vecteezy_thunderstorm-on-transparent-background_19552647 1.png";
    return "unknown"
}


const getIconImg = (c) => {
    if (c === 0 || c === 1) return "image/vecteezy_sun-on-transparent-background_19781530 1.png"; //แดด
    if (c === 2 || c === 3) return "image/vecteezy_cloudy-on-transparent-background_19781556 1.png"; //เมฆ
    if (c === 45 || c === 48) return "image/vecteezy_windy-cloud-on-transparent-background_19552646 1.png"; //หมอก
    if (c >= 51 && c <= 67) return "image/vecteezy_rain-on-transparent-background_19781571 1.png"; //ฝน
    if (c >= 80 && c <= 82) return "image/vecteezy_rain-on-transparent-background_19781571 1.png"; //ฝน
    if (c >= 95) return "image/vecteezy_thunderstorm-on-transparent-background_19552647 1.png"; //พายุ 

    return "image/vecteezy_cloudy-on-transparent-background_19781556 1.png"; //default
}




async function getDaily() {
    let city = cityName.value.trim();
    dailyObj = []
    const geoRes = await fetch(`/api/geo?city=${city}`);
    const geoData = await geoRes.json();
    console.log(geoData);
    const geoLat = geoData.lat;
    const geoLon = geoData.lon;
    const weatherRes = await fetch(`http://localhost:3000/api/weather?lat=${geoLat}&lon=${geoLon}`)
    const weatherData = await weatherRes.json();
    let count = 1
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setDate(d.getDate() + count);
        dailyObj.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            max: weatherData.daily.max[count],
            min: weatherData.daily.max[count],
            code: weatherData.daily.code[count]
        })
        count++;
    }
    let html = "";
    dailyObj.forEach(item => {
        html += `
        <div class="d1">
            <p>${item.day}</p>
            <img src="${getIconImg(item.code)}" alt="">
            <p>${item.max}°</p>
        </div>
    `;
    })
    document.getElementById('hero').innerHTML = html;
    console.log(dailyObj);
}

async function getOverview() {
    let city = cityName.value.trim();
    const geoRes = await fetch(`/api/geo?city=${city}`);
    const geoData = await geoRes.json();
    console.log(geoData);
    const geoLat = geoData.lat;
    const geoLon = geoData.lon;
    const overviewRes = await fetch(`http://localhost:3000/api/overview?lat=${geoLat}&lon=${geoLon}`)
    const overviewData = await overviewRes.json();
    console.log(overviewData);
    document.getElementById('aqiData').textContent = overviewData.today.aqi;
    document.getElementById('aqiLevel').textContent = getAQILevel(overviewData.today.aqi);

    document.getElementById('uvData').textContent = overviewData.today.uv;
    document.getElementById('uvLevel').textContent = getUVLevel(overviewData.today.uv);

    document.getElementById('preData').textContent = overviewData.today.pressure;
    document.getElementById('preLevel').textContent = getPressureLevel(overviewData.today.pressure);





}


function getAQILevel(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate ";
    if (aqi <= 150) return "Unhealthy (Sensitive) ";
    if (aqi <= 200) return "Unhealthy ";
    return "Hazardous";
}

function getUVLevel(uv) {
    if (uv <= 2) return "Low ";
    if (uv <= 5) return "Moderate ";
    if (uv <= 7) return "High ";
    if (uv <= 10) return "Very High ";
    return "Extreme ";
}

function getPressureLevel(p) {
    if (p < 1000) return "Low ";
    if (p <= 1020) return "Normal ";
    return "High ";
}