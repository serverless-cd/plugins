import {lodash as _, Logger, getInputs, getStepContext, getCredentials} from '@serverless-cd/core';
import Joi from 'joi';
import FcCanary, {IProps} from './canary';


interface ISchemaError {
    error: Error;
}

const getCanaryInputs = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger): Promise<IProps | ISchemaError> => {
    const newInputs = getInputs(inputs, context) as Record<string, any>;
    logger.debug(`merged inputs: ${JSON.stringify(newInputs)}`);

    const Schema = Joi.object({
        serviceName: Joi.string().required(),
        aliasName: Joi.string().required(),
        regionId: Joi.string().required(),
        canaryPercent: Joi.number().max(100).min(0).required(),
        access: Joi.string(),
    });

    const {error} = Schema.validate(newInputs, {abortEarly: false, convert: true, allowUnknown: true});
    if (error) {
        logger.error(`illegal inputs: ${error}`)
        logger.debug(`error: errorName=[${error.name}], errorMessage=[${error.message}], errorDetails=[${error.details}]`);
        return {error};
    }


    const workerRunRegion = _.get(context, 'inputs.workerRunConfig.region');
    const region = _.get(newInputs, 'region', workerRunRegion);

    return {
        serviceName: _.get(newInputs, 'serviceName', ''),
        aliasName: _.get(newInputs, 'aliasName', ''),
        regionId: _.get(newInputs, 'regionId', ''),
        canaryPercent: _.get(newInputs, 'canaryPercent', 10),
        access: _.get(newInputs, 'access', 'default'),
        debugMode: _.get(newInputs, 'ctx.data.runnerConfig.debugMode', false)
    };
}

export const run = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
    logger.info('start @serverless-cd/fc-canary run');
    const props = await getCanaryInputs(inputs, context, logger);
    if ((props as ISchemaError).error) {
        const error = _.get(props, 'error') as unknown as Error;
        logger.warn(`The input information is wrong: ${error.message}`);
        return {};
    }
    const fcCanary = new FcCanary(props as IProps, logger);
    const res = fcCanary.run();
    if (res.error) {
        throw res.error
    }
    logger.info('Run @serverless-cd/fc-canary end');
    return res;
};


export default FcCanary;
