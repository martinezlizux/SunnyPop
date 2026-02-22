function getWeatherIcon(code, isDay) {
    if (code === 0) return isDay ? 'sun.svg' : 'moon.svg';
    if (code === 1 || code === 2) return isDay ? 'suny with clouds.svg' : 'night cloudi.svg';
    if (code === 3) return 'cloud.svg';
    if (code >= 45 && code <= 48) return 'fog.svg';
    if (code >= 51 && code <= 57) return 'soft rain.svg';
    if (code >= 61 && code <= 67) return 'raining.svg';
    if (code >= 71 && code <= 77) return isDay ? 'sun and snow.svg' : 'night snow.svg';
    if (code === 80 || code === 81 || code === 82) return isDay ? 'sunny with rain clouds.svg' : 'rain.svg';
    if (code === 85 || code === 86) return 'snowy.svg';
    if (code >= 95 && code <= 99) return 'rain with flashing.svg';
    return isDay ? 'sun.svg' : 'moon.svg';
}

function formatTime(isoString) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // el 0 debe ser 12
    return `${hours}:00 ${ampm}`;
}

async function getCityName(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
        const data = await res.json();
        return data.city || data.locality || data.principalSubdivision || "Ubicación desconocida";
    } catch (error) {
        console.error("Error obteniendo el nombre de la ciudad:", error);
        return "Localidad";
    }
}

function getThemeAndAssets(code, currentTemp) {
    if (code === 96 || code === 99) {
        return { theme: 'granizo', personaje: 'nieve.png', elemento: 'nieve.svg' };
    } else if (code >= 95) {
        return { theme: 'tormenta', personaje: 'lluvia.png', elemento: 'trueno.svg' };
    } else if (code >= 71 && code <= 86) {
        return { theme: 'nieve', personaje: 'nieve.png', elemento: 'nieve.svg' };
    } else if (code === 51 || code === 56 || code === 61 || code === 66 || code === 80) {
        return { theme: 'lluvia-baja', personaje: 'lluvia.png', elemento: 'lluvia.svg' };
    } else if (code === 53 || code === 63 || code === 81) {
        return { theme: 'lluvia-moderada', personaje: 'lluvia.png', elemento: 'lluvia.svg' };
    } else if (code === 55 || code === 57 || code === 65 || code === 67 || code === 82) {
        return { theme: 'lluvia-alta', personaje: 'lluvia.png', elemento: 'lluvia.svg' };
    } else if (code >= 45 && code <= 48) {
        if (currentTemp > 20) {
            return { theme: 'niebla-calor', personaje: 'Sol.png', elemento: 'nube.svg' };
        }
        return { theme: 'niebla', personaje: 'frio1.png', elemento: 'nube.svg' };
    } else if (code === 2 || code === 3) {
        return { theme: 'nublado', personaje: 'frio2.png', elemento: 'nublado.svg' };
    } else {
        if (currentTemp <= 10) {
            return { theme: 'viento', personaje: 'frio1.png', elemento: 'viento.svg' };
        }
        return { theme: 'sol', personaje: 'Sol.png', elemento: 'sol.svg' };
    }
}

async function getWeatherData(lat, lon) {
    try {
        // Usamos Open-Meteo, API publica ideal sin necesidad de cuenta/key
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,is_day&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        // Actualizar clima actual de manera dinamica
        const currentTemp = Math.round(data.current_weather.temperature);
        const currentCode = data.current_weather.weathercode;
        const isDay = data.current_weather.is_day === 1; // Open meteo 1 o 0

        // Aplicar temas y assets
        const appearance = getThemeAndAssets(currentCode, currentTemp);
        document.body.setAttribute('data-theme', appearance.theme);
        document.body.className = document.body.className.replace(/theme-\w+/, `theme-${appearance.theme}`);

        document.getElementById('personaje-img').src = `images/personaje/${appearance.personaje}`;
        document.getElementById('elemento-img').src = `images/element/${appearance.elemento}`;

        document.getElementById('current-temp').innerText = currentTemp;
        const mainIconUrl = `url(images/forescastIcon/${getWeatherIcon(currentCode, isDay)})`;
        document.getElementById('current-weather-icon').style.webkitMaskImage = mainIconUrl;
        document.getElementById('current-weather-icon').style.maskImage = mainIconUrl;

        // Procesar pronostico de 4 horas
        const currentEpoch = new Date().getTime();

        // Encontrar el indice de la hora más cercana a "ahora"
        let closestIndex = 0;
        let minDiff = Infinity;

        data.hourly.time.forEach((t, i) => {
            const diff = Math.abs(new Date(t).getTime() - currentEpoch);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });

        const currentIndex = closestIndex;
        const forecastElements = document.querySelectorAll('.forecast-item');

        // Proveemos las proximas 4 horas
        for (let i = 0; i < forecastElements.length; i++) {
            const targetIndex = currentIndex + i + 1; // +1 al futuro
            if (targetIndex < data.hourly.time.length) {
                const fTime = data.hourly.time[targetIndex];
                const fTemp = Math.round(data.hourly.temperature_2m[targetIndex]);
                const fCode = data.hourly.weathercode[targetIndex];
                const fIsDay = data.hourly.is_day[targetIndex] === 1;

                const timeSpan = forecastElements[i].querySelector('.time');
                const tempSpan = forecastElements[i].querySelector('.temp');
                const iconDiv = forecastElements[i].querySelector('.forecast-icon');

                timeSpan.innerText = formatTime(fTime);
                tempSpan.innerText = `${fTemp}°`;

                const iconUrl = `url('images/forescastIcon/${getWeatherIcon(fCode, fIsDay)}')`;
                iconDiv.style.webkitMaskImage = iconUrl;
                iconDiv.style.maskImage = iconUrl;
            }
        }
    } catch (error) {
        console.error("Error obteniendo los datos del clima:", error);
    }
}

function initApp() {
    // Comprobar la geolocalización
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const cityName = await getCityName(lat, lon);
                document.getElementById('location-name').innerText = cityName;

                await getWeatherData(lat, lon);
            },
            async (error) => {
                // Fallback en caso de que el usuario rechace los permisos
                console.warn("Geolocalización denegada. Lynnwood por defecto.");
                const lat = 47.8279;
                const lon = -122.3054;
                document.getElementById('location-name').innerText = "Lynnwood";
                await getWeatherData(lat, lon);
            }
        );
    } else {
        // Computadoras mas viejas
        const lat = 47.8279;
        const lon = -122.3054;
        document.getElementById('location-name').innerText = "Lynnwood";
        getWeatherData(lat, lon);
    }
}

// Inicia el setup despues del parseo del indice HTML
document.addEventListener('DOMContentLoaded', initApp);
