import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import { parse } from 'yaml';

const inputDir = resolve('..', '..', 'data', 'stats');
const outputDir = resolve('public', 'data', 'stats');

for (const file of await fs.readdir(inputDir)) {
  if (!file.endsWith('.yml')) continue;
  console.log(`Building data file ${file}`);
  const name = basename(file, '.yml');
  const data = parse(await fs.readFile(join(inputDir, file), 'utf-8'));
  await fs.outputJson(join(outputDir, `${name}.json`), data);
}
