import { Logger } from '@serverless-cd/core';

export type IProvider = 'github' | 'gitee' | 'gitlab' | 'codeup';

export interface IConfig {
  token: string;
  provider: IProvider;
  owner: string;
  clone_url: string;
  logger?: Logger;
  exec_dir?: string;
  ref?: string;
  commit?: string;
}

export interface ICredentials {
  accountId: string;
  accessKeyId: string;
  accessKeySecret: string;
  securityToken?: string;
}
