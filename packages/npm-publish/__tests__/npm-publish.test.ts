import path from 'path';
import fs from 'fs';
import Engine from '@serverless-cd/engine';
import { lodash } from '@serverless-cd/core';

require('dotenv').config({ path: path.join(__dirname, '.env') });
const logPrefix = path.join(__dirname, 'logs');
const { get } = lodash;

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

describe('orm', () => {
  beforeAll(() => {
    try {
      removeDir(logPrefix);
    } catch (err) {}
  });

  test('run方法是否执行成功', async () => {
    const steps = [
      {
        uses: path.join(__dirname, '..', 'src'),
        inputs: { name: 'xiaoming', age: 20, a: '${{env.msg}}', b: '${{secrets.msg}}' },
        env: { msg: 'this is a env test' },
        id: 'cdn-cache',
      },
      { run: 'echo "hello world"' },
    ];
    const engine = new Engine({
      steps,
      logConfig: { logPrefix },
      inputs: { secrets: { msg: 'this is a secrets test' } },
    });
    const context = await engine.start();
    expect(get(context, 'status')).toBe('success');
  });
});
