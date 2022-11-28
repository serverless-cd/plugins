# `npm-publish`

> TODO: description

## Usage


```
- name: Register Token 
  plugin: @serverless-cd/npm-publish
  inputs:
  	registry: //registry.npmjs.org # 默认
    token: ${{ secrets.npm_token }} 
    codeDir: ./code # 默认为代码库根目录
```
