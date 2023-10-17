import Engine from '@serverless-cd/engine';
import path from 'path';

require('dotenv').config({ path: path.join(__dirname, '.env') });
const logPrefix = path.join(__dirname, 'logs');
const plugin = path.join(__dirname, '..', 'src');
const mock_dir = path.join(__dirname, 'mock');

test('use template', async () => {
  const steps = [
    {
      plugin,
      inputs: {
        resource: 'helloworld',
        deployArgs: ['function', '--type code']
      },
    },
  ];
  const engine = new Engine({
    cwd: path.join(mock_dir, 'start-fc-http-nodejs14'),
    steps,
    logConfig: { logPrefix, logLevel: 'DEBUG' },
    inputs: {
      context: {
        data: {
          runnerConfig: {
            debugMode: false,
          },
          // deployFile: "s.yaml",
          // envDeploymentName: "test"
        },
      },
    },
  });
  const res = await engine.start();
  expect(res.status).toBe('success');
});
