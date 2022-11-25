import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default function toDay(name: string): Dayjs {
  return dayjs(name, 'YYYY-MM-DD').add(1, 'day');
}
