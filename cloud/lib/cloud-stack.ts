import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import { WeatherCompute } from './lambda-handler/compute-weather';
config();

export class CloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get the EC2's VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ec2Vpc', {
      vpcId: 'vpc-0493ccf5a7283f8c2',
    });

    // Create a role that can connect to rds
    const rdsConnectRole = new Role(this, 'customRole', {
      roleName: 'rdsConnectRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
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
      ],
    });

    new WeatherCompute(this, 'weather-compute-function', rdsConnectRole, vpc);
  }
}
