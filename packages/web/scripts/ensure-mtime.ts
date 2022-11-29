import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import { dayOf } from '../src/utils/day';

const distDir = resolve('dist', 'data');

for (const file of await fs.readdir(join(distDir, 'stats'))) {
  const name = basename(file, '.json');
  const time = dayOf(name).add(1, 'day').toDate();
  await fs.utimes(join(distDir, 'stats', file), time, time);
}

for (const city of await fs.readdir(join(distDir, 'reports'))) {
  for (const file of await fs.readdir(join(distDir, 'reports', city))) {
    const name = basename(file, '.json');
    const time = dayOf(name).add(1, 'day').toDate();
    await fs.utimes(join(distDir, 'reports', city, file), time, time);
  }
}
