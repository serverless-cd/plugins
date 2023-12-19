import Deploy from '../src/deploy';
import { Logger } from '@serverless-cd/core';
import path from 'path';
import _ from 'lodash';

const mock_dir = path.join(__dirname, 'mock/start-fc');

describe('generateDeployCommand', () => {
  it('should return correct cmd and args when resource, deployFile, manifest, envName, debugMode are present and isDevsV3 returns true', async () => {
    const props = {
      resource: 'resource',
      deployFile: 's3.yaml',
      envName: 'envTest',
      infraStackName: 'infraStackTest',
      debugMode: true,
      workspace: mock_dir,
      deployArgs: ['arg1', 'arg2']
    };
    const instance = new Deploy(props, new Logger({}));
    const result = await instance.generateDeployCommand();

    expect(result.cmd).toBe(`s ${props.resource} deploy`);
    expect(result.args).toEqual(['--use-local', '--assume-yes', '--skip-push', `-t ${props.deployFile}`, `--env ${props.envName}`, '--debug', ...props.deployArgs]);
  });

  it('should return correct cmd and args when resource, deployFile are absent, envName and infraStackName are present and isDevsV3 returns false', async () => {
    const props = {
      envName: 'envName',
      infraStackName: 'infraStackName',
      debugMode: true,
      workspace: mock_dir,
      deployArgs: ['arg1', 'arg2']
    };
    const instance = new Deploy(props, new Logger({}));
    const result = await instance.generateDeployCommand();

    expect(result.cmd).toBe('s deploy');
    expect(result.args).toEqual(['--use-local', '--assume-yes', '--skip-push', `--env ${props.infraStackName}`, '--debug', ...props.deployArgs]);
  });

  it('should throw an error when deployFile exists but manifest does not exist', async () => {
    const props = {
      deployFile: 's.yaml',
      workspace: 'workspace',
    };
    const manifest = path.resolve(props.workspace, props.deployFile);
    const instance = new Deploy(props, new Logger({}));
    await expect(instance.generateDeployCommand()).rejects.toThrow(`The deploy manifest [${manifest}] does not exist`);
  });
});