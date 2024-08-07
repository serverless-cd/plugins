import { Logger, fs, lodash } from '@serverless-cd/core';
import simpleGit from 'simple-git';
import execa from 'execa';
import { stringify } from './utils';
import path from 'path';
const { get, includes } = lodash;
const debug = require('@serverless-cd/debug')('serverless-cd:checkout');

const GITLAB = ['self-gitlab', 'vpc-gitlab']
const ERROR_PREFIX = {
  SSL: 'unable to access',
};

interface IGitConfig {
  provider: string;
  token: string;
  remote: string;
  execDir: string;
  ref: string;
  branch?: string;
  commit?: string;
  logger?: Logger;
  parameters?: string;
}

interface ITemplateConfig {
  execDir: string;
  template: string;
  parameters?: string;
  logger?: Logger;
}

type Variables = {
  value: string;
  sensitive?: boolean;
  encrypted?: boolean;
};

type Parameters = {
  [key: string]: Variables;
};

const checkoutForAppCenter = async (config: IGitConfig | ITemplateConfig) => {
  const logger = config.logger || console;
  const { execDir } = config;
  debug(`config: ${stringify(config)}`);
  fs.ensureDirSync(execDir);
  if ('provider' in config) {
    return await gitFetch(config);
  }

  if('template' in config ) {
    return await sInit(config);
  }
};

const sInit = async (config: ITemplateConfig) => {
  const logger = config.logger || console;
  const { execDir, template, parameters } = config;
  if (!fs.existsSync(execDir)) {
    throw new Error(`The execDir[${execDir}] does not exist`);
  }

  let nonSecretParameters = await handleSecretParams(JSON.stringify(parameters), execDir, logger);

  const cmd = `s init ${template} --parameters '${JSON.stringify(nonSecretParameters)}' -d ${execDir} --no-overwrite --access default`;
  logger.info(`Execute command: ${cmd} \n\n`);

  const subprocess = execa(cmd, {
    shell: true,
    stripFinalNewline: false,
    cwd: path.dirname(execDir),
  });
  subprocess.stdout?.pipe(process.stdout);
  await subprocess;

  return { template, parameters }
}

const handleSecretParams = async (inputParams: any, execDir: string, logger: any) => {
  try {
    // parsing inputParams string to Parameters object
    let parameters: Parameters = JSON.parse(inputParams);
    let outputParams = {} as { [key: string]: any };

    // filter sensitive parameters
    for (const key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        const variable = parameters[key];
        if (variable.sensitive) {
          // s secret add the secret parameter
          await sSecretAdd(key, variable.value, execDir, logger);
          continue
        }
        // recording the non-sensitive parameters
        outputParams[key] = variable.value;
      }
    }
    return outputParams;
  } catch (error) {
    console.error('Invalid variable json format:', error);
  }
}

const sSecretAdd = async (secretKey: string, secretValue: string, execDir: string, logger: Logger) => {
  const cmd = `s secret add --key ${secretKey} --value ${secretValue} --force`;
  logger.info(`Execute command: s secret add ${secretKey}`);

  const subprocess = execa(cmd, {
    shell: true,
    stripFinalNewline: false,
    cwd: path.dirname(execDir),
  });
  subprocess.stdout?.pipe(process.stdout);
  await subprocess;

}

const gitFetch = async (config: IGitConfig) => {
  const logger = config.logger || console;
  const { execDir, remote, token, branch, commit, provider, ref , parameters} = config;
  // s secret add the sensitive parameters
  if (parameters) {
    await handleSecretParams(JSON.stringify(parameters), execDir, logger);
  }
  if (!fs.existsSync(execDir)) {
    throw new Error(`The execDir[${execDir}] does not exist`);
  }
  const git = simpleGit(execDir);
  // step1: git init
  logger.info(`Git Init ${execDir}`);
  await git.init();
  // step2: git remote add origin
  logger.info(`Git remote add origin ${remote.replace(token, '********')}`);
  await git.addRemote('origin', remote);
  // step3: git fetch & git reset
  if (includes(GITLAB, provider) && branch && commit) { // fix 'git fetch' in old gitlab
    logger.info(`Git pull origin ${branch}`);
    try {
      await git.pull('origin', branch);
    } catch (err) {
      logger.error(get(err, 'message', '').replace(token, '********'));
      if (get(err, 'message', '').indexOf(ERROR_PREFIX.SSL) !== -1) {
        await retry(async () => {
          await git.pull('origin', branch);
        }, 3, { logger, token });
      }
    }

    logger.info(`Git reset --hard ${commit}`);
    const response = await git.reset(['--hard', commit]);
    logger.info(response);
  } else {
    logger.info(`Git fetch --depth=1 origin ${ref}`);
    try {
      await git.fetch('origin', ref, { '--depth': '1' });
    } catch (err) {
      logger.error(get(err, 'message', '').replace(token, '********'));
      if (get(err, 'message', '').indexOf(ERROR_PREFIX.SSL) !== -1) {
        await retry(async () => {
          await git.fetch('origin', ref, { '--depth': '1' });
        }, 3, { logger, token });
      }
    }

    logger.info('Git reset --hard FETCH_HEAD');
    const response = await git.reset(['--hard', 'FETCH_HEAD']);
    logger.info(response);
  }
  const res = await git.log(['--no-color', '-n', '1', "--format='HEAD is now at %h %s'"]);
  logger.info(get(res, 'latest.hash'));
}

const retry = async (func: () => Promise<void>, times: number, options: { logger: any; token: any; }) => {
  const {logger, token} = options;
  for (let i = 0; i < times; i++) {
    try {
      logger.info(`Start retrying, times: ${i + 1} ...`);
      await func();
      logger.info('Retry success');
      break;
    } catch (err) {
      const msg = token ? get(err, 'message', '').replace(token, '********') : get(err, 'message', '');
      logger.error(msg);
    }
  }
}

export default checkoutForAppCenter;
