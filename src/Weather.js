import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import sunnyAnimation from './animations/sunny.json';
import rainAnimation from './animations/rain.json';
import snowAnimation from './animations/snow.json';
import cloudsAnimation from './animations/clouds.json';
import './Weather.css';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [background, setBackground] = useState('');
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [animationData, setAnimationData] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState('C'); 
  const apiKey = '68649aa28e5102ceb93f0691549b88cb';
  const unsplashAccessKey = 'jkoJA-q1z5c3BiMeZitAcLuQDLFINmDHgMbvLdf5jyA'; 

  // Location information
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location', error);
          setError('Unable to retrieve your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // Weather with coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
        setError(null);
        setCity(data.name); // City from API
        fetchBackground(data.weather[0].description);
        setAnimationData(getAnimationData(data.weather[0].main));
      } else {
        setError(data.message || 'Failed to fetch weather data');
        setWeather(null);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      setWeather(null);
    }
  };

  // Weather by city name
  const fetchWeatherByCity = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
        setError(null);
        setCity(data.name); // City from API
        fetchBackground(data.weather[0].description);
        setAnimationData(getAnimationData(data.weather[0].main));
      } else {
        setError(data.message || 'City not found');
        setWeather(null);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      setWeather(null);
    }
  };

  // Bckground image from Unsplash
  const fetchBackground = async (query) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${unsplashAccessKey}`
      );
      const data = await response.json();
      setBackground(data.urls.full);
    } catch (err) {
      console.error('Failed to fetch background image', err);
    }
  };

  // Animation data based on weather type
  const getAnimationData = (weatherType) => {
    switch (weatherType.toLowerCase()) {
      case 'clear':
        return sunnyAnimation;
      case 'rain':
        return rainAnimation;
      case 'snow':
        return snowAnimation;
      case 'clouds':
        return cloudsAnimation;
      default:
        return null;
    }
  };

  // Temperature conversion
  const convertTemperature = (temp) => {
    if (temperatureUnit === 'C') {
      return `${temp.toFixed(1)}°C`;
    } else if (temperatureUnit === 'F') {
      return `${((temp * 9) / 5 + 32).toFixed(1)}°F`;
    } else if (temperatureUnit === 'K') {
      return `${(temp + 273.15).toFixed(1)}K`;
    }
    return `${temp.toFixed(1)}°C`;
  };

  // Search for weather by city
  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeatherByCity(inputCity);
  };

  // Background image when component mounts
  useEffect(() => {
    if (background) {
      document.body.style.backgroundImage = `url(${background})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
  }, [background]);

  // Get user location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // Get favorite cities from local storage when component mounts
  useEffect(() => {
    const savedCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    setFavoriteCities(savedCities);
  }, []);

  // Check if city is already in favorites
  const addToFavorites = () => {
    if (city && !favoriteCities.includes(city)) {
      const updatedFavorites = [...favoriteCities, city];
      setFavoriteCities(updatedFavorites);
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
    }
  };

  // Remove city from favorites
  const removeFromFavorites = (cityToRemove) => {
    const updatedFavorites = favoriteCities.filter((city) => city !== cityToRemove);
    setFavoriteCities(updatedFavorites);
    localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
  };

  return (
    <div className={`weather-app ${isDarkMode ? 'dark' : ''}`}>
      <h1>Weather App</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city name"
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="weather-info">
          <h2>Weather in {weather.name}</h2>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: '150px', height: '150px' }}
            />
          )}
          <p>Temperature: {convertTemperature(weather.main.temp)}</p>
          <p>Weather: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <div className="temperature-unit">
            <button
              onClick={() => setTemperatureUnit('C')}
              style={{
                marginRight: '10px',
                background: temperatureUnit === 'C' ? '#007bff' : '#ccc',
                color: temperatureUnit === 'C' ? '#fff' : '#000',
              }}
            >
              °C
            </button>
            <button
              onClick={() => setTemperatureUnit('F')}
              style={{
                marginRight: '10px',
                background: temperatureUnit === 'F' ? '#007bff' : '#ccc',
                color: temperatureUnit === 'F' ? '#fff' : '#000',
              }}
            >
              °F
            </button>
            <button
              onClick={() => setTemperatureUnit('K')}
              style={{
                background: temperatureUnit === 'K' ? '#007bff' : '#ccc',
                color: temperatureUnit === 'K' ? '#fff' : '#000',
              }}
            >
              K
            </button>
          </div>
          <button
            onClick={addToFavorites}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add to Favorites
          </button>
        </div>
      )}
      <button
        onClick={getUserLocation}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Get My Location
      </button>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: isDarkMode ? '#333' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
      <div className="favorites">
        <h3>Favorite Cities</h3>
        {favoriteCities.length > 0 ? (
          <ul>
            {favoriteCities.map((favCity) => (
              <li key={favCity}>
                <span onClick={() => setCity(favCity)} style={{ cursor: 'pointer' }}>
                  {favCity}
                </span>
                <button
                  onClick={() => removeFromFavorites(favCity)}
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No favorite cities yet.</p>
        )}
      </div>
    </div>
  );
};

export default Weather;