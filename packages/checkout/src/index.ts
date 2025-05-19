import { Logger, getInputs, lodash } from '@serverless-cd/core';
import { stringify } from './utils';
import Checkout from './checkout';
import { IConfig, ICredentials } from './types';
import checkoutForAppCenter from './checkout-for-appcenter';
const debug = require('@serverless-cd/debug')('serverless-cd:checkout');

const { assign, get } = lodash;

export default async function checkout(config: IConfig) {
  await new Checkout(config).run();
}

export async function run(
  inputs: Record<string, any>,
  context: Record<string, any>,
  logger: Logger,
) {
  logger.info('Start checkout plugin');
  debug(`inputs: ${stringify(inputs)}`);
  const newInputs = getInputs(inputs, context);
  debug(`getInputs: ${stringify(newInputs)}`);

  const ctx = get(context, 'inputs.ctx.data.checkout') || get(newInputs, 'ctx.data.checkout');
  debug(`appcenter checkout: ${stringify(ctx)}`);
  const newConfig = assign(
    {},
    {
      ...ctx,
      ...get(context, 'inputs.git'),
      logger,
    },
    newInputs,
  );
  debug(`newInputs: ${stringify(newConfig)}`);
  debug(ctx ? 'appcenter checkout' : 'engine checkout');

  const credentials: ICredentials = get(context, 'inputs.sts');
  const region = get(ctx, 'ossRegion') || get(context, 'inputs.scheduleRegion');
  ctx
    ? await checkoutForAppCenter({
        ...newConfig,
        execDir: get(newConfig, 'execDir', get(context, 'cwd')),
      }, credentials, region)
    : await new Checkout(newConfig).run();
  logger.info('End checkout plugin');
}
