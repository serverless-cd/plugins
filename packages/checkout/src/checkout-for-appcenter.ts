import { Logger, fs, lodash } from '@serverless-cd/core';
import simpleGit from 'simple-git';
import execa from 'execa';
import { stringify } from './utils';
import path from 'path';
import {ICredentials} from "./types";
import decompress from 'decompress';
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
  userName?: string;
  logger?: Logger;
}

interface ITemplateConfig {
  execDir: string;
  template: string;
  parameters?: string;
  logger?: Logger;
}

interface ITemplateSourceConfig {
  execDir: string;
  templateUrl: string;
  logger?: Logger;
}

interface IOssConfig {
  execDir: string;
  bucket: string;
  object: string;
  logger?: Logger;
}

const checkoutForAppCenter = async (config: IGitConfig | ITemplateConfig | ITemplateSourceConfig | IOssConfig, credentials: ICredentials, region: string) => {
  const logger = config.logger || console;
  const { execDir } = config;
  debug(`config: ${stringify(config)}`);
  fs.ensureDirSync(execDir);
  if ('provider' in config) {
    // 临时解决git拉取gitee代码失败的问题
    if (config.provider === 'gitee') {
      return await downloadCodeFromGitee(config);
    }
    return await gitFetch(config);
  }

  if('template' in config ) {
    return await sInit(config);
  }

  if('templateUrl' in config) {
    return await downloadTemplateSource(config);
  }

  if('bucket' in config) {
    return await downloadCodeFromOss(config, credentials, region);
  }
};

const downloadTemplateSource = async (config: ITemplateSourceConfig) => {
  const logger = config.logger || console;
  const { execDir, templateUrl } = config;
  if (!fs.existsSync(execDir)) {
    throw new Error(`The execDir[${execDir}] does not exist`);
  }

  let downloadCmd = `curl -L "$url" -o "$temp_zip"`

  // when DEVS_MOCK_ENV is true, template download times will not be counted up
  if (process.env.DEVS_MOCK_ENV == 'true') {
    logger.info('DEVS_MOCK_ENV is true, template download times will not be counted up')
    downloadCmd = `curl -L "$url" -o "$temp_zip" -H "devs_mock_env: true"`
  }

  const downloadScript = `
#!/bin/bash
set -ex

workspace_dir=${execDir}
url=${templateUrl}
temp_zip="temp.zip"
temp_dir="temp_dir"

mkdir -p "$workspace_dir"

${downloadCmd}

mkdir -p "$temp_dir"
unzip "$temp_zip" -d "$temp_dir"

src_path=$(find "$temp_dir" -type d -name "src" | head -n 1)

if [ -d "$src_path" ]; then
    cp -r "$src_path/"* "$workspace_dir/"
else
    echo "not found src"
fi

rm -rf "$temp_zip" "$temp_dir"
  `

  const subprocess = execa(downloadScript, {
    shell: true,
    stripFinalNewline: false,
    // cwd: path.dirname(execDir),
  });
  subprocess.stdout?.pipe(process.stdout);
  await subprocess;

  return { templateUrl }
}

