import { ServicesClient } from "../lib/ServicesClient"
import Logger = require('bunyan')
import Config from '../config'
import { DynamoClient } from "../lib/DynamoClient"

export class ServicesEtl {
  log: Logger
  dbClient: DynamoClient
  config: Config

  constructor(config: Config, client: DynamoClient, log?: Logger) {
    this.log = log
    this.config = config
    this.dbClient = client
  }
  async etl() { 
    try {
      this.log.info('ServicesEtl:extract')
      const serviceClient = new ServicesClient(this.config, this.dbClient, this.log)
      await serviceClient.setServices()
      this.log.info('ServicesEtl:transform')
      await serviceClient.getFAQUris(serviceClient.serviceNamesArray)
      this.log.info('ServicesEtl:load')
      await serviceClient.loadServices()
    } catch (e) {
      this.log.error(e)
    }
  }
}
