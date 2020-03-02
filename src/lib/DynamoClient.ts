import DynamoDB from 'aws-sdk/clients/dynamodb'
import AWSXray from 'aws-xray-sdk'
import Config from '../config'
import Logger = require('bunyan')
import { QA } from './DomClient'

export class DynamoClient {
  config: Config
  log: Logger
  client: DynamoDB

  constructor(config: Config, log?: Logger) {
    this.config = config
    this.log = log
    this.client = AWSXray.captureAWSClient(new DynamoDB({ region: this.config.region, maxRetries: 10, retryDelayOptions: { base: 300 } }))
  }

  async getServicesTableItems() {
    try {
      return await this.client.scan({ TableName: this.config.servicesTable }).promise()
    } catch (e) {
      this.log.error(e)
      throw new Error(e)
    }
  }
  async putItem(params: DynamoDB.PutItemInput) {
    return await this.client.putItem(params).promise()
  }
  async diffQaItems(qaItems: QA[], service: string) {
    try {
      const params = {
        TableName: this.config.qaTable,
        ExpressionAttributeValues: {
          ':v1': {
            S: service
          }
        },
        KeyConditionExpression: 'Service = :v1',
        ProjectionExpression: 'Service, QuestionHash',
      }
      const result = await this.client.query(params).promise()
      const qaHashMap: any = {}
      if (!qaItems) {
        this.log.error(`no results for ${service}`)
        return []
      }
      for (let i = 0; i < qaItems.length; i++) {
        const qa = qaItems[i]
        qaHashMap[qa.questionHash] = qa
      }
      const qaItemHashes = qaItems.map((i) => i.questionHash)
      const tableQuestionHashes = result.Items.map((x) => x.QuestionHash.S)
      const diffArray: QA[] = []
      for (let x = 0; x < qaItemHashes.length; x++) {
        const e = qaItemHashes[x]
        if (!tableQuestionHashes.includes(e)) {
          diffArray.push(qaHashMap[e])
        }
      }
      return diffArray
    } catch (e) {
      this.log.error(e)
      throw new Error(e)
    }
  }
}
