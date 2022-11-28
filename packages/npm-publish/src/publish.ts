import { lodash as _, Logger } from '@serverless-cd/core';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { parse as fileParse } from 'dotenv';

export interface IProps {
  registry?: string;
  token?: string;
  // username?: string;
  // password?: string;
  codeDir?: string;
}

const NPM_CONFIG_USERCONFIG = path.join(os.tmpdir(), 'npm', '.npmrc');


export default class Publish {
  private registry: string;
  private token: string;
  // private username: string;
  // private password: string;
  private codeDir: string;
  logger: Logger;

  constructor(props: IProps, logger: Logger) {
    this.token = _.get(props, 'token', '');
    // this.username = _.get(props, 'username', '');
    // this.password = _.get(props, 'password', '');

    let registry = _.get(props, 'registry', '//registry.npmjs.org/');
    if (!_.endsWith(registry, '/')) {
      registry += '/';
    }
    if (_.startsWith(registry, 'https://')) {
      registry = registry.split('https:')[1];
    } else if (_.startsWith(registry, 'http://')) {
      registry = registry.split('http:')[1];
    }
    this.registry = registry;
    this.logger = logger;
    this.codeDir = _.get(props, 'codeDir', '');
  }

  run(cwd: string): void {
    const npmrcString = this.handlerNpmrc(cwd || (process.env.DOWNLOAD_CODE_DIR as string));
    fs.outputFile(NPM_CONFIG_USERCONFIG, npmrcString);

    this.logger.info('run publish:');
    try {
      const resStr = execSync('npm publish', {
        cwd: path.join(cwd, this.codeDir),
        env: {
          ...process.env,
          NPM_CONFIG_USERCONFIG,
        }
      });
      fs.removeSync(NPM_CONFIG_USERCONFIG);
      this.logger.info(resStr.toString());
    } catch (err) {
      fs.removeSync(NPM_CONFIG_USERCONFIG);
      throw err;
    }
  }

  private handlerNpmrc(cwd: string): string {
    const npmrcUrl = path.join(cwd, this.codeDir, '.npmrc');
    this.logger.info(`npmrc url: ${npmrcUrl}`);
    const npmConfig = this.readNpmrcFile(npmrcUrl);
    if (this.token) {
      npmConfig[`${this.registry}:_authToken`] = this.token;
    }

    // env: userconfig 
    let npmrcString = '';
    for (const key in npmConfig) {
      console.log(npmConfig);
      npmrcString += `${key}=${npmConfig[key]}\n`;
    }
  
    this.logger.info('npmrcString: ');
    this.logger.info(npmrcString);
    return npmrcString;
  }

  private readNpmrcFile(npmrcUrl: string): Record<string, string> {
    if (!fs.existsSync(npmrcUrl)) {
      return {};
    }

    const rcBuffer = fs.readFileSync(npmrcUrl);
    const npmConfig = fileParse(rcBuffer);
    return npmConfig;
  }
}

/*
  * TODO: username:password
# email=xxxx@163.com
# always-auth=true
# _auth=base64(user:password)
# //registry.npmjs.org/:_auth=base64(user:password)
# //registry.npmjs.org/:username=user
# //registry.npmjs.org/:_password=password
*/