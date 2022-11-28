import { Logger, getInputs } from '@serverless-cd/core';
import Publish, { IProps } from './publish';
import os from 'os';

export const run = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
  logger.info('start npm-publish');
  logger.info(`inputs: ${JSON.stringify(inputs)}`);
  const newInputs = getInputs(inputs, context) as unknown as IProps;
  logger.info(`newInputs: ${JSON.stringify(newInputs)}`);
  logger.info(`newInputs: ${JSON.stringify(context)}`);
  const publish = new Publish(newInputs, logger);
  await publish.run(context.cwd || process.env.DOWNLOAD_CODE_DIR || os.tmpdir());
  logger.info('end npm-publish');
};

export default Publish;
