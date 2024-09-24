import axios from 'axios';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const OPEN_WEATHER_MAP_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
    temperature: number;
    description: string;
}

const secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

async function getWeatherApiKey(): Promise<string> {
    const secretArn = process.env.WEATHER_API_SECRET_ARN; // Get the ARN from the environment variable

    if (!secretArn) {
        throw new Error('Weather API secret ARN is not set');
    }

    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const secretData = await secretsManagerClient.send(command);

    if (!secretData.SecretString) {
        throw new Error('SecretString is missing in the secret');
    }

    const secret = JSON.parse(secretData.SecretString);
    return secret['WEATHER_API_KEY'];
}

export async function fetchWeatherData(city : string): Promise<WeatherData | null>{
    try {
        const apiKey = await getWeatherApiKey();
        const response = await axios.get(OPEN_WEATHER_MAP_URL, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric',
            }
        })
        const { temp } = response.data.main;
        const { description } = response.data.weather[0];

        return {
            temperature: temp,
            description
        }

    } catch(error) {
        console.error(`Failed to fetch weather for ${city}:`, error);
        return null;
    }
}