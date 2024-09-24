# Weather Reporting App

This project is a Weather Reporting App that fetches weather data using the OpenWeatherMap API and caches the data in DynamoDB. 
The app is deployed on AWS Lambda and exposed via an API Gateway. 
The deployment process is managed using AWS CDK (Cloud Development Kit).

Features
- Fetches weather data from the OpenWeatherMap API.
- Caches weather data in DynamoDB to avoid unnecessary API calls.
- Serverless deployment on AWS Lambda using AWS CDK.
- Uses AWS Secrets Manager to securely manage the API key.

Prerequisites
To test the app, you can access to this URL 
```https://y93kaa3kkf.execute-api.eu-west-1.amazonaws.com/prod/paris```

You will get the response such as: 
```
{
  "temperature": 17.06,
  "description": "broken clouds"
}
```
Once a request is sent, we can also see a new item added in the dynamoDB table
<img width="1235" alt="Screenshot 2024-09-24 at 18 12 43" src="https://github.com/user-attachments/assets/dea887b0-6454-4b57-8fa4-7225e46639d2">

