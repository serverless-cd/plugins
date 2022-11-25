import { lodash, Logger, getInputs } from '@serverless-cd/core';
const { get } = lodash;

export const run = (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
  logger.info('start npm-publish');
  logger.info(`inputs: ${JSON.stringify(inputs)}`);
  const newInputs = getInputs(inputs, context);
  logger.info(`newInputs: ${JSON.stringify(newInputs)}`);
  logger.info(`context: ${JSON.stringify(context)}`);
  return { status: 'success', data: { name: get(inputs, 'name'), age: get(inputs, 'age') } };
};

// export default service;
