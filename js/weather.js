const API_KEY = 'b326dc45b8a7f34f21a8f3112d4840b7';
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

const weatherConditionPages = {
    cold: 'cold-day.html',      
    mild: 'mild-day.html',       
    hot: 'hot-day.html',        
    
    clear: 'sunny-day.html',    
    clouds: 'cloudy-day.html',   
    rain: 'rainy-day.html',     
    wind: 'windy-day.html',      
    snow: 'cold-day.html',  
    mist: 'cloudy-day.html',
    thunderstorm: 'rainy-day.html',
};

let currentWeatherData = null;

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('current-time').textContent = timeString;
}

setInterval(updateTime, 60000);
updateTime();

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error').textContent = message;
    document.getElementById('error').style.display = 'block';
    hideLoading();
}

async function getCurrentWeather(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
        throw new Error(`Weather data not found for "${city}". Please check the city name.`);
    }

    return await response.json();
}

async function getForecast(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
        throw new Error(`Forecast data not found for "${city}".`);
    }

    return await response.json();
}

function getRecommendedPage(weatherData) {
    const temperature = weatherData.main.temp;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind.speed * 3.6;
    

    if (weatherMain === 'thunderstorm') {
        return weatherConditionPages.thunderstorm;
    }
    
    if (weatherMain === 'rain' || weatherMain === 'drizzle') {
        return weatherConditionPages.rain;
    }
    
    if (weatherMain === 'snow') {
        return weatherConditionPages.snow;
    }
    
    if (windSpeed > 25) {
        return weatherConditionPages.wind;
    }
    
    if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze') {
        return weatherConditionPages.mist;
    }
    
    if (weatherMain === 'clear') {
        if (temperature > 28) {
            return weatherConditionPages.hot;
        } else if (temperature < 20) {
            return weatherConditionPages.cold;
        } else {
            return weatherConditionPages.clear; 
        }
    }
    
    if (weatherMain === 'clouds') {
        if (temperature > 28) {
            return weatherConditionPages.hot;
        } else if (temperature < 20) {
            return weatherConditionPages.cold;
        } else {
            return weatherConditionPages.clouds;
        }
    }
    
    if (temperature < 20) {
        return weatherConditionPages.cold;
    } else if (temperature > 28) {
        return weatherConditionPages.hot;
    } else {
        return weatherConditionPages.mild;
    }
}

function getRecommendationText(weatherData) {
    const temperature = weatherData.main.temp;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind.speed * 3.6;
    
    if (weatherMain === 'thunderstorm') {
        return "Stormy weather ahead! Check our rainy day outfit recommendations.";
    }
    
    if (weatherMain === 'rain' || weatherMain === 'drizzle') {
        return "It's raining! Discover perfect rainy day fashion choices.";
    }
    
    if (weatherMain === 'snow') {
        return "Snow day! Stay warm with our cold weather clothing guide.";
    }
    
    if (windSpeed > 25) {
        return "It's quite windy! See our wind-resistant outfit suggestions.";
    }
    
    if (weatherMain === 'mist' || weatherMain === 'fog') {
        return "Misty conditions! Check our cloudy day style recommendations.";
    }
    
    if (weatherMain === 'clear') {
        if (temperature > 28) {
            return "Hot and sunny! Explore our summer outfit collection.";
        } else if (temperature < 20) {
            return "Clear but chilly! Find warm outfit ideas for cool weather.";
        } else {
            return "Perfect sunny weather! Discover ideal outfits for beautiful days.";
        }
    }
    
    if (weatherMain === 'clouds') {
        if (temperature > 28) {
            return "Cloudy and warm! Check outfit ideas for hot cloudy days.";
        } else if (temperature < 20) {
            return "Cloudy and cool! Find cozy clothing for chilly overcast weather.";
        } else {
            return "Cloudy but pleasant! See our cloudy day fashion guide.";
        }
    }
    
    if (temperature < 20) {
        return `It's ${Math.round(temperature)}°C - quite cool! Explore our cold weather outfit guide.`;
    } else if (temperature > 28) {
        return `It's ${Math.round(temperature)}°C - quite hot! Check our hot weather clothing suggestions.`;
    } else {
        return `Pleasant ${Math.round(temperature)}°C weather! Discover comfortable outfit ideas for mild weather.`;
    }
}

