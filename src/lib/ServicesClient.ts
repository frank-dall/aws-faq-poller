import fetch from 'node-fetch'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import SSM from 'aws-sdk/clients/ssm'
import AWSXray from 'aws-xray-sdk'
import Config from '../config'
import Logger = require('bunyan')
import { DynamoClient } from './DynamoClient'

export class ServiceSpec {
  Service: string
  Uri: string
}
export class ServicesClient {
  config: Config
  log: Logger
  dbClient: DynamoClient
  servicesJson: any
  servicesArray: string[]
  serviceUris: ServiceSpec[]
  serviceNamesArray: string[]
  ssmClient: SSM

  // gross hack
  public static manualServiceMap: any = {
    'fsx': ['https://aws.amazon.com/fsx/windows/faqs/', 'https://aws.amazon.com/fsx/lustre/faqs/'],
    'apigatewayv2': 'https://aws.amazon.com/api-gateway/faqs/',
    'acm': 'https://aws.amazon.com/certificate-manager/faqs/',
    'acm-pca': 'https://aws.amazon.com/certificate-manager/faqs/',
    'apigateway': 'https://aws.amazon.com/api-gateway/faqs/',
    'apigatewaymanagementapi': 'https://aws.amazon.com/api-gateway/faqs/',
    'application-autoscaling': 'https://aws.amazon.com/autoscaling/faqs/',
    'application-insights': 'https://aws.amazon.com/cloudwatch/faqs/',
    'appmesh': 'https://aws.amazon.com/app-mesh/faqs/',
    'autoscaling-plans': 'https://aws.amazon.com/autoscaling/faqs/',
    'budgets': 'https://aws.amazon.com/aws-cost-management/faqs/',
    'cloudhsmv2': 'https://aws.amazon.com/cloudhsm/faqs/',
    'cognito-sync': 'https://aws.amazon.com/cognito/faqs/',
    'cognito-identity': 'https://aws.amazon.com/cognito/faqs/',
    'cognito-idp': 'https://aws.amazon.com/cognito/faqs/',
    'ce': 'https://aws.amazon.com/aws-cost-management/faqs/',
    'cur': 'https://aws.amazon.com/aws-cost-management/faqs/',
    'discovery': 'https://aws.amazon.com/application-discovery/faqs/',
    'dax': 'https://aws.amazon.com/dynamodb/faqs/',
    'dynamodbstreams': 'https://aws.amazon.com/dynamodb/faqs/',
    'dlm': 'https://aws.amazon.com/backup/faqs/',
    'docdb': 'https://aws.amazon.com/documentdb/faqs/',
    'ds': 'https://aws.amazon.com/directoryservice/faqs/',
    'elb': 'https://aws.amazon.com/elasticloadbalancing/faqs/',
    'devicefarm': 'https://aws.amazon.com/device-farm/faqs/',
    'events': 'https://aws.amazon.com/eventbridge/faqs/',
    'fms': 'https://aws.amazon.com/firewall-manager/faqs/',
    'globalaccelerator': 'https://aws.amazon.com/global-accelerator/faqs/',
    'groundstation': 'https://aws.amazon.com/ground-station/faqs/',
    'health': 'https://aws.amazon.com/premiumsupport/faqs/',
    'iot-data': 'https://aws.amazon.com/iot-core/faqs/',
    'iot1click-devices': 'https://aws.amazon.com/iot-1-click/faq/',
    'iot1click-projects': 'https://aws.amazon.com/iot-1-click/faq/',
    'iotthingsgraph': 'https://aws.amazon.com/iot-things-graph/faqs/',
    'iotanalytics': 'https://aws.amazon.com/iot-analytics/faq/',
    'iotevents': 'https://aws.amazon.com/iot-events/faqs/',
    'iotevents-data': 'https://aws.amazon.com/iot-events/faqs/',
    'firehose': 'https://aws.amazon.com/kinesis/data-firehose/faqs/',
    'logs': 'https://aws.amazon.com/cloudwatch/faqs/',
    'opsworkscm': 'https://aws.amazon.com/opsworks/chefautomate/faqs/',
    'mediastore-data': 'https://aws.amazon.com/mediastore/faqs/',
    'lex-runtime': 'https://aws.amazon.com/lex/faqs/',
    'lex-models': 'https://aws.amazon.com/lex/faqs/',
    'kafka': 'https://aws.amazon.com/msk/faqs/',
    'kinesisanalytics': 'https://aws.amazon.com/kinesis/data-analytics/faqs/',
    'kinesisvideo': 'https://aws.amazon.com/kinesis/video-streams/faqs/',
    'mgh': 'https://aws.amazon.com/migration-hub/faqs/',
    'mq': 'https://aws.amazon.com/amazon-mq/faqs/',
    'managedblockchain': 'https://aws.amazon.com/managed-blockchain/faqs/',
    'machinelearning': 'https://aws.amazon.com/sagemaker/faqs/',
    'pi': 'https://aws.amazon.com/rds/performance-insights/faqs/',
    'pinpoint-email': 'https://aws.amazon.com/pinpoint/faqs/',
    'pinpoint-sms-voice': 'https://aws.amazon.com/pinpoint/faqs/',
    'sms-voice': 'https://aws.amazon.com/pinpoint/faqs/',
    'pricing': 'https://aws.amazon.com/aws-cost-management/faqs/',
    'route53domains': 'https://aws.amazon.com/route53/faqs/',
    'route53resolver': 'https://aws.amazon.com/route53/faqs/',
    'rds-data': 'https://aws.amazon.com/rds/faqs/',
    'servicediscovery': 'https://aws.amazon.com/application-discovery/faqs/',
    'serverlessrepo': 'https://aws.amazon.com/serverless/serverlessrepo/faqs/',
    'securityhub': 'https://aws.amazon.com/security-hub/faqs/',
    'secretsmanager': 'https://aws.amazon.com/secrets-manager/faqs/',
    'sms': 'https://aws.amazon.com/server-migration-service/faqs/',
    'sagemaker-runtime': 'https://aws.amazon.com/sagemaker/faqs/',
    'support': 'https://aws.amazon.com/premiumsupport/faqs/',
    's3control': 'https://aws.amazon.com/s3/faqs/',
    'sts': 'https://aws.amazon.com/iam/faqs/',
    'stepfunctions': 'https://aws.amazon.com/step-functions/faqs/',
    'ssm': 'https://aws.amazon.com/systems-manager/faq/',
    'sdb': 'https://aws.amazon.com/simpledb/faqs/',
    'transfer': 'https://aws.amazon.com/sftp/faqs/',
    'waf-regional': 'https://aws.amazon.com/waf/faq/',
    'comprehendmedical': 'https://aws.amazon.com/comprehend/faqs/'
  }

