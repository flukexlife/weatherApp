const express = require('express');
const app = express();

app.use(express.static('public')); //ใช้ให้ Express อ่านไฟล์หน้าเว็บ
app.use(express.json()); //ใช้รับข้อมูล JSON จาก request (POST / PUT)

app.get('/api/geo', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อเมือง' });
        }
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const data = await response.json();
        if (!data.results) {
            return res.status(404).json({ error: 'ไม่พบเมือง' });
        }
        const result = data.results[0];
        res.json({
            name: result.name,
            country: result.country,
            lat: result.latitude,
            lon: result.longitude
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'ต้องส่ง lat และ lon' });
        }
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`)
        console.log(lat, lon);
        const data = await response.json();
        res.json({
            current: {
                temp: data.current.temperature_2m,
                wind: data.current.wind_speed_10m,
                humidity: data.current.relative_humidity_2m
            },
            daily: {
                max: data.daily.temperature_2m_max,
                min: data.daily.temperature_2m_min,
                code: data.daily.weather_code
            }
        })

    } catch (err) {
        res.status(500).json({ error: err.message });

    }
})

app.get('/api/cities', async (req, res) => {
    try {
        const response = await fetch(`https://countriesnow.space/api/v0.1/countries/cities`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: "Thailand"
                })
            }
        )
        const data = await response.json();
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/overview', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'ต้องส่ง lat และ lon' });
        }
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&hourly=pressure_msl&forecast_days=7&timezone=Asia%2FBangkok`);
        const weatherData = await weatherRes.json();
        const airRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=european_aqi&timezone=Asia%2FBangkok`);
        const airData = await airRes.json();
        const uvToday = weatherData.daily.uv_index_max[0];
        const pressureNow = weatherData.hourly.pressure_msl.find(v => v !== null);
        const aqiNow = airData.hourly.european_aqi.find(v => v !== null);

        res.json({
            today: {
                uv: uvToday,
                pressure: pressureNow,
                aqi: aqiNow
            },
            daily: {
                uv: weatherData.daily.uv_index_max
            }
        });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
})



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.listen(3000, () => console.log('Server is running port 3000'))

