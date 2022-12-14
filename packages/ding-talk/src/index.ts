import { Logger, getInputs } from '@serverless-cd/core';
import DingTalk, { IProps } from './ding-talk';

export const run = async (
  inputs: Record<string, any>,
  context: Record<string, any>,
  logger: Logger,
) => {
  logger.info('start ding-talk');
  logger.info(`inputs: ${JSON.stringify(inputs)}`);
  const newInputs = getInputs(inputs, context) as unknown as IProps;
  logger.info(`newInputs: ${JSON.stringify(newInputs)}`);
  logger.info(`context: ${JSON.stringify(context)}`);
  const dingTalk = new DingTalk(newInputs, context, logger);
  await dingTalk.send();
  return { status: 'success' };
};

export default DingTalk;
