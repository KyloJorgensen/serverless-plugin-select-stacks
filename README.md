# Serverless Select Stacks Plugin

inspiration serverless-plugin-select author Gonçalo Neves

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-plugin-select-stacks.svg)](https://badge.fury.io/js/serverless-plugin-select)
[![npm downloads](https://img.shields.io/npm/dm/serverless-plugin-select-stacks.svg)](https://www.npmjs.com/package/serverless-plugin-select)
[![license](https://img.shields.io/npm/l/serverless-plugin-select-stacks.svg)](https://raw.githubusercontent.com/FidelLimited/serverless-plugin-select/master/LICENSE)

Select which functions are to be deployed based on region and stage.

**Note:** Requires Serverless _v1.12.x_ or higher.

## Setup

Install via npm in the root of your Serverless service:

```
npm install serverless-plugin-select --save-dev
```

- Add the plugin to the `plugins` array in your Serverless `serverless.yml`, you should place it at the top of the list:

```yml
plugins:
  - serverless-plugin-select-stacks
  - ...
```

- Add `stacks` in your functions to select for deployment

- Run deploy command `sls deploy --stack [STACK NAME]` or `sls deploy function --stack [STACK NAME] --function [FUNCTION NAME]`

- Functions will be deployed based on your selection. with out `--stack` option it will only deploy ones without `stacks`.

- All done!

#### Function

- **How it works?** When deployment stack don't match function stacks, that function will be deleted from deployment.

* **stacks** - Function accepted deployment stacks.

```yml
provider:
  name: aws
  runtime: nodejs10.x
  region: us-east-1
  stackName: ${self:service.name}-${opt:stage, self:provider.stage}${self:custom.stack.${opt:stack, ''}.postfix, ''}
  apiGateway: ${self:custom.stack.${opt:stack, ''}.apiGateway, ''}

custom:
  apiGateway:
    restApiId:
      Fn::ImportValue: "${self:service.name}-${opt:stage, self:provider.stage}-RestApiId"
    restApiRootResourceId:
      Fn::ImportValue: "${self:service.name}-${opt:stage, self:provider.stage}-RootResourceId"

  stack:
    email:
      name: email
      postfix: -email
      apiGateway: ${self:custom.apiGateway}

functions:
  hello:
    stacks:
      - email
      - ...

resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        Name: ${self:provider.stackName}
        Description: API Gateway
  Outputs:
    # RestApi resource ID (e.g. ei829oe)
    RestApiId:
      Value:
        Ref: ApiGatewayRestApi
      Export:
        Name: ${self:provider.stackName}-RestApiId
    # RestApi Root Resource (the implicit '/' path)
    RootResourceId:
      Value:
        Fn::GetAtt: ApiGatewayRestApi.RootResourceId
      Export:
        Name: ${self:provider.stackName}-RootResourceId
```

- Example in repo add role then `sls deploy` and then `sls deploy --stack email`

## Contribute

Help us making this plugin better and future proof.

- Clone the code
- Install the dependencies with `npm install`
- Create a feature branch `git checkout -b new_feature`
- Lint with standard `npm run lint`

## License

This software is released under the MIT license. See [the license file](LICENSE) for more details.
