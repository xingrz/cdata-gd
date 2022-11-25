import { DateTime } from 'luxon';
import http from 'ky';

export default async function loadDataset<T>(path: string, depth = 60): Promise<T[]> {
  const dataset: T[] = [];

  const now = DateTime.now();
  for (let i = 0; i < depth; i++) {
    const time = now.minus({ days: i }).toFormat('yyyy-MM-dd');
    try {
      const data = await http.get(`./data/${path}/${time}.json`).json<T>();
      dataset.unshift(data);
    } catch (e) {
      if (dataset.length > 0) {
        break;
      }
    }
  }

  return dataset;
}
