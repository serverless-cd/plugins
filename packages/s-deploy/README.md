# `s-deploy`

> Use serverless devs for deployment

## Usage


```yaml
- plugin: "@serverless-cd/s-deploy"
  name: deploy-function
  inputs:
    # s ${resource} deploy -t ${deployFile} --env ${envName}
    # s helloworld deploy function --type code --env test -t s-test.yaml --debug
    resource: helloworld
    deployFile: s-test.yaml
    envName: test
    debugMode: true
    deployArgs: 
      - "function"
      - "--type code"
```
