import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { config } from 'dotenv';
import { Role } from 'aws-cdk-lib/aws-iam';
config();

export class WeatherCompute extends Construct {
  constructor(scope: Construct, id: string, customRole: Role, vpc: ec2.IVpc) {
    super(scope, id);

    const weatherComputeFunction = new NodejsFunction(this, 'function', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      environment: {
        DB_HOST: process.env.MYSQL_HOST!,
        DB_PORT: process.env.MYSQL_PORT!,
        DB_NAME: process.env.MYSQL_DATABASE!,
        DB_USER_NAME: process.env.MYSQL_USER!,
      },
      role: customRole,
    });
  }
}
