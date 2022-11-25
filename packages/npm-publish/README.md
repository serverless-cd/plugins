# `npm-publish`

> TODO: description

## Usage


```
- name: Register Token 
  plugin: @serverless-cd/npm-publish
  inputs:
  	registry: //registry.npmjs.org # 默认， （代码中去掉协议头）
    token: ${{ secrets.npm_token }}
		username: ${{ secrets.username }}
    password: ${{ secrets.password }}
    codeDir: ./code # 默认为代码库根目录
```
