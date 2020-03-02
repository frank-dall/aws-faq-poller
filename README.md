# AWS FAQ Poller

A service that parses AWS FAQ pages and populates DynamoDB tables with QA data.

## Prerequisites
* Node.js >= 10.16
* AWS CDK >= 1.22
* An AWS account with a configured AWS profile

## Development
```bash
cp example.settings.json settings.json # change fields per your environment and preference
npm install
```
### Running tests
```bash
npm test
```

## Deployment
The `deploy/` directory of the project contains a CDK stack to deploy the project to AWS. This is a separate Node.js project. `npm run deploy` will create a zip file to deploy the project to lambda with the appropriate permissions.

You may need to cd to the `deploy/` directory and invoke `npm run build` and any `cdk` commands from there if changes are required.

The lambda is configured via the CDK stack to run on a daily basis.

## License
MIT
