import { lodash } from '@serverless-cd/core';
import * as path from 'path';
import Engine from '@serverless-cd/engine';
const logPrefix = path.join(__dirname, 'logs');
const { get } = lodash;

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
test('run方法是否执行成功', async () => {
  const steps = [
    {
      plugin: path.join(__dirname, '..', 'src'),
      inputs: {
        config: {
          service: "${{secrets.service}}", // 通用邮箱类型
          // 这里密码不是密码，是你设置的smtp、POP3/SMTP、IMAP/SMTP授权码
          // 获取qq授权码请看:https://jingyan.baidu.com/article/6079ad0eb14aaa28fe86db5a.html
          pass: '${{secrets.pass}}',
          secure: true, // 为false默认端口号587 为true默认端口号为465
          host: '{{secrets.host}}', // 服务器地址
          port: '{{secrets.port}}', // 自定义端口号
        },
        mail: {
          from: '${{secrets.sender}}', // 你到qq邮箱地址
          to: '${{secrets.receiver}}', // 接受人,可以群发填写多个逗号分隔
          subject:
           'Hello', // 主题名(邮件名)
          html: '<b>Hello world?</b>',
        },
      },
      id: 'cdn-cache',
    },
    { run: 'echo "hello world"' },
  ];
  const engine = new Engine({
    steps,
    logConfig: { logPrefix },
    inputs: {
      secrets: {
        msg: 'this is a secrets test',
        sender: process.env.sender,
        receiver: process.env.receiver,
        pass: process.env.pass,
        service: process.env.service,
        // host: process.env?.host,
        // port: process.env?.port,
      },
    },
  });
  const context = await engine.start();
  // console.log('process', process.env);
  console.log(context);
  expect(get(context, 'status')).toBe('success');
});
