import { join, resolve } from 'path';
import fs from 'fs-extra';
import { parse, stringify } from 'yaml';
import _ from 'lodash';

import { ILocation } from '@cdata/common/types/location';

const dataDir = resolve('..', '..', 'data');
const streetsDir = join(dataDir, 'streets');
await fs.ensureDir(streetsDir);

type StreetDB = Record<string, ILocation>;

export async function loadStreets(city: string): Promise<StreetDB> {
  const streetsFile = join(streetsDir, `${city}.yml`);
  return await fs.pathExists(streetsFile)
    ? parse(await fs.readFile(streetsFile, 'utf-8'))
    : {};
}

export async function saveStreets(city: string, streets: StreetDB): Promise<void> {
  const streetsFile = join(streetsDir, `${city}.yml`);
  const sorted = _(streets).toPairs().sortBy(0).fromPairs().value();
  await fs.outputFile(streetsFile, stringify(sorted));
}
