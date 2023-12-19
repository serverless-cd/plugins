import { lodash as _, Logger, getInputs } from '@serverless-cd/core';
import setup, { IProps } from './deploy';
import Deploy from './deploy';

const getPluginInputs = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger): Promise<IProps> => {
  logger.debug(`context: ${JSON.stringify(context)}`);
  logger.debug(`original inputs: ${JSON.stringify(inputs)}`);
  const newInputs = _.assign(getInputs(inputs, context) as Record<string, any>, {
    deployFile: _.get(context, 'inputs.context.data.deployFile'),
    envName: _.get(context, 'inputs.context.data.envName'),
    infraStackName: _.get(context, 'inputs.context.data.infraStackName')
  });
  logger.debug(`merged inputs: ${JSON.stringify(newInputs)}`);
  return {
    deployFile: _.get(newInputs, 'deployFile'),
    deployArgs: _.get(newInputs, 'deployArgs'),
    envName: _.get(newInputs, 'envName'),
    infraStackName: _.get(newInputs, 'infraStackName'),
    resource: _.get(newInputs, 'resource'),
    debugMode: _.get(newInputs, 'debugMode') ||  _.get(context, 'inputs.ctx.data.runnerConfig.debugMode'),
    workspace: _.get(context, 'cwd'),
  };
}

export const run = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
  logger.info('start @serverless-cd/s-deploy run');
  const props = await getPluginInputs(inputs, context, logger);
  const deploy = new Deploy(props as IProps, logger);
  const res = await deploy.run();
  logger.info('Run @serverless-cd/s-deploy end');
};

export default setup;
