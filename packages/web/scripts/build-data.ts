import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import { parse } from 'yaml';

const inputDir = resolve('..', '..', 'data');
const outputDir = resolve('public', 'data');

// TODO: Merge
for (const file of await fs.readdir(join(inputDir, 'stats'))) {
  if (!file.endsWith('.yml')) continue;
  console.log(`Building stats data file ${file}`);
  const name = basename(file, '.yml');
  const data = parse(await fs.readFile(join(inputDir, 'stats', file), 'utf-8'));
  await fs.outputJson(join(outputDir, 'stats', `${name}.json`), data);
}

for (const file of await fs.readdir(join(inputDir, 'reports'))) {
  if (!file.endsWith('.yml')) continue;
  console.log(`Building report data file ${file}`);
  const name = basename(file, '.yml');
  const data = parse(await fs.readFile(join(inputDir, 'reports', file), 'utf-8'));
  await fs.outputJson(join(outputDir, 'reports', `${name}.json`), data);
}

console.log(`Building streets file`);
const streets = parse(await fs.readFile(join(inputDir, 'streets.yml'), 'utf-8'));
await fs.outputJson(join(outputDir, 'streets.json'), streets);
