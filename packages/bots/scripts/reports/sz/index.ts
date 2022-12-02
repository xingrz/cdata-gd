import { join, resolve } from 'path';
import fs from 'fs-extra';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { stringify } from 'yaml';

import { geocode } from '../../common/qqlbs';
import fetchElement from '../../common/fetchElement';
import { loadStreets, saveStreets } from '../../common/streets';
import { fetchIndex } from './fetcher';
import { parseReport } from './parser';

import { IReport } from '@cdata/common/types/report';

dayjs.extend(customParseFormat);

const MAX_FETCH = 100;

const dataDir = resolve('..', '..', 'data');
const reportsDir = join(dataDir, 'reports', '深圳');
await fs.ensureDir(reportsDir);

const streetsToResolve: Record<string, boolean> = {};

console.log('正在抓取目录…');
for (const item of (await fetchIndex()).slice(0, MAX_FETCH)) {
  try {
    const publishTime = (() => {
      const match = item.title.match(/(\d{4})年(\d+)月(\d+)日深圳市新冠肺炎疫情情况/);
      if (match) {
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }
    })();

    if (!publishTime) continue;

    const time = dayjs(publishTime, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD');

    const file = join(reportsDir, `${time}.yml`);
    if (await fs.pathExists(file)) {
      break;
    }

    console.log(`正在抓取 ${item.title}…`);
    const article = await fetchElement(item.url, '.news_cont_d_wrap p');

    const data = parseReport(article);
    for (const items of Object.values(data)) {
      for (const { street } of items) {
        if (street != '管控范围') {
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
    break;
  }
}

const streets = await loadStreets('深圳');

for (const name of Object.keys(streetsToResolve)) {
  if (streets[name]) continue;
  console.log(`正在定位 ${name}…`);
  const address = `深圳市${name}`;
  const location = await geocode(address);
  if (location) {
    streets[name] = location;
  } else {
    console.log(`找不到 ${name}`);
  }
}

await saveStreets('深圳', streets);
