import Logger = require('bunyan')
import Config from './config'
import fs from 'fs'
import path from 'path'
import { ServicesEtl } from './bin/ServicesEtl'
import { QandAEtl } from './bin/QandAEtl'
import { DynamoClient } from './lib/DynamoClient'

const config: Config = JSON.parse(fs.readFileSync(path.resolve(__dirname, './settings.json'), 'utf8'))

const log = Logger.createLogger({
  name: 'aws-faq-poller',
  stream: process.stdout,
  level: config.logLevel // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
})

export const handler = async (event: any = {}): Promise<any> => {
  try {
    log.info('start')
    const dbClient = new DynamoClient(config, log)
    // harvest services
    const svcEtl = new ServicesEtl(config, dbClient, log)
    await svcEtl.etl()
    // map QAs
    const qAEtl = new QandAEtl(config, dbClient, log)
    await qAEtl.extract()
    await qAEtl.transformAndLoad()
    log.info('end')
  } catch (e) {
    log.error(e)
    throw new Error(e)
  }
}
if (require.main === module) {
  ;(async() => {
    await handler()
  })()
}
