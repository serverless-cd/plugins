import path from 'path';
import fs from 'fs';
import Engine from '@serverless-cd/engine';
import { lodash } from '@serverless-cd/core';

require('dotenv').config({ path: path.join(__dirname, '.env') });

const logPrefix = path.join(__dirname, 'logs');
const { get } = lodash;

describe('orm', () => {
  beforeAll(() => {
    try {
      removeDir(logPrefix);
    } catch (err) {}
  });

  test('token', async () => {
    const steps = [
      {
        uses: path.join(__dirname, '..', 'src'),
        inputs: {
          registry: '//registry.npmjs.org',
          token: '${{ secrets.npm_token }}',
          codeDir: './mock/package'
        },
        id: 'test',
      },
      // { run: 'echo success', if: '${{ steps.test.output.status === "success" }}' },
    ];
    const engine = new Engine({
      cwd: path.join(__dirname, 'mock', 'packages'),
      steps,
      logConfig: { logPrefix },
      inputs: { secrets: { npm_token: process.env.npm_token } },
    });
    await engine.start();
  });
});


function removeDir(dir: string) {
  let files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      //如果是文件夹就递归下去
      removeDir(newPath);
    } else {
      fs.unlinkSync(newPath); //删除文件
    }
  }
  fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
}
