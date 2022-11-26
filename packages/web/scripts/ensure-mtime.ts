import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import toDay from '../src/utils/toDay';

const distDir = resolve('dist', 'data');

for (const file of await fs.readdir(join(distDir, 'stats'))) {
  const name = basename(file, '.json');
  const time = toDay(name).add(1, 'day').toDate();
  await fs.utimes(join(distDir, 'stats', file), time, time);
}

for (const file of await fs.readdir(join(distDir, 'reports'))) {
  const name = basename(file, '.json');
  const time = toDay(name).add(1, 'day').toDate();
  await fs.utimes(join(distDir, 'reports', file), time, time);
}
