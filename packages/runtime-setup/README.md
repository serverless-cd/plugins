# `npm-publish`

> description: 初始化运行环境的构建工具或编程语言版本。


## Usage

在流水线中使用，如：

```
- plugin: "@serverless-cd/runtime-setup"
  inputs:
  	runtime:
      - nodejs16
      - python3.9
```

## Runtime列表

支持的Runtime列表
```
  nodejs12
  nodejs14 [default]
  nodejs16
  nodejs18
  nodejs20
  java8 [default]
  java11
  java17
  python2.7
  python3.6
  python3.7
  python3.9 [default]
  python3.10
  go1.18 [default]
  go1.19
  go1.20
  go1.21
```
