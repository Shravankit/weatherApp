import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';
import { describe } from 'node:test';

const app = express();
const PORT = 5000 || process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

//mongoDB connection

mongoose.connect("mongodb://127.0.0.1:27017/weather-app", {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//mongodb schema and model

const weatherSchema = new mongoose.Schema({
    city: String,
    temperaure: Number,
    description: String,
});

const Weather = mongoose.model('Weather', weatherSchema);

//express Routes

app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = '704562ea927eb5ca1f31ecb71e2e038b';
    const apiURL = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try{
        const response = await axios.get(apiURL);
        const data = response.data;
        const weatherData = new Weather({
            city: data.name,
            temperaure: data.main.temp,
            description : data.weather[0].description,
        });

        await weatherData.save();

        res.json({
            city: data.name,
            temperaure: data.main.temp,
            description: data.weather[0].description,
        });
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

//server running
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})