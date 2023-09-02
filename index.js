import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';


const app = express();
const port = 3000;
const API_position = 'http://api.positionstack.com/v1/forward?';
const API_weather = 'https://meteostat.p.rapidapi.com/point/daily';

const lat_default = 10.9574;
const lon_default = 106.8427;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const getCurrentDay = () => {
    const date = new Date();

    let currentDay = String(date.getDate()).padStart(2, '0');

    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

    let currentYear = date.getFullYear();
    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    return currentDate;
}
const getNext7Days = () => {
    const date = new Date();

    let currentDay = String(date.getDate() + 7).padStart(2, '0');

    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

    let currentYear = date.getFullYear();
    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    return currentDate;
}

const getDayName = (date = new Date(), locale = 'en-US') => {
    return date.toLocaleDateString(locale, { weekday: 'short' });
}

// const getFullDays = (data) => {
//     var listDayName = [];
//     const date = new Date();

//     for (var i = 0; i < data; i++) {
//         let currentDay = String(date.getDate() + i).padStart(2, '0');
//         let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
//         let currentYear = date.getFullYear();
//         let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
//         let actualName = getDayName(new Date(currentDate));
//         listDayName.push(actualName);
//     }
//     listDayName[0] = 'Today';
//     return listDayName;
// }


const getDailyData = async (lat, lon, currentDate, next7Days) => {

    const options = {
        method: 'GET',
        url: API_weather,
        params: {
            lat: lat,
            lon: lon,
            start: currentDate,
            end: next7Days
        },
        headers: {
            'X-RapidAPI-Key': 'c9d9619169mshd45c083d6ecf741p18b269jsn9c549565e7b7',
            'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
        }
    }
    const response = await axios.request(options);
    return response.data;
}

app.get('/', async (req, res) => {
    try {
        const data_weather = await getDailyData(lat_default, lon_default, getCurrentDay(), getNext7Days());
        const todayData = data_weather.data[0];
        data_weather.data.forEach(element => {
            if (getCurrentDay() === element.date) {
                element.dayName = 'Today';
            } else {
                element.dayName = getDayName(new Date(element.date));
            }
        });
        res.render('index.ejs', { content: data_weather.data, todayContent: todayData });

    } catch (error) {
        console.log(error);
    }
})



app.post('/search', async (req, res) => {
    try {
        var locationName = req.body.locationName;
        const params = {
            access_key: 'b0eaff1afe2d989e61170730b5d8fdf5',
            query: locationName
        }
        const response = await axios.get(API_position, { params });
        var result = response.data;
        const lat = result.data[0]['latitude'];
        const lon = result.data[0]['longitude'];
        let currentDay = getCurrentDay();
        let next7Days = getNext7Days();
        const data_weather = await getDailyData(lat, lon, currentDay, next7Days);
        const todayData = data_weather.data[0];
        data_weather.data.forEach(element => {
            if (getCurrentDay() === element.date) {
                element.dayName = 'Today';
            } else {
                element.dayName = getDayName(new Date(element.date));
            }
        });
        res.render('index.ejs', { content: data_weather.data, searchName: locationName, todayContent: todayData })

    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`Running on port ${port}`);
})
