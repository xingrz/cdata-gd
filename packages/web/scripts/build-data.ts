import { basename, join, resolve } from 'path';
import fs from 'fs-extra';
import { parse } from 'yaml';

const inputDir = resolve('..', '..', 'data');
const outputDir = resolve('public', 'data');

// TODO: Merge
console.log(`Building stats data files…`);
for (const file of await fs.readdir(join(inputDir, 'stats'))) {
  if (!file.endsWith('.yml')) continue;
  console.log(`- ${file}`);
  const name = basename(file, '.yml');
  const data = parse(await fs.readFile(join(inputDir, 'stats', file), 'utf-8'));
  await fs.outputJson(join(outputDir, 'stats', `${name}.json`), data);
}

for (const city of await fs.readdir(join(inputDir, 'reports'))) {
  console.log(`Building report data files of ${city}…`);
  for (const file of await fs.readdir(join(inputDir, 'reports', city))) {
    if (!file.endsWith('.yml')) continue;
    console.log(`- ${file}`);
    const name = basename(file, '.yml');
    const data = parse(await fs.readFile(join(inputDir, 'reports', city, file), 'utf-8'));
    await fs.outputJson(join(outputDir, 'reports', city, `${name}.json`), data);
  }
}

console.log(`Building streets files…`);
for (const file of await fs.readdir(join(inputDir, 'streets'))) {
  if (!file.endsWith('.yml')) continue;
  console.log(`- ${file}`);
  const name = basename(file, '.yml');
  const data = parse(await fs.readFile(join(inputDir, 'streets', file), 'utf-8'));
  await fs.outputJson(join(outputDir, 'streets', `${name}.json`), data);
}
