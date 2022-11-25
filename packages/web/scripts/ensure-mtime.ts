import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import { DateTime } from 'luxon';

const distDir = resolve('dist', 'data', 'stats');

for (const file of await fs.readdir(distDir)) {
  const name = basename(file, '.json');
  const time = DateTime.fromFormat(name, 'yyyy-MM-dd').plus({ day: 1 }).toJSDate();
  await fs.utimes(join(distDir, file), time, time);
}
