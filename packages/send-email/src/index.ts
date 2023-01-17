import { lodash, Logger, getInputs } from '@serverless-cd/core';
import emailService from './email-service';

const { get } = lodash;

export const run = async (
  inputs: Record<string, any>,
  context: Record<string, any>,
  logger: Logger,
) => {
  logger.info('start send-email');
  logger.info(`inputs: ${JSON.stringify(inputs)}`);
  const newInputs = getInputs(inputs, context);
  await emailService(newInputs, context);
  console.log(`newInputs: ${JSON.stringify(newInputs)}`);
  console.log(`context: ${JSON.stringify(context)}`);
  return { status: 'success', data: { name: get(inputs, 'name'), age: get(inputs, 'age') } };
};

export default emailService;
