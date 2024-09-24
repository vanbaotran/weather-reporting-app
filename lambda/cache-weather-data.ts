import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {WeatherData} from "./fetch-weather-data";

const dynamoDB = new DynamoDBClient();
const TABLE_NAME = process.env.TABLE_NAME;

export async function cacheWeatherData(city: string, timestamp: number, weatherData: WeatherData, ttlInSeconds: number): Promise<void> {
    try {
        const ttl = Math.floor(Date.now() / 1000) + ttlInSeconds;

        const command = new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                city: { S: city },
                timestamp: { N: String(timestamp) },
                temperature: { N: String(weatherData.temperature) },
                description: { S: weatherData.description },
                ttl: { N: String(ttl) },
            },
        });

        await dynamoDB.send(command)
    } catch(error) {
        console.error(`Error caching weather data for city ${city} with timestamp ${timestamp} to DynamoDB:`, error);
    }
}

export async function fetchCachedWeatherData(city: string, timestamp: number) : Promise<WeatherData|null>{
    try {
      const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                city: { S: city },
                timestamp: { N: String(timestamp) },
            },
        });

        const { Item } = await dynamoDB.send(command);

        if(Item && Item.temperature && Item.temperature.N){
          return  {
              temperature: parseFloat(Item.temperature.N),
              description: Item.description.S ?? 'No description available',
            }
        }

        return null
    } catch(error) {
        console.error(`Error fetching cached data for city ${city} with timestamp ${timestamp} from DynamoDB:`, error)
    }
    return null
}