import { basename, join } from 'path';
import { readdir, readFile } from 'fs-extra';
import { parse } from 'yaml';

import parseStats from '../src/parsers/parseStats';

test('parseStats', async () => {
  const fixturesDir = join(__dirname, 'fixtures', 'stats');
  const fixtures = await readdir(fixturesDir);
  for (const file of fixtures) {
    if (!file.endsWith('.txt')) continue;

    const fixture = join(fixturesDir, basename(file, '.txt'));

    const raw = await readFile(`${fixture}.txt`, 'utf-8');
    const exp = parse(await readFile(`${fixture}.yml`, 'utf-8'));
    const act = parseStats(raw);

    expect(act).toEqual(exp);
  }
});
