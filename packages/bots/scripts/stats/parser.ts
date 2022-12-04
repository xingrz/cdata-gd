import { IIncreaseType, IIncreaseTypes, IStats } from '@cdata/common/types/stats';

export function parseStats(input: string): IStats {
  const result: Partial<IStats> = {};
  const data: Partial<IStats['data']> = {};

  const publish = input.match(/(\d{4})年(\d+)月(\d+)日/m);
  if (!publish) throw new Error('无法解析发布日期');

  let year = parseInt(publish[1]);
  if (publish[2] == '1' && publish[3] == '1') {
    year -= 1;
  }

  const time = input.match(/(\d+)月(\d+)日0\-24时/m);
  if (!time) throw new Error('无法解析统计日期');
  result.time = `${year}-${time[1].padStart(2, '0')}-${time[2].padStart(2, '0')}`;

  const matches = input.matchAll(/(新增[^\d]+)(\d+)例（([^）]+)）/g);
  for (const match of matches) {
    const [_, type, total, details] = match;
    if (type in IIncreaseTypes) {
      const cities: Record<string, number> = {};

      let sum = 0;
      for (const piece of details.split(/，|、|,/)) {
        const city = piece.match(/^([^\d]+)(\d+)/);
        if (city) {
          const name = city[1].trim();
          cities[name] = parseInt(city[2]);
          sum += cities[name];
        }
      }

      if (sum != parseInt(total)) {
        throw new Error(`${type}的总数不一致`);
      }

      data[type as IIncreaseType] = cities;
    }
  }

  result.data = data as IStats['data'];
  return result as IStats;
}
