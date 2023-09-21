## 函数计算正式发布

在灰度发布并验证后，运行此插件，将别名的全部流量指向灰度版本（如果存在），并将灰度版本作为正式版本。

## 使用方法

```yaml
- plugin: @serverless-cd/fc-release
  inputs:
    serviceName: web-framework-kzbp
    aliasName: prod
    regionId: cn-hangzhou
```