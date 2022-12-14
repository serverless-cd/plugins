import Engine from '@serverless-cd/engine';
import * as core from '@serverless-cd/core';
import path from 'path';
import { TYPE } from '../../src/ding-talk';

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const logPrefix = path.join(__dirname, 'logs');
const plugin = path.join(__dirname, '..', '..', 'src');
const webhook = 'https://oapi.dingtalk.com/robot/send?access_token=${{ secrets.DING_TALK_TOKEN }}';
const secrets = {
  DING_TALK_TOKEN: process.env.DING_TALK_TOKEN,
  DING_TALK_SECRET: process.env.DING_TALK_SECRET,
};

test('JSON测试MARKDOWN', async () => {
  const steps = [
    {
      plugin,
      inputs: {
        webhook,
        msgtype: TYPE.MARKDOWN,
        secret: '${{secrets.DING_TALK_SECRET}}',
        payload: {
          title: '我们杭州天气',
          text: '#### 杭州天气 @150XXXXXXXX \n > 9度，西北风1级，空气良89，相对温度73%\n > ![screenshot](https://img.alicdn.com/tfs/TB1NwmBEL9TBuNjy1zbXXXpepXa-2400-1218.png)\n > ###### 10点20分发布 [天气](https://www.dingtalk.com) \n',
        },
      },
    },
  ];

  const engine = new Engine({
    cwd: __dirname,
    steps,
    logConfig: { logPrefix },
    inputs: { secrets },
  });
  await engine.start();
});

// const steps = [
//   {
//     plugin: '/Users/shihuali/workspace/serverless-cd/plugins/packages/ding-talk/src',
//     inputs: {
//       webhook: 'https://oapi.dingtalk.com/robot/send?access_token=${{ secrets.DING_TALK_TOKEN }}',
//       msgtype: 'markdown',
//       secret: '${{secrets.DING_TALK_SECRET}}',
//       payload: {
//         title: '我们杭州天气',
//         text: '#### 杭州天气 @150XXXXXXXX \n > 9度，西北风1级，空气良89，相对温度73%\n > ![screenshot](https://img.alicdn.com/tfs/TB1NwmBEL9TBuNjy1zbXXXpepXa-2400-1218.png)\n > ###### 10点20分发布 [天气](https://www.dingtalk.com) \n',
//       },
//     },
//   },
// ];

test.only('YAML测试MARKDOWN', async () => {
  const engine = new Engine({
    cwd: __dirname,
    logConfig: { logPrefix },
    inputs: { secrets },
    events: {
      onInit: async function name(context, logger) {
        const pipelinePath = path.join(__dirname, 'serverless-pipeline.yaml');
        const res = core.parseSpec(pipelinePath);
        logger.info(`spec: ${JSON.stringify(res)}`);
        return res;
      },
    },
  });
  await engine.start();
});