function updateLearnButton(weatherData) {
    const learnBtn = document.getElementById('learn-btn');
    const buttonText = learnBtn.querySelector('.button-text');
    
    if (weatherData) {
        const recommendationText = getRecommendationText(weatherData);
        
        const recommendedPage = getRecommendedPage(weatherData);
        learnBtn.setAttribute('data-recommended-page', recommendedPage);
        
        learnBtn.classList.add('weather-ready');
        
        if (!learnBtn.hasAttribute('data-listener-added')) {
            learnBtn.addEventListener('click', function() {
                const page = this.getAttribute('data-recommended-page');
                if (page) {
                    showNotification(recommendationText, 'info');

                    setTimeout(() => {
                        window.location.href = page;
                    }, 1500);
                }
            });
            learnBtn.setAttribute('data-listener-added', 'true');
        }
        
        learnBtn.setAttribute('aria-label', recommendationText);
        learnBtn.setAttribute('title', recommendationText);
        
    } else {
        learnBtn.classList.remove('weather-ready');
        learnBtn.removeAttribute('data-recommended-page');
        learnBtn.setAttribute('aria-label', 'Search for weather first');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `weather-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 128, 128, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        border: 1px solid teal;
        backdrop-filter: blur(10px);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
    
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
}

function updateCurrentWeather(data) {
    currentWeatherData = data;
    
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('feels-like').textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed * 3.6)} km/h`;

    const precipitation = data.clouds?.all || 0;
    document.getElementById('precipitation').textContent = `Precipitation: ${precipitation}%`;

    const iconCode = data.weather[0].icon;
    const icon = weatherIcons[iconCode] || '🌤️';
    document.getElementById('weather-icon').textContent = icon;
    

    updateLearnButton(data);
    
    console.log('Weather Data:', {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        wind: Math.round(data.wind.speed * 3.6),
        recommendedPage: getRecommendedPage(data)
    });
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyForecasts[dateKey] ||
            Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
            dailyForecasts[dateKey] = item;
        }
    });

    const forecastDays = Object.values(dailyForecasts).slice(0, 5);

    forecastDays.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;
        const icon = weatherIcons[iconCode] || '🌤️';

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-day-name">${dayName}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temps">
                <span class="forecast-high">${Math.round(forecast.main.temp_max)}°</span>
                <span class="forecast-low">${Math.round(forecast.main.temp_min)}°</span>
            </div>
        `;

        forecastContainer.appendChild(forecastDay);
    });
}

async function searchWeather() {
    const city = document.getElementById('search-input').value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('API key not configured. Please add your OpenWeatherMap API key to the code.');
        return;
    }

    showLoading();

    try {
        const [currentWeather, forecastData] = await Promise.all([
            getCurrentWeather(city),
            getForecast(city)
        ]);

        updateCurrentWeather(currentWeather);
        updateForecast(forecastData);
        hideLoading();

        setTimeout(() => {
            showNotification('Weather loaded! Click "Learn More" for outfit recommendations.', 'success');
        }, 500);

    } catch (error) {
        showError(error.message);
        updateLearnButton(null);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    updateLearnButton(null);
    
    document.getElementById('search-btn').addEventListener('click', searchWeather);

    document.getElementById('search-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('search-input').value = data.name;
                        
                        setTimeout(() => {
                            searchWeather();
                        }, 1000);
                    }
                } catch (error) {
                    console.log('Could not get location weather:', error);
                }
            },
            (error) => {
                console.log('Geolocation not available:', error);
            }
        );
    }
});