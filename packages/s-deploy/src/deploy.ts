import { lodash as _, Logger, fs } from '@serverless-cd/core';
import execa, { command } from 'execa';
import path from 'path'; 
import yaml from 'js-yaml';

export interface IProps {
  resource?: string; // Specify a resource in s.yaml. Use the command to s xxx deploy.
  deployFile?: string; // Specific yaml file. Use the command to s deploy -t xxx 
  deployArgs?: string[]; // Specific custom args. Merge with other command args during deployment.
  envName?: string; // Specify envionment. Use the command to s deploy --env
  debugMode?: boolean; // Use the command to s deploy --debug
  workspace: string // worksapce dir.
  infraStackName?: string; // infra stack name
}

class Deploy {
  private logger: Logger;
  private props: IProps;
  constructor(props: IProps, logger: Logger) {
    this.logger = (logger || console) as Logger;
    this.props = props
  }

  async run() {
    const { cmd, args } = await this.generateDeployCommand();  
    const { workspace } = this.props;
    this.logger.info(`Execute command: ${cmd} ${args.join(' ')}\n\n`)
    try {
      const subprocess = execa(cmd, args, {
        shell: true,
        stripFinalNewline: false,
        cwd: workspace,
      });
      subprocess.stdout?.pipe(process.stdout);
      subprocess.stderr?.pipe(process.stderr);
      await subprocess;
    } catch(e) {
      throw new Error(_.get(e, 'originalMessage'));
    }
  }

  async generateDeployCommand() {
    const { resource, deployFile, deployArgs, envName, infraStackName, debugMode, workspace } = this.props;
   
    const cmd = resource ? `s ${resource} deploy` : 's deploy';
    let args = ['--use-local', '--assume-yes', '--skip-push'];
    
    const isDevsV3 = (fileName: string) => {
      const syaml = yaml.load(fs.readFileSync(fileName, 'utf8'));
      return _.get(syaml, 'edition') === '3.0.0';
    }

    let manifest
    if (deployFile) {
      manifest = path.resolve(workspace, deployFile);
      if (!fs.existsSync(manifest)) {
        throw new Error(`The deploy manifest [${manifest}] does not exist`)
      }
      args.push(`-t ${deployFile}`)
    } else {
      manifest = path.resolve(workspace, 's.yaml');
    }

    this.logger.info(`Deploy manifest: ${manifest}`)

    if (isDevsV3(manifest) && envName) {
      this.logger.info("use sererless-devs v3 multi-environment")
      args.push(`--env ${envName}`);
    } else if(envName && infraStackName) {
      args.push(`--env ${infraStackName}`);
    }

    if (debugMode) {
      args.push('--debug');
    }

    if (Array.isArray(deployArgs)) {
      args = args.concat(deployArgs)
    }

    return { cmd, args };
  }
}

export default Deploy;

