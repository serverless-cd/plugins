module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  roots: ['<rootDir>/packages'],
  testEnvironment: 'node',
  testMatch: [
    '/Users/shihuali/workspace/serverless-cd/plugins/packages/ding-talk/__tests__/yaml/ding-talk-with-yaml.test.ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
};
