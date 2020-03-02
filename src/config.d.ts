import { LogLevelString } from 'bunyan';
export default class Config {
    region: string;
    servicesTable: string;
    qaTable: string;
    accountId: string;
    logLevel: LogLevelString;
}
