import dayjs from 'dayjs';
import http from 'ky';
import { findLast, isUndefined, range } from 'lodash';

export default async function loadDataset<T>(path: string, depth = 60): Promise<T[]> {
  let dataset: T[] = [];

  for (let i = 0; i < depth; i += 10) {
    const series = await Promise.all(range(i, Math.min(depth, i + 10)).map(async (i) => {
      const time = dayjs().subtract(i + 1, 'days').format('YYYY-MM-DD');
      try {
        return await http.get(`./data/${path}/${time}.json`).json<T>();
      } catch (e) {
        return undefined;
      }
    }));

    dataset = [...dataset, ...series.filter((t) => !isUndefined(t)) as Awaited<T>[]];

    if (findLast(series, isUndefined) && dataset.length > 0) {
      break;
    }
  }

  return dataset.reverse();
}
