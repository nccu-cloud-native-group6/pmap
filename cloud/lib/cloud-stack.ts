import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';

import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';

import path = require('path');
config();

export class CloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get the EC2's VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ec2Vpc', {
      vpcId: 'vpc-0493ccf5a7283f8c2',
    });
    vpc.addGatewayEndpoint('S3Gateway', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // Create a SNS Topic for weather update
    const updateWeatherTopic = new sns.Topic(this, 'UpdateWeatherTopic', {
      topicName: 'UpdateWeatherTopic',
    });

    const lambdaWithRDSPolicies = [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole',
      ),
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole',
      ),
      ManagedPolicy.fromManagedPolicyArn(
        this,
        id,
        'arn:aws:iam::203918887121:policy/rds-iam-connect',
      ),
    ];

    // Create a role that can connect to rds
    const rdsConnectRole = new Role(this, 'customRole', {
      roleName: 'rdsConnectRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: lambdaWithRDSPolicies,
    });

    // Create Lambda-specific subnets
    const lambdaSubnets: ec2.PrivateSubnet[] = [];

    // Create a subnet in each AZ that the VPC is using
    // Get all AZs in the current region
    const azs = cdk.Stack.of(this).availabilityZones;
    azs.forEach((az, index) => {
      const subnet = new ec2.PrivateSubnet(this, `LambdaSubnet-${az}`, {
        vpcId: vpc.vpcId,
        availabilityZone: az,
        cidrBlock: `172.31.${70 + index}.0/24`,
      });

      cdk.Tags.of(subnet).add('CreatedBy', `cdk`);
      lambdaSubnets.push(subnet);
    });

    const notificationLambda = new NodejsFunction(this, 'send-discord-notification', {
      entry: path.join(__dirname, 'lambda-handler/send-discord-message.ts'),
      runtime: lambda.Runtime.NODEJS_LATEST,
      environment: {
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL!,
      },
      timeout: Duration.seconds(5),
    });
    
    const computeWeatherLambda = new NodejsFunction(this, 'compute-weather', {
      entry: path.join(__dirname, 'lambda-handler/compute-weather.ts'),
      runtime: lambda.Runtime.NODEJS_LATEST,
      vpc: vpc,
      vpcSubnets: {
        subnets: lambdaSubnets,
      },
      environment: {
        MYSQL_HOST: process.env.MYSQL_HOST!,
        MYSQL_PORT: process.env.MYSQL_PORT!,
        MYSQL_DATABASE: process.env.MYSQL_DATABASE!,
        MYSQL_USER: process.env.MYSQL_USER!,
      },
      role: rdsConnectRole,
      timeout: Duration.seconds(10),
      onSuccess: new destinations.LambdaDestination(notificationLambda),
      onFailure: new destinations.LambdaDestination(notificationLambda),
    });
    
    const subWeatherCompute = new subscriptions.LambdaSubscription(
      computeWeatherLambda,
    );
    updateWeatherTopic.addSubscription(subWeatherCompute);

    const processWeatherLambda = new NodejsFunction(this, 'process-weather', {
      entry: path.join(__dirname, 'lambda-handler/process-weather.ts'),
      runtime: lambda.Runtime.NODEJS_LATEST,
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      environment: {
        MYSQL_HOST: process.env.MYSQL_HOST!,
        MYSQL_PORT: process.env.MYSQL_PORT!,
        MYSQL_DATABASE: process.env.MYSQL_DATABASE!,
        MYSQL_USER: process.env.MYSQL_USER!,
        CWA_PMAP_EMAIL: process.env.CWA_PMAP_EMAIL!,
        CWA_PMAP_PASSWORD: process.env.CWA_PMAP_PASSWORD!,
      },
      role: rdsConnectRole,
      timeout: Duration.seconds(5),
      onSuccess: new destinations.SnsDestination(updateWeatherTopic),
    });

    const fetchWeatherLambda = new NodejsFunction(this, 'fetch-weather', {
      entry: path.join(__dirname, 'lambda-handler/fetch-weather.ts'),
      runtime: lambda.Runtime.NODEJS_LATEST,
      environment: {
        CWA_TOKEN: process.env.CWA_TOKEN!,
      },
      timeout: Duration.seconds(5),
      onSuccess: new destinations.LambdaDestination(processWeatherLambda),
    });

    // Run every 10 minutes
    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(*/10 * * * ? *)'),
    });
    rule.addTarget(new targets.LambdaFunction(fetchWeatherLambda));
  }
}
