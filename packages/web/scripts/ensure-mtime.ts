import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import toDay from '../src/utils/toDay';

const distDir = resolve('dist', 'data', 'stats');

for (const file of await fs.readdir(distDir)) {
  const name = basename(file, '.json');
  const time = toDay(name).add(1, 'day').toDate();
  await fs.utimes(join(distDir, file), time, time);
}
