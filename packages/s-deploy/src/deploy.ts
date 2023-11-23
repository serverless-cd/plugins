import { lodash as _, Logger, fs } from '@serverless-cd/core';
import execa from 'execa';
import path from 'path'; 

export interface IProps {
  resource?: string; // Specify a resource in s.yaml. Use the command to s xxx deploy.
  deployFile?: string; // Specific yaml file. Use the command to s deploy -t xxx 
  deployArgs?: string[]; // Specific custom args. Merge with other command args during deployment.
  envName?: string; // Specify envionment. Use the command to s deploy --env
  debugMode?: boolean; // Use the command to s deploy --debug
  workspace: string // worksapce dir.
}

class Deploy {
  private logger: Logger;
  private props: IProps;
  constructor(props: IProps, logger: Logger) {
    this.logger = (logger || console) as Logger;
    this.props = props
  }

  async run() {
    const { resource, deployFile, deployArgs, envName, debugMode, workspace } = this.props;
   
    const cmd = resource ? `s ${resource} deploy` : 's deploy';
    let args = ['--use-local', '--assume-yes', '--skip-push'];

    if (envName) {
      args.push(`--env ${envName}`);
    }
  
    if (deployFile) {
      const manifest = path.resolve(workspace, deployFile);
      if (!fs.existsSync(manifest)) {
        throw new Error(`The deploy manifest [${manifest}] does not exist`)
      }
      args.push(`-t ${deployFile}`)
    }

    if (debugMode) {
      args.push('--debug');
    }

    if (Array.isArray(deployArgs)) {
      args = args.concat(deployArgs)
    }
  
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
}

export default Deploy;

