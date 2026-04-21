const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /api/weather - Get weather for Skanes, Monastir, Tunisia
router.get('/', async (req, res) => {
  try {
    // Coordinates for Skanes, Monastir, Tunisia (approximate)
    const lat = 35.7643;
    const lon = 10.8113;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric' // Celsius
      }
    });

    const temperature = Math.round(response.data.main.temp);
    const location = response.data.name;

    res.json({
      temperature,
      location,
      description: response.data.weather[0].description
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;