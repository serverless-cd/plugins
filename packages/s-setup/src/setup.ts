import { lodash as _, Logger } from '@serverless-cd/core';
import { spawnSync } from 'child_process';

export interface ICredentials {
  accountId: string;
  accessKeyId: string;
  accessKeySecret: string;
  securityToken?: string;
}

export interface IProps {
  alias: string;
  credentials: ICredentials;
  projectName?: string;
  envName?: string;
  infraStackName?: string;
  workspace: string;
}

export default function setup(props: IProps, logger: Logger) {
  try {
    checkDevs(logger);
  } catch (_e) {
    logger.info('Attempt to install devs...');
    spawnSync('npm install @serverless-devs/s -g', { shell: true, encoding: 'utf8' });
    logger.info('Attempt to install devs end. Retry check s');
    checkDevs(logger);
  }

  initAccess(props, logger);
  initEnvironment(props, logger);
  setDefaultEnvironment(props, logger);
}

function checkDevs(logger: Logger) {
  const { status, stdout, stderr } = spawnSync('s --version', { shell: true, encoding: 'utf8' });
  logger.debug(`Run s --version status: ${status}`);
  logger.info(stdout);
  if (stderr) {
    logger.error(stderr);
  }
  if (status !== 0) {
    throw new Error('Serverless Devs is not installed');
  }
}

const initAccess = (props: IProps, logger: Logger) => {
  const alias = _.get(props, 'alias', 'default');
  const credentials = _.get(props, 'credentials', {} as ICredentials);
  if (_.isEmpty(credentials)) {
    throw new Error('Failed to setup Serverless Devs');
  }

  
  let runCommond = `s config add --AccessKeyID "${credentials.accessKeyId}" --AccessKeySecret "${credentials.accessKeySecret}"`;
  if (credentials.accountId) {
    runCommond = `${runCommond} --AccountID ${credentials.accountId}`
  }
  if (credentials.securityToken) {
    runCommond = `${runCommond} --SecurityToken "${credentials.securityToken}"`
  }
  runCommond = `${runCommond} --access "${alias}" -f`;
  logger.debug(`Run s add commond: ${runCommond}`);
  const addRes = spawnSync(runCommond, { shell: true, encoding: 'utf8' })
  logger.info(addRes.stdout);
  if (addRes.stderr) {
    logger.error(addRes.stderr);
  }
  process.env.serverless_devs_access_cicd_alias_name = alias;

}

const initEnvironment = (props: IProps, logger: Logger) => {
  const { workspace, envName, projectName, infraStackName } = props;
  const alias = _.get(props, 'alias', 'default');
  if (!envName) {
    return;
  }
  let cmd = `s env init --name ${envName} --project ${projectName} --access ${alias}`;
  if (infraStackName) {
    cmd += ` --infra-stack-name ${infraStackName}`;
  }
  logger.info(`Execute command: ${cmd} \n\n`);

  const result = spawnSync(cmd, { cwd: workspace, shell: true, encoding: 'utf8' })
  logger.info(result.stdout);
  if (result.stderr) {
    logger.error(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error('Failed to init environment');
  }
}

const setDefaultEnvironment = (props: IProps, logger: Logger) => {
  const { workspace, envName } = props;
  if (!envName) {
    return;
  }
  const cmd = `s env default --name ${envName}`;
  logger.info(`Execute command: ${cmd} \n\n`);

  const result = spawnSync(cmd, { cwd: workspace, shell: true, encoding: 'utf8' })
  logger.info(result.stdout);
  if (result.stderr) {
    logger.error(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error('Failed to set default environment');
  }
}
