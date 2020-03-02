#!/usr/bin/env node
import 'source-map-support/register'
import path = require('path')
import fs = require('fs')
import cdk = require('@aws-cdk/core')
import { DeployStack } from '../lib/deploy-stack'
import Config from '../../src/config'

const config: Config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../settings.json'), 'utf8'))

const env = { account : config.accountId, region: config.region }
const app = new cdk.App()
new DeployStack(app, 'aws-faq-poller', { env, schedule: 'rate(1 day)' })
