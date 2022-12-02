import { join, resolve } from 'path';
import fs from 'fs-extra';
import { stringify } from 'yaml';

import { geocode } from '../../common/qqlbs';
import fetchElement from '../../common/fetchElement';
import { loadStreets, saveStreets } from '../../common/streets';
import { fetchIndex } from './fetcher';
import { parseReport } from './parser';

import { IReport } from '@cdata/common/types/report';

const MAX_FETCH = 30;

const dataDir = resolve('..', '..', 'data');
const reportsDir = join(dataDir, 'reports', '广州');
await fs.ensureDir(reportsDir);

const streetsToResolve: Record<string, boolean> = {};

console.log('正在抓取目录…');
for (const item of (await fetchIndex()).slice(0, MAX_FETCH)) {
  try {
    const time = (() => {
      const match = item.title.match(/(\d{4})年(\d+)月(\d+)日广州市新冠肺炎疫情情况/);
      if (match) {
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }
    })();

    if (!time) continue;

    const file = join(reportsDir, `${time}.yml`);
    if (await fs.pathExists(file)) {
      break;
    }

    console.log(`正在抓取 ${item.title}…`);
    const article = await fetchElement(item.url, '[wzades="正文"] p');

    const data = parseReport(article);
    for (const items of Object.values(data)) {
      for (const { street } of items) {
        if (street != '集中隔离场所') {
          streetsToResolve[street] = true;
        }
      }
    }

    await fs.outputFile(file, stringify(<IReport>{
      time, data, ref: item.url,
    }, { collectionStyle: 'flow' }));
    console.log(`新数据: ${time}`);
  } catch (e) {
    console.log(`解析异常: ${e}`);
  }
}

const streets = await loadStreets('广州');

for (const name of Object.keys(streetsToResolve)) {
  if (streets[name]) continue;
  console.log(`正在定位 ${name}…`);
  const address = name.endsWith('镇') ? `广州市${name}政府` : `广州市${name}办事处`;
  const location = await geocode(address);
  if (location) {
    streets[name] = location;
  } else {
    console.log(`找不到 ${name}`);
  }
}

await saveStreets('广州', streets);
