import { lodash as _, Logger, getInputs } from '@serverless-cd/core';
import runtimeSetup, { IProps } from './runtime-setup';

const getCacheInputs = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger): Promise<IProps> => {
  logger.debug(`context: ${JSON.stringify(context)}`);
  logger.debug(`inputs: ${JSON.stringify(inputs)}`);
  const newInputs = getInputs(inputs, context) as Record<string, any>;
  logger.debug(`newInputs: ${JSON.stringify(newInputs)}`);

  return { runtime: newInputs.runtime };
}

export const run = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
  logger.info('start @serverless-cd/runtime-setup run');
  const props = await getCacheInputs(inputs, context, logger);
  await runtimeSetup(props, logger);
  logger.info('Run @serverless-cd/runtime-setup end');
};

export default runtimeSetup;
