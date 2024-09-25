# Weather Reporting App

**How it works**
- A user hits the API Gateway by calling the URL (city is set as Paris)
- Lambda checks DynamoDB to see if recent weather data exists
- If data exists, it's returned. If not, lambda fetches data from OpenWeatherApp and stores it in DynamoDB for future use
- The response is sent back to the user

**Features**
- Fetches weather data from the OpenWeatherMap API.
- Caches weather data in DynamoDB to avoid unnecessary API calls.
- Serverless deployment on AWS Lambda using AWS CDK.
- Uses AWS Secrets Manager to securely manage the API key.

**Design and architecture**
- Why CDK? CDK simplifies infrastructure setup, it allows us to do it in Typescript.
- Why lambda? Lambda is pratical to be invoked without managing servers. When a user requests weather data, Lambda checks if the data is cached in DynamoDB. If not, it fetches data from OpenWeatherApp.
- Why API Gateway? API Gateway exposes the lambda as an API endpoint. The endpoint triggers the lambda function
- Why DynamoDB? Weather data is stored here with an expiration time. If the data is still valid, it retrieves from DynamoDB instead of OpenWeatherApp

**Quick test**

To test the app without deploying, you can access to this URL 
```https://y93kaa3kkf.execute-api.eu-west-1.amazonaws.com/prod/paris```

You will get the response such as: 
```
{
  "temperature": 17.06,
  "description": "broken clouds"
}
```

**Setup and Deployment Instructions**

Step 1: Clone the Repository
```
git clone https://github.com/your-username/weather-reporting-app.git
cd weather-reporting-app
```
Step 2: Install Dependencies
Make sure you install the necessary dependencies using Yarn:
```
yarn install
```

Step 3: Configure the Environment Variables
To use the OpenWeatherMap API, you'll need an API key. The key has to be stored in AWS Secrets Manager.

Store the OpenWeatherMap API Key in AWS Secrets Manager:

Store the API key in AWS Secrets Manager. Run the following command to store the key:
```
aws secretsmanager create-secret --name weather-api-key --secret-string "your-openweathermap-api-key"
```
Set Environment Variables for Deployment:

In the CDK stack, the environment variables are fetched from the AWS Secrets Manager. Make sure the secret name (weather-api-key) matches your configuration.

Step 4: Bootstrap the AWS Environment

```
cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
```
Replace <ACCOUNT_ID> and <REGION> with your AWS account ID and your region (e.g., eu-west-1).

Step 5: Deploy the Application
Deploy the app using AWS CDK. This command will create the necessary resources like Lambda, API Gateway, and DynamoDB:

```
cdk deploy
```
After the deployment completes, you'll see an output containing the API Gateway endpoint:

Outputs:
```
WeatherReportingAppStack.WeatherAPIEndpoint = https://<API_GATEWAY_ID>.execute-api.<REGION>.amazonaws.com/prod/paris
```
Make note of this URL for testing.

Step 6: Test the API
You can test the API by making a request to the API Gateway endpoint.

```
curl https://<API_GATEWAY_ID>.execute-api.<REGION>.amazonaws.com/prod/paris
```
This should return the current weather data for the specified city, such as:

```
{
  "temperature": 20.5,
  "description": "clear sky"
}
```
Step 7: View Logs
To view the logs for the Lambda function, use CloudWatch Logs:

Go to the AWS Lambda Console.

Select your Lambda function. You can also trigger the lambda from the Console to test it. It should return the weather data as well.

Under the Monitoring tab, click View logs in CloudWatch to see the logs.


Step 8: Check DynamoDB table 'WeatherCacheTable'

Go to DynamoDB Console
Select your DynamoDB table 
Once a request is sent, you can see a new item added in the dynamoDB table:
<img width="1235" alt="Screenshot 2024-09-24 at 18 12 43" src="https://github.com/user-attachments/assets/dea887b0-6454-4b57-8fa4-7225e46639d2">