  constructor(config: Config, dbClient: DynamoClient, log?: Logger) {
    this.config = config
    this.log = log
    this.dbClient = dbClient
    this.ssmClient = AWSXray.captureAWSClient(new SSM({ region: this.config.region }))
  }
  async getServices(services: string[], token: string) {
    try {
      const params: SSM.GetParametersByPathRequest = { Path: '/aws/service/global-infrastructure/services' }
      if (token) params.NextToken = token
      const data = await this.ssmClient.getParametersByPath(params).promise()
      const resultParams = data.Parameters
      const paramValues = resultParams.map((x) => x.Value)
      services.push.apply(services, paramValues)
      if (data.NextToken) {
        await this.getServices(services, data.NextToken)
      }
      return services
    } catch (e) {
      this.log.error(e)
      return []
    }
  }
  async setServices() {
    try {
      const resp = await this.getServices([], '')
      this.serviceNamesArray = resp
    } catch (e) {
      this.log.error(e)
      throw new Error(e)
    }
  }
  async getFAQUris(serviceNamesArray: string[]) {
    const faqUris: ServiceSpec[] = []
    for (let i = 0; i < serviceNamesArray.length; i++) {
      let name = serviceNamesArray[i]
      // this throws errors without the following conditional
      if (name === 'support') name = 'premiumsupport'
      const test = await ServicesClient.validateServiceUri(name.toLowerCase(), '', this.log)
      if (test) {
        faqUris.push({
          Service: name.toLowerCase(),
          Uri: `https://aws.amazon.com/${name.toLowerCase()}/faqs/`
        })
        continue
      }
      if (await ServicesClient.validateServiceUri(name.toLowerCase(), `https://aws.amazon.com/${name.toLowerCase()}/faq/`, this.log)) {
        faqUris.push({
          Service: name.toLowerCase(),
          Uri: `https://aws.amazon.com/${name.toLowerCase()}/faq/`
        })
        continue
      }
      if (this.lookupServiceManually(name)) {
        faqUris.push({ Service: name, Uri: this.lookupServiceManually(name) })
        continue
      }
      faqUris.push({ Service: name, Uri: 'unknown' })
    }
    this.serviceUris = faqUris
  }
  private lookupServiceManually(svcName: string) {
    return ServicesClient.manualServiceMap[svcName]
  }
  public async loadServices() {
    for (let i = 0; i < this.serviceUris.length; i++) {
      const s = this.serviceUris[i]
      this.log.debug(s)
      if (Array.isArray(s.Uri)) {
        for (let x = 0; x < s.Uri.length; x++) {
          await this.putServiceItem(s, s.Uri[x])
        }
      } else {
        await this.putServiceItem(s)
      }
    }
  }
  private async putServiceItem(s: ServiceSpec, uri?: string) {
    const params: DynamoDB.Types.PutItemInput = {
      Item: {
        'Service': {
          'S': s.Service
        },
        'Uri': {
          'S': s.Uri
        }
      },
      TableName: this.config.servicesTable
    }
    if (uri) params.Item.Uri.S = uri
    try {
      await this.dbClient.putItem(params)
    } catch (e) {
      this.log.error({ error: e }, 'unable to write to table')
      throw new Error(e)
    }
  }
  private static async validateServiceUri(name: string, uri?: string, log?: Logger) {
    try {
      let serviceName = name.toLowerCase()
      const resp = await fetch(uri ? uri : `https://aws.amazon.com/${serviceName}/faqs/`)
      if (resp.ok) {
        return true
      } else {
        return false
      }
    } catch (e) {
      log.error(Object.assign(e, { uri: uri, serviceName: name }), `unable to fetch URI: ${uri} for ${name}`)
      return false
    }
  }
}
