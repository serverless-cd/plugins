## 函数计算灰度发布

尝试发布一个版本（如果有必要）进行灰度，并更新服务的别名，将一定比例的流量指向要灰度的版本。
如果别名不存在，将用灰度版本创建相应的别名。

## 使用方法

```yaml

- plugin: @serverless-cd/fc-canary
  inputs:
    serviceName: web-framework-kzbp
    aliasName: prod
    regionId: cn-hangzhou
    canaryPercent: 50
```