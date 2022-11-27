import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { first, last } from 'lodash-es';

dayjs.extend(customParseFormat);

export function dayOf(name: string): Dayjs {
  return dayjs(name, 'YYYY-MM-DD');
}

interface ITimedItem {
  time: string;
}

type ITimedDataset = ITimedItem[];

export function startOf(dataset: ITimedDataset): Dayjs {
  return dayOf(first(dataset)!.time).startOf('day');
}

export function endOf(dataset: ITimedDataset): Dayjs {
  return dayOf(last(dataset)!.time).endOf('day');
}

export function isUnavailable(dataset: ITimedDataset | null, date: Dayjs): boolean {
  if (!dataset?.length) return true;
  return date < startOf(dataset) || date > endOf(dataset);
}

export function recent(dataset: ITimedDataset | null, days: number): [Dayjs, Dayjs] | undefined {
  if (!dataset?.length) return;
  const end = endOf(dataset);
  const head = startOf(dataset);
  const start = end.subtract(days - 1, 'days').startOf('day');
  return [start < head ? head : start, end];
}

export function withIn(item: ITimedItem, range: [Dayjs, Dayjs] | undefined): boolean {
  if (!range) return true;
  const [start, end] = range;
  const current = dayOf(item.time);
  return current >= start && current <= end;
}
