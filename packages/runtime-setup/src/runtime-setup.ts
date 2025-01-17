import { lodash as _, Logger } from '@serverless-cd/core';
import { isEmpty } from "lodash";

enum Runtime {
  NODEJS12 = 'nodejs12',
  NODEJS14 = 'nodejs14',
  NODEJS16 = 'nodejs16',
  NODEJS18 = 'nodejs18',
  NODEJS20 = 'nodejs20',
  NODEJS22 = 'nodejs22',
  JAVA8 = 'java8',
  JAVA11 = 'java11',
  JAVA17 = 'java17',
  PYTHON27 = 'python2.7',
  PYTHON36 = 'python3.6',
  PYTHON37 = 'python3.7',
  PYTHON39 = 'python3.9',
  PYTHON310 = 'python3.10',
  GO118 = 'go1.18',
  GO119 = 'go1.19',
  GO120 = 'go1.20',
  GO121 = 'go1.21',
  PHP72 = 'php7.2',
}


const appAppendPath = {
  [Runtime.NODEJS12]: '/usr/local/versions/node/v12.22.12/bin',
  [Runtime.NODEJS14]: '/usr/local/versions/node/v14.19.2/bin',
  [Runtime.NODEJS16]: '/usr/local/versions/node/v16.15.0/bin',
  [Runtime.NODEJS18]: '/usr/local/versions/node/v18.14.2/bin',
  [Runtime.NODEJS20]: '/usr/local/versions/node/v20.8.1/bin',
  [Runtime.NODEJS22]: '/usr/local/versions/node/v22.11.0/bin',
  [Runtime.PYTHON27]: '/usr/local/envs/py27/bin',
  [Runtime.PYTHON36]: '/usr/local/envs/py36/bin',
  [Runtime.PYTHON37]: '/usr/local/envs/py37/bin',
  [Runtime.PYTHON39]: '/usr/local/envs/py39/bin',
  [Runtime.PYTHON310]: '/usr/local/envs/py310/bin',
  [Runtime.GO118]: '/root/.gvm/pkgsets/go1.18.10/global/bin:/root/.gvm/gos/go1.18.10/bin:/root/.gvm/pkgsets/go1.18.10/global/overlay/bin',
  [Runtime.GO119]: '/root/.gvm/pkgsets/go1.19.13/global/bin:/root/.gvm/gos/go1.19.13/bin:/root/.gvm/pkgsets/go1.19.13/global/overlay/bin',
  [Runtime.GO120]: '/root/.gvm/pkgsets/go1.20.11/global/bin:/root/.gvm/gos/go1.20.11/bin:/root/.gvm/pkgsets/go1.20.11/global/overlay/bin',
  [Runtime.GO121]: '/root/.gvm/pkgsets/go1.21.4/global/bin:/root/.gvm/gos/go1.21.4/bin:/root/.gvm/pkgsets/go1.21.4/global/overlay/bin',
  [Runtime.JAVA8]: '/usr/lib/jvm/openjdk-8u392b08/bin',
  [Runtime.JAVA11]: '/usr/lib/jvm/openjdk-11.0.21_9/bin',
  [Runtime.JAVA17]: '/usr/lib/jvm/openjdk-17.0.1_12/bin',
}

const extraEnvConfig = {
  [Runtime.JAVA8]: {
    "JAVA_HOME": "/usr/lib/jvm/openjdk-8u392b08",
  },
  [Runtime.JAVA11]: {
    "JAVA_HOME": "/usr/lib/jvm/openjdk-11.0.21_9",
  },
  [Runtime.JAVA17]: {
    "JAVA_HOME": "/usr/lib/jvm/openjdk-17.0.1_12",
  },
  [Runtime.GO118]:{
    "GOROOT": "/root/.gvm/gos/go1.18.10",
    "GOPATH": "/root/.gvm/pkgsets/go1.18.10/global",
  },
  [Runtime.GO119]: {
    "GOROOT": "/root/.gvm/gos/go1.19.13",
    "GOPATH": "/root/.gvm/pkgsets/go1.19.13/global",
  },
  [Runtime.GO120]: {
    "GOROOT": "/root/.gvm/gos/go1.20.11",
    "GOPATH": "/root/.gvm/pkgsets/go1.20.11/global",
  },
  [Runtime.GO121]: {
    "GOROOT": "/root/.gvm/gos/go1.21.4",
    "GOPATH": "/root/.gvm/pkgsets/go1.21.4/global",
  },
}

export interface IProps {
  runtime: Runtime;
}


export default function runtimeSetup (props: IProps, logger: Logger) {
  const runtimes = _.get(props, 'runtime', [])
  if (!_.isArray(runtimes)) {
    logger.error('Runtime does not meet expectations, skipping processing');
    return;
  }
  const supportedRuntime = Object.values(Runtime);
  for (const runtime of runtimes) {
    if (_.includes(supportedRuntime, runtime)) {
      const needAppendPath = _.get(appAppendPath, runtime);
      logger.debug(`Runtime ${runtime} need appended path: ${needAppendPath}`);
      if (needAppendPath) {
        const p = process.env.PATH || '';
        process.env.PATH = `${needAppendPath}:${p}`;
      }
      const extraEnv = extraEnvConfig[runtime]
      logger.debug(`Runtime ${runtime} extra env: ${extraEnv}`);
      if (extraEnv) {
        for (const key of Object.keys(extraEnv)) {
          process.env[key] = extraEnv[key];
        }
      }
    } else {
      logger.error(`${runtime} does not meet expectations, skipping processing`);
    }
  }
  logger.debug(`echo $PATH: ${JSON.stringify(process.env.PATH)}`);
  logger.debug(`echo env: ${JSON.stringify(process.env)}`);
}


function isJavaRuntime(runtime: string): boolean{
    if (isEmpty(runtime)) {
        return false;
    }
    return runtime.startsWith('java')
}