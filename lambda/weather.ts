import {createHttpResponse, getCurrentHourTimestamp, HttpResponse} from "./helpers";
import {cacheWeatherData, fetchCachedWeatherData} from "./cache-weather-data";
import {fetchWeatherData} from "./fetch-weather-data";

const CITY = 'paris';
const CACHE_DURATION_IN_SECONDS = 3600; // 1 hour

export async function weather(event: any) {
    try {
        const timestamp = getCurrentHourTimestamp();

        // Check if weather data requested is cached in DynamoDB
        const cachedWeatherData = await fetchCachedWeatherData(CITY, timestamp)
        if (cachedWeatherData) {
            return createHttpResponse(200, cachedWeatherData);
        }

        // Fetch weather data in from external API
        const weatherData = await fetchWeatherData(CITY)
        if (!weatherData) {
            return createHttpResponse(500, { error: 'Failed to fetch weather data from external API' });
        }

        // Cache the new weather data to dynamoDB
        await cacheWeatherData(CITY, timestamp, weatherData, CACHE_DURATION_IN_SECONDS);

        return createHttpResponse(200, weatherData);
    } catch(error) {
        console.error('Error in weather weather:', error);
        return createHttpResponse(500, { error: 'Internal server error' });
    }
}