import { join, resolve } from 'path';
import fs from 'fs-extra';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { parse, stringify } from 'yaml';
import _ from 'lodash';

import { geocode } from '../../common/qqlbs';
import { getFile, getFileList, singleFileDownload } from './fetcher';

import { IReport, IReportItem } from '@cdata/common/types/report';
import { groupBy } from 'lodash-es';
import { ILocation } from '@cdata/common/types/location';

dayjs.extend(customParseFormat);

const RES_ID = '29200/05800007';
const REF_URL = 'https://opendata.sz.gov.cn/data/dataSet/toDataDetails/29200_05800007';

const dataDir = resolve('..', '..', 'data');
await fs.ensureDir(dataDir);

const reportsDir = join(dataDir, 'reports', '深圳');
await fs.ensureDir(reportsDir);

const streetsDir = join(dataDir, 'streets');
await fs.ensureDir(streetsDir);

const streetsToResolve: Record<string, boolean> = {};

console.log('正在获取文件列表…');

const files = await getFileList(RES_ID);
if (files.length != 1) {
  throw new Error('获取文件列表失败');
}

console.log('正在下载数据…');

const fileUrl = await singleFileDownload(RES_ID, files[0].id);
if (!fileUrl) {
  throw new Error('获取文件地址失败');
}

const items = await getFile(fileUrl);
console.log(`获得 ${items.length} 条数据`);

const beginDate = dayjs('2022-11-01', 'YYYY-MM-DD');

const filtered = items.filter((item) => {
  if (item.JZQ == 'NULL' || item.JZJD == 'NULL') {
    return false;
  }

  const date = dayjs(item.RQ, 'YYYY-MM-DD');
  if (date <= beginDate) {
    return false;
  }

  return true;
});

console.log(`过滤出 ${filtered.length} 条数据`);

const grouped = groupBy(filtered, (item) => item.RQ);
for (const date of Object.keys(grouped)) {
  const file = join(reportsDir, `${date}.yml`);
  if (await fs.pathExists(file)) {
    continue;
  }

  const items = grouped[date].map((item) => {
    const source = item.FXTJ.match(/([^在，。]+)中发现/);
    if (!source) {
      throw new Error(`序号 ${item.XH} 的发现途径无法解析: ${item.FXTJ}`);
    }

    const street = `${item.JZQ}${item.JZJD}`;
    streetsToResolve[street] = true;

    return <IReportItem>{
      street: street,
      source: source[1],
    };
  });

  await fs.outputFile(file, stringify(<IReport>{
    time: date,
    data: { '本土病例': items },
    ref: REF_URL,
  }, { collectionStyle: 'flow' }));
  console.log(`新数据: ${date}`);
}

const streetsFile = join(streetsDir, '深圳.yml');
const streets: Record<string, ILocation> = await fs.pathExists(streetsFile)
  ? parse(await fs.readFile(streetsFile, 'utf-8'))
  : {};

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

const sorted = _(streets).toPairs().sortBy(0).fromPairs().value();
await fs.outputFile(streetsFile, stringify(sorted));