const sInit = async (config: ITemplateConfig) => {
  const logger = config.logger || console;
  const { execDir, template, parameters } = config;
  if (!fs.existsSync(execDir)) {
    throw new Error(`The execDir[${execDir}] does not exist`);
  }

  const cmd = `s init ${template} --parameters '${JSON.stringify(parameters)}' -d ${execDir} --no-overwrite --access default`;
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

const downloadCodeFromGitee = async (config: IGitConfig) => {
  const logger = config.logger || console;
  const { execDir, remote, token, branch, commit, provider, ref, userName} = config;
  if (!fs.existsSync(execDir)) {
    throw new Error(`The execDir[${execDir}] does not exist`);
  }
  const repo = extractRepoFromUrl(remote);
  let codeZipName = `${repo}-${commit}.zip`
  let innerDirName = `${repo}-${commit}`
  let downloadCmd = `curl -L "https://gitee.com/api/v5/repos/${userName}/${repo}/zipball?access_token=${token}&ref=${commit}" -o "${codeZipName}"`
  function extractRepoFromUrl(remoteUrl: string): string | null {
    const repoRegex = /\/([\w-]+)(\.git)?$/;
    const match = remoteUrl.match(repoRegex);
    if (match && match[1]) {
      return match[1];
    }
    return "";
  }

  // download code zip from gitee
  try {
    const subprocess = execa(downloadCmd, {
      shell: true,
      stripFinalNewline: false,
      cwd: execDir,
    });
    subprocess.stdout?.pipe(process.stdout);
    await subprocess;

    // Create a temporary directory for extracting
    const tempDir = path.join(execDir, 'temp');
    await fs.ensureDir(tempDir);

    // unzip to the temporary directory
    await decompress(path.join(execDir, codeZipName), tempDir);
    logger.info(`Unzipped ${codeZipName} to temporary directory`);

    // detect innerDirName
    const tempContents = await fs.readdir(tempDir, { withFileTypes: true });
    // find the decompressed dir
    const innerDirEntry = tempContents.find(
        entry => entry.isDirectory() && !entry.name.startsWith('.')
    );
    if (!innerDirEntry) {
      throw new Error('The code repo is empty, failed to detect the main folder after decompressing the zip, please check your code repo.');
    }
    logger.info(`Detected innerDirName: ${innerDirEntry.name}`);
    const innerDir = path.join(tempDir, innerDirEntry.name);

    // move to execDir
    const extractedFiles = await fs.readdir(innerDir);
    for (const file of extractedFiles) {
      await fs.move(path.join(innerDir, file), path.join(execDir, file), { overwrite: true });
    }

    // Clean up temporary directory
    await fs.remove(tempDir);
    logger.info(`Moved contents from temporary directory to ${execDir}`);

    // Delete the zip file
    await fs.promises.unlink(path.join(execDir, codeZipName));
    logger.info(`Deleted ${codeZipName} from ${execDir}`);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

const gitFetch = async (config: IGitConfig) => {
  const logger = config.logger || console;
  const { execDir, remote, token, branch, commit, provider, ref } = config;
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
    // pulling code from git with retry
    await retryOnSSLError(async () => { await git.pull('origin', branch); }, 3, { logger, token });

    logger.info(`Git reset --hard ${commit}`);
    const response = await git.reset(['--hard', commit]);
    logger.info(response);
  } else {
    logger.info(`Git fetch --depth=1 origin ${ref}`);
    // pulling code from git with retry
    await retryOnSSLError(async () => { await git.fetch('origin', ref, { '--depth': '1' })}, 3, { logger, token });

    logger.info('Git reset --hard FETCH_HEAD');
    const response = await git.reset(['--hard', 'FETCH_HEAD']);
    logger.info(response);
  }
  const res = await git.log(['--no-color', '-n', '1', "--format='HEAD is now at %h %s'"]);
  logger.info(get(res, 'latest.hash'));
}

const retryOnSSLError = async (
    func: () => Promise<void>,
    maxRetries: number,
    options: { logger: any; token: string }
) => {
  const { logger, token } = options;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (i === 0) {
        logger.info('executing pulling code from git operation...');
      } else {
        logger.info(`retry attempt ${i}/${maxRetries}...`);
      }

      await func();
      logger.info('pulling code from git succeeded.');
      return; // Success, exit early
    } catch (err: any) {
      const errorMessage = get(err, 'message', '');
      const sanitizedMessage = token ? errorMessage.replace(token, '********') : errorMessage;

      logger.error(`Operation failed: ${sanitizedMessage}`);

      // Only retry if it's an SSL error AND we haven't exhausted retries
      if (i < maxRetries && errorMessage.includes(ERROR_PREFIX.SSL)) {
        logger.warn('SSL error detected, retrying...');
        continue;
      }

      throw new Error(`Git fetch operation failed: ${sanitizedMessage}`);
    }
  }
};

const downloadCodeFromOss = async (config: IOssConfig, credentials: ICredentials, region: string) => {
  const logger = config.logger || console;
  const { execDir, bucket, object } = config;
  let endpoint = `https://oss-${region}.aliyuncs.com`;
  if (region.endsWith(process.env.FC_REGION || 'unknown')) {
    endpoint = `oss-${process.env.FC_REGION}-internal.aliyuncs.com`;
  }
  let saveCodeCmd = `ossutil cp -r oss://${bucket}/${object} ${execDir} --region ${region} -e ${endpoint} -i ${credentials.accessKeyId} -k ${credentials.accessKeySecret}`
  if (credentials.securityToken) {
    saveCodeCmd += ` -t ${credentials.securityToken}`
  }

  const getFileNameFromPath = (path: string): string => {
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    return path.substring(lastSlashIndex + 1);
  };

  try {
    // download the code saved in oss
    const subprocess = execa(saveCodeCmd, {
      shell: true,
      stripFinalNewline: false,
      cwd: path.dirname(execDir),
    });
    subprocess.stdout?.pipe(process.stdout);
    await subprocess;
    // unzip when download file is zip type
    if (object.endsWith('.zip')) {
      const zipFileName = getFileNameFromPath(object);
      if (await isZipFile(path.join(execDir, zipFileName))) {
        logger.debug(`unzip ${zipFileName} to ${execDir}`);
        await decompress(path.join(execDir, zipFileName), execDir);
        logger.info(`unzip ${zipFileName} to ${execDir} finished`);
        // delete the zip file
        await fs.promises.unlink(path.join(execDir, zipFileName));
        logger.info(`deleted ${zipFileName} from ${execDir}`);
      }
    }
  } catch (err) {
    logger.error('Failed to download code from OSS:', err);
    throw new Error(
        `Failed to download code from OSS: bucket=${bucket}, object=${object}, region=${region}, endpoint=${endpoint}. ` +
        `Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`
    );
  }
}

const isZipFile = async (filePath: string): Promise<boolean> => {
  const buffer = await fs.promises.readFile(filePath, { encoding: null });
  return buffer.readUInt32LE(0) === 0x04034b50;
};

export default checkoutForAppCenter;
