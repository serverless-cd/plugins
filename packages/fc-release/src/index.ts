import { lodash as _, Logger, getInputs, getStepContext, getCredentials } from '@serverless-cd/core';
import Joi from 'joi';
import FcRelease , { IProps } from './release';


interface ISchemaError {
    error: Error;
}

const getReleaseInputs = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger): Promise<IProps | ISchemaError> => {
    const newInputs = getInputs(inputs, context) as Record<string, any>;
    logger.debug(`merged inputs: ${JSON.stringify(newInputs)}`);

    const Schema = Joi.object({
        serviceName: Joi.string().optional(),
        functionName: Joi.string().optional(),
        aliasName: Joi.string().required(),
        regionId: Joi.string().required(),
        access: Joi.string(),
    }).xor('serviceName', 'functionName');

    const { error } = Schema.validate(newInputs, { abortEarly: false, convert: true, allowUnknown: true });
    if (error) {
        logger.error(`illegal inputs: ${error}`)
        logger.debug(`error: errorName=[${error.name}], errorMessage=[${error.message}], errorDetails=[${error.details}]`);
        return { error };
    }


    const workerRunRegion = _.get(context, 'inputs.workerRunConfig.region');
    const region = _.get(newInputs, 'region', workerRunRegion);

    return {
        serviceName: _.get(newInputs, 'serviceName', ''),
        functionName: _.get(newInputs, 'functionName', ''),
        aliasName: _.get(newInputs, 'aliasName', ''),
        regionId: _.get(newInputs, 'regionId', ''),
        access: _.get(newInputs, 'access', 'default'),
        debugMode: _.get(newInputs, 'ctx.data.runnerConfig.debugMode', false)
};
}

export const run = async (inputs: Record<string, any>, context: Record<string, any>, logger: Logger) => {
    logger.info('start @serverless-cd/fc-release run');
    const props = await getReleaseInputs(inputs, context, logger);
    if ((props as ISchemaError).error) {
        const error = _.get(props, 'error') as unknown as Error;
        logger.warn(`The input information is wrong: ${error.message}`);
        return {};
    }
    const fcRelease = new FcRelease(props as IProps, logger);
    const res = fcRelease.run();
    if (res.error) {
        throw res.error
    }
    logger.info('Run @serverless-cd/fc-release end');
    return res;
};


export default FcRelease;
