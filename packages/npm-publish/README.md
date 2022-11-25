# `npm-publish`

> TODO: description

## Usage

```
const npmPublish = require('npm-publish');

// TODO: DEMONSTRATE API
```

```
- name: Register Token 
  plugin: @serverless-cd/npm-publish
  inputs:
  	registry: //registry.npmjs.org # 默认， （代码中去掉协议头）
    token: ${{ secrets.npm_token }}
		username: ${{ secrets.username }}
    password: ${{ secrets.password }}
```
