import { join, resolve } from 'path';
import fs from 'fs-extra';
import { stringify } from 'yaml';
import { CookieJar } from 'tough-cookie';

import { fetchLongText, fetchWeibo, genVisitor } from './fetchers/weibo';
import parseStats from './parsers/parseStats';

const statsDir = resolve('..', '..', 'data', 'stats');
await fs.ensureDir(statsDir);

const cookieJar = new CookieJar();
await genVisitor(cookieJar);

fetch: for (let page = 1; page <= 5; page++) {
  console.log(`正在抓取第 ${page} 页…`);
  const weibos = await fetchWeibo(cookieJar, '1962787713', page);
  for (const weibo of weibos) {
    try {
      const ref = `https://weibo.com/${weibo.user.idstr}/${weibo.mblogid}`;
      if (!weibo.text_raw.includes('广东省新冠肺炎疫情情况')) {
        continue;
      }

      const text = await fetchLongText(cookieJar, weibo.idstr);

      const stats = parseStats(text);

      const file = join(statsDir, `${stats.time}.yml`);
      if (await fs.pathExists(file)) {
        break fetch;
      }

      console.log(`新数据: ${stats.time}`);

      await fs.outputFile(file, stringify({ ...stats, ref }));
    } catch (e) {
      console.log(`解析异常: ${e}`);
    }
  }
}
