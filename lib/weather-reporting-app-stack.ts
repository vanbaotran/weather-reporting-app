import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code} from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'node:path';
import {execSync} from 'child_process';
import * as fs from 'fs-extra';
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export class WeatherReportingAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Retrieve the secret
    const weatherApiSecret = Secret.fromSecretNameV2(this, 'WeatherApiSecret', 'weather-api-key');
    // DynamoDB to cache weather data
    const weatherTable = new Table(this, 'WeatherCacheTable', {
      partitionKey: { name: 'city', type: AttributeType.STRING },
      sortKey: { name: 'timestamp', type: AttributeType.NUMBER },
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function to fetch weather data
    const weatherLambda = new Function(this, 'WeatherHandler', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(path.join(__dirname, '../lambda'), {
        bundling: {
          image: Runtime.NODEJS_18_X.bundlingImage,
          local: {
            tryBundle(outputDir: string) {
              try {
                const lambdaDir = path.join(__dirname, '../lambda');

                execSync('yarn install --production', {
                  cwd: lambdaDir,
                  stdio: 'inherit',
                });

                fs.copySync(lambdaDir, outputDir, {
                  dereference: true,
                });

                return true;
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false;
              }
            },
          },
        },
      }),
      handler: 'weather.weather',
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        WEATHER_API_SECRET_ARN: weatherApiSecret.secretArn,
        TABLE_NAME: weatherTable.tableName
      },
    })

    weatherApiSecret.grantRead(weatherLambda);
    weatherTable.grantReadWriteData(weatherLambda);

    // API Gateway to expose lambda function
    const api = new LambdaRestApi(this, 'WeatherAPI', {
      handler: weatherLambda, proxy: false
    })

    // API resource and method GET
    const parisWeather = api.root.addResource('paris');
    parisWeather.addMethod('GET');
  }
}
