import Engine from '@serverless-cd/engine';
import path from 'path';
import fs from 'fs-extra';
import { IProvider } from '../src/types';
import checkout from '../src';

require('dotenv').config({ path: path.join(__dirname, '.env') });
const logPrefix = path.join(__dirname, 'logs');
const plugin = path.join(__dirname, '..', 'src');
const exec_dir = path.join(__dirname, '_temp');

describe('仓库未初始化', () => {
  beforeAll(() => {
    fs.removeSync(exec_dir);
  });
  test('checkout no ref and commit', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'no-agrs'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref branch case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch'),
          ref: 'refs/heads/test',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref branch and commit case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch-and-commit'),
          ref: 'refs/heads/test',
          commit: '7ba9d158a0875969a51750345ec07616a912c301',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref tag case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-tag'),
          ref: 'refs/tags/0.0.2',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout commit', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'commit'),
          commit: '3b763ea19e8e8a964e90e75962ccb8e0d68bdf46',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
});

describe('仓库已经初始化', () => {
  test('checkout no ref and commit', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'no-agrs'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref branch case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch'),
          ref: 'refs/heads/test',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref branch and commit case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch-and-commit'),
          ref: 'refs/heads/test',
          commit: '7ba9d158a0875969a51750345ec07616a912c301',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref tag case', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-tag'),
          ref: 'refs/tags/0.0.2',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout commit', async () => {
    const steps = [
      {
        plugin,
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'commit'),
          commit: '3b763ea19e8e8a964e90e75962ccb8e0d68bdf46',
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
});

describe('plugin inputs case', () => {
  beforeAll(() => {
    fs.removeSync(exec_dir);
  });
  test('checkout ref branch case', async () => {
    const steps = [
      {
        plugin,
        inputs: {
          ref: 'refs/heads/test',
        },
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref branch and commit case', async () => {
    const steps = [
      {
        plugin,
        inputs: {
          ref: 'refs/heads/test',
          commit: '7ba9d158a0875969a51750345ec07616a912c301',
        },
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-branch-and-commit'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout ref tag case', async () => {
    const steps = [
      {
        plugin,
        inputs: {
          ref: 'refs/tags/0.0.2',
        },
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'ref-with-tag'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
  test('checkout commit', async () => {
    const steps = [
      {
        plugin,
        inputs: {
          commit: '3b763ea19e8e8a964e90e75962ccb8e0d68bdf46',
        },
      },
    ];
    const engine = new Engine({
      cwd: __dirname,
      steps,
      logConfig: { logPrefix },
      inputs: {
        git: {
          token: process.env.TOKEN,
          provider: 'gitee' as IProvider,
          owner: 'shihuali',
          clone_url: 'https://gitee.com/shihuali/checkout.git',
          exec_dir: path.join(exec_dir, 'commit'),
        },
      },
    });
    const res = await engine.start();
    expect(res.status).toBe('success');
  });
});

describe('use npm', () => {
  test('checkout ref branch case', async () => {
    await expect(
      checkout({
        token: process.env.TOKEN as string,
        provider: 'gitee' as IProvider,
        owner: 'shihuali',
        clone_url: 'https://gitee.com/shihuali/checkout.git',
        exec_dir: path.join(exec_dir, 'no-agrs-with-npm'),
        ref: 'refs/heads/test',
      }),
    ).resolves.not.toThrow();
  });
});

test('checkout for appcenter', async () => {
  fs.removeSync(exec_dir);
  const steps = [
    {
      plugin,
    },
  ];
  const engine = new Engine({
    cwd: path.join(exec_dir, 'app-center'),
    steps,
    logConfig: { logPrefix },
    inputs: {
      ctx: {
        data: {
          checkout: {
            branch: 'master',
            commit: '57f0153d92cfd1b445235a7763b2a799df1f42b2',
            message: 'Initialize by template start-springboot',
            provider: 'github',
            ref: '+573f1291e79970d9ac26b1690d3dd71d8d97b044:refs/remotes/origin/master',
            remote: `https://${process.env.APPCENTER_TOKEN}@github.com/rsonghuster/start-cadt-app-el6m.git`,
            token: process.env.APPCENTER_TOKEN,
            userName: 'rsonghuster',
          },
        },
      },
    },
  });
  const res = await engine.start();
  expect(res.status).toBe('success');
});

test('checkout for appcenter template v3', async () => {
  fs.removeSync(exec_dir);
  const steps = [
    {
      plugin,
    },
  ];
  const engine = new Engine({
    cwd: path.join(exec_dir, 'app-center'),
    steps,
    logConfig: { logPrefix },
    inputs: {
      ctx: {
        data: {
          checkout: {
            template: 'start-cadt-app',
            parameters: {
              "functionName": "start-cadt-app-h362-0jz81hxj",
              "cadtJsonString": {
                  "bucket_1691151092": {
                      "component": "aliyun_oss_bucket@dev",
                      "props": {
                          "bucket": "xl-bucket-3002",
                          "redundancy_type": "LRS",
                          "storage_class": "Standard",
                          "acl": "private"
                      }
                  },
                  "logStore_sourcelog_1693965436": {
                      "component": "aliyun_sls_logstore@dev",
                      "props": {
                          "depends_on": [
                              "logProject_1693965436"
                          ],
                          "retention_forever": false,
                          "auto_split": true,
                          "shard_count": 2,
                          "name": "sourcelog",
                          "project": "xl-sls-3002",
                          "enable_web_tracking": false,
                          "append_meta": true,
                          "retention_period": 3000,
                          "max_split_shard_count": 64
                      }
                  },
                  "fc_function_1693882938": {
                      "component": "fc3@dev",
                      "actions": {
                          "pre-deploy": [
                              {
                                  "path": "./",
                                  "run": "bash init_code.sh nodejs16 xl-fc-3002 index.js"
                              }
                          ]
                      },
                      "props": {
                          "function": {
                              "handler": "index.handler",
                              "diskSize": 512,
                              "memorySize": 512,
                              "code": "xl-fc-3002",
                              "functionName": "xl-fc-3002",
                              "environmentVariables": {
                                  "TZ": "Asia/Shanghai",
                                  "stackName": "${resources.cadt_9U8TNE2C4Z5EO3UF.props.name}"
                              },
                              "runtime": "nodejs16",
                              "cpu": 0.35,
                              "timeout": 60
                          },
                          "region": "cn-huhehaote",
                          "triggers": [
                              {
                                  "sourceArn": "acs:oss:cn-huhehaote:${config(\"AccountID\")}:xl-bucket-3002",
                                  "triggerConfig": {
                                      "filter": {
                                          "key": {
                                              "prefix": "src/",
                                              "suffix": ".zip"
                                          }
                                      },
                                      "events": [
                                          "oss:ObjectCreated:PutObject",
                                          "oss:ObjectCreated:PostObject",
                                          "oss:ObjectCreated:CompleteMultipartUpload"
                                      ]
                                  },
                                  "triggerName": "oss_t",
                                  "qualifier": "LATEST",
                                  "triggerType": "oss",
                                  "invocationRole": "acs:ram::${config(\"AccountID\")}:role/aliyunosseventnotificationrole"
                              },
                              {
                                  "sourceArn": "acs:log:cn-huhehaote:${config(\"AccountID\")}:project/xl-sls-3002",
                                  "triggerConfig": {
                                      "jobConfig": {
                                          "triggerInterval": 60,
                                          "maxRetryTime": 3
                                      },
                                      "logConfig": {
                                          "project": "SlsProjectName",
                                          "logstore": "joblog"
                                      },
                                      "sourceConfig": {
                                          "logstore": "sourcelog"
                                      },
                                      "enable": true,
                                      "functionParameter": {}
                                  },
                                  "triggerName": "log_t",
                                  "qualifier": "LATEST",
                                  "triggerType": "log",
                                  "invocationRole": "acs:ram::${config(\"AccountID\")}:role/aliyunlogetlrole"
                              }
                          ]
                      }
                  },
                  "logProject_1693965436": {
                      "component": "aliyun_sls_project@dev",
                      "props": {
                          "name": "xl-sls-3002",
                          "description": "xl 3002 test log project"
                      }
                  },
                  "logStore_joblog_1693965436": {
                      "component": "aliyun_sls_logstore@dev",
                      "props": {
                          "depends_on": [
                              "logProject_1693965436"
                          ],
                          "retention_forever": false,
                          "auto_split": true,
                          "shard_count": 2,
                          "name": "joblog",
                          "project": "xl-sls-3002",
                          "enable_web_tracking": false,
                          "append_meta": true,
                          "retention_period": 3000,
                          "max_split_shard_count": 64
                      }
                  },
                  "cadt_9U8TNE2C4Z5EO3UF": {
                      "component": "ros_transformer@dev",
                      "props": {
                          "refs": [
                              "${resources.bucket_1691151092.output}",
                              "${resources.logProject_1693965436.output}",
                              "${resources.logStore_sourcelog_1693965436.output}",
                              "${resources.logStore_joblog_1693965436.output}"
                          ],
                          "name": "cadt_9U8TNE2C4Z5EO3UF",
                          "region": "cn-huhehaote"
                      }
                  }
              },
              "serviceName": "start-cadt-app-h362-0jz81hxj"
            }
          },
        },
      },
    },
  });
  const res = await engine.start();
  expect(res.status).toBe('success');
});

test('checkout for appcenter template v2', async () => {
  fs.removeSync(exec_dir);
  const steps = [
    {
      plugin,
    },
  ];
  const engine = new Engine({
    cwd: path.join(exec_dir, 'app-center'),
    steps,
    logConfig: { logPrefix, logLevel: 'DEBUG' },
    inputs: {
      ctx: {
        data: {
          checkout: {
            template: 'start-springboot',
            parameters: {
              "functionName": "springboot",
              "region": "cn-hangzhou",
              "serviceName": "web-framework-sbm4"
            }
          },
        },
      },
    },
  });
  const res = await engine.start();
  expect(res.status).toBe('success');
});

test('checkout for oss source config', async () => {
  fs.removeSync(exec_dir);
  const steps = [
    {
      plugin,
    },
  ];
  const engine = new Engine({
    cwd: path.join(exec_dir, 'app-center'),
    steps,
    logConfig: { logPrefix, logLevel: 'DEBUG' },
    inputs: {
      scheduleRegion: 'cn-hangzhou',
      sts: {
        accessKeyId: "",
        accessKeySecret: "",
        // securityToken: "",
      },
      ctx: {
        data: {
          checkout: {
              bucket: 'jingsu-test-upload',
              object: 'captest/zipdir/start_flask.zip',
              ossRegion: 'cn-hangzhou',
          },
        },
      },
    },
  });
  const res = await engine.start();
  expect(res.status).toBe('success');
});
