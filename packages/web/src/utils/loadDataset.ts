import dayjs from 'dayjs';
import http from 'ky';

export default async function loadDataset<T>(path: string, depth = 60): Promise<T[]> {
  const dataset: T[] = [];

  for (let i = 0; i < depth; i++) {
    const time = dayjs().subtract(i + 1, 'days').format('YYYY-MM-DD');
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
