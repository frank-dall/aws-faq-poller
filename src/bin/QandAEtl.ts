import fetch from 'node-fetch'
import Config from '../config'
import Logger = require('bunyan')
import { ItemList } from 'aws-sdk/clients/dynamodb'
import { DynamoClient } from '../lib/DynamoClient'
import { DomClient, QA } from '../lib/DomClient'
import DynamoDB from 'aws-sdk/clients/dynamodb'

export class QandAEtl {
  log: Logger
  config: Config
  services: ItemList
  client: DynamoClient

  constructor(config: Config, dbClient: DynamoClient, log?: Logger) {
    this.log = log
    this.config = config
    this.client = dbClient
  }
  async extract() {
    const scanOutput = await this.client.getServicesTableItems()
    this.services = scanOutput.Items
  }
  async transformAndLoad() {
    for (let i = 0; i < this.services.length; i++) {
      const s = this.services[i]
      try {
        const serviceName = s.Service.S
        const uri = s.Uri.S
        this.log.debug(`QandAEtl: start fetch for ${serviceName}`)
        if (uri === 'unknown') {
          this.log.warn(`URI not found for ${serviceName}`)
          continue
        }
        const resp = await fetch(uri)
        const text = await resp.text()
        const dom = new DomClient(text, this.log)
        dom.setSubjectsFromH2TagsAsArray()
        dom.setH2NodeIds()
        dom.setQAndAs(serviceName)
        const diff = await this.client.diffQaItems(dom.subjectAndCategoryAndQas, serviceName)
        if (diff.length > 1) {
          await this.load(diff, serviceName)
        } else {
          this.log.info({ service: serviceName }, 'service up to date')
        }
      } catch (e) {
        this.log.error(e)
      }
    }
  }
  async load(qAndAs: QA[], service: string) {
    for (let i = 0; i < qAndAs.length; i++) {
      const q = qAndAs[i]
      if (!q.question) {
        this.log.warn({ subject: q.subject, category: q.category, service: service }, 'no question found')
        continue
      }
      const params: DynamoDB.Types.PutItemInput = {
        Item: {
          'Service': {
            'S': service
          },
          'QuestionHash': {
            'S': q.questionHash
          },
          'Question': {
            'S': q.question
          },
          'Answer': {
            'S': q.answer
          }
        },
        TableName: this.config.qaTable
      }
      if (q.subject) params.Item['Subject'] = { 'S': q.subject }
      if (q.category) params.Item['Category'] = { 'S': q.category }
      try {
        await this.client.putItem(params)
      } catch (e) {
        this.log.error(e)
        throw new Error(e)
      }
    }
  }
}
