import Config from '../../src/config'
import fs = require('fs')
import path = require('path')
import cdk = require('@aws-cdk/core')
import lambda = require('@aws-cdk/aws-lambda')
import dynamodb = require('@aws-cdk/aws-dynamodb')
import events = require('@aws-cdk/aws-events')
import targets = require('@aws-cdk/aws-events-targets')
import { Tag, StackProps, Duration } from '@aws-cdk/core'
import { PolicyStatement } from '@aws-cdk/aws-iam'
import { AttributeType } from '@aws-cdk/aws-dynamodb'

const config: Config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../settings.json'), 'utf8'))

interface DeployStackProps extends StackProps {
  schedule: string;
}
export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: DeployStackProps) {
    super(scope, id, props)
    Tag.add(scope, 'Name', id)
    const func = new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_10_X,
      description: id,
      code: lambda.Code.fromAsset(`../${id}.zip`),
      handler: 'index.handler',
      timeout: Duration.seconds(900),
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      functionName: id
    })
    const ddbServices = new dynamodb.Table(this, 'ServicesTable', {
      partitionKey: {
        name: 'Service',
        type: AttributeType.STRING
      },
      tableName: config.servicesTable
    })
    const ddbServicesQandA = new dynamodb.Table(this, 'ServicesQandATable', {
      sortKey: {
        name: 'QuestionHash',
        type: AttributeType.STRING
      },
      partitionKey: {
        name: 'Service',
        type: AttributeType.STRING
      },
      tableName: config.qaTable
    })
    func.addToRolePolicy(new PolicyStatement({
      resources: [
        `arn:aws:dynamodb:${config.region}:${config.accountId}:table/${ddbServices.tableName}`,
        `arn:aws:dynamodb:${config.region}:${config.accountId}:table/${ddbServicesQandA.tableName}`

      ],
      actions: ['dynamodb:*']
    }))
    if (props && props.schedule) {
      func.addToRolePolicy(new PolicyStatement({
        resources: [
          `arn:aws:ssm:${config.region}::parameter/aws/service/global-infrastructure/services`,
          `arn:aws:ssm:${config.region}:${config.accountId}:parameter/aws/service/global-infrastructure/services`
        ],
        actions: ['ssm:DescribeParameters','ssm:GetParameters','ssm:GetParametersByPath']
      }))
      new events.Rule(this, `${id}-event`, {
        schedule: events.Schedule.expression(props.schedule),
        targets: [new targets.LambdaFunction(func)]
      })
    }
  }
}
