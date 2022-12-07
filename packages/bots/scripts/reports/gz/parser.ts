import { range } from 'lodash-es';
import { IReportData, IReportItem } from '@cdata/common/types/report';

export function parseReport(input: string): IReportData {
  const data: IReportData = {
    '本土确诊病例': [],
    '本土无症状感染者': [],
  };

  const total = input.match(/新增(\d+)例本土确诊病例和(\d+)例本土无症状感染者情况：/);
  if (!total) throw new Error('无法解析总数');
  const t1 = parseInt(total[1]);
  const t2 = parseInt(total[2]);

  let type: keyof IReportData | undefined;
  for (const line of input.split('\n')) {
    let match: RegExpMatchArray | null;
    if (match = line.match(/本土确诊病例([\d\-、\s]+).*居住在([^。，\s]+)/)) {
      type = '本土确诊病例';
      const ids = expand(match[1])
      push(data['本土确诊病例'], 'street', match[2], ids);
      if (match = line.match(/在([^。，]+?)(中)?发现/)) {
        push(data['本土确诊病例'], 'source', match[1], ids);
      }
    } else if (match = line.match(/上述(确诊)?病例([\d\-、\s]+).*?(在)?([^。，]+?)(中)?发现/)) {
      // 2022-11-22 该表述未区分，故需要有状态
      if (type == '本土无症状感染者') {
        push(data['本土无症状感染者'], 'source', match[4], expand(match[2]));
      } else {
        push(data['本土确诊病例'], 'source', match[4], expand(match[2]));
      }
    } else if (match = line.match(/本土确诊病例([\d\-、\s]+).*在(集中隔离场所[^。，]+?)(中)?发现/)) {
      type = '本土确诊病例';
      const ids = expand(match[1]);
      push(data['本土确诊病例'], 'street', '集中隔离场所', ids);
      push(data['本土确诊病例'], 'source', match[2], ids);
    } else if (match = line.match(/本土无症状感染者([\d\-、\s]+).*居住在([^。，\s]+)/)) {
      type = '本土无症状感染者';
      const ids = expand(match[1])
      push(data['本土无症状感染者'], 'street', match[2], ids);
      if (match = line.match(/在([^。，]+?)(中)?发现/)) {
        push(data['本土无症状感染者'], 'source', match[1], ids);
      }
    } else if (match = line.match(/上述无症状感染者([\d\-、\s]+).*?(在)?([^。，]+?)(中)?发现/)) {
      type = '本土无症状感染者';
      push(data['本土无症状感染者'], 'source', match[3], expand(match[1]));
    } else if (match = line.match(/本土无症状感染者([\d\-、\s]+).*在(集中隔离场所[^。，]+?)(中)?发现/)) {
      type = '本土无症状感染者';
      const ids = expand(match[1]);
      push(data['本土无症状感染者'], 'street', '集中隔离场所', ids);
      push(data['本土无症状感染者'], 'source', match[2], ids);
    }
  }

  if (t1 != data['本土确诊病例'].length) {
    throw new Error(`本土确诊病例数 ${data['本土确诊病例'].length} 与总数 ${t1} 不一致`);
  }
  for (let i = 0; i < t1; i++) {
    if (!data['本土确诊病例'][i]) {
      throw new Error(`本土确诊病例${i + 1}为空`);
    } else if (!data['本土确诊病例'][i].street) {
      throw new Error(`本土确诊病例${i + 1}街道为空`);
    } else if (!data['本土确诊病例'][i].source) {
      throw new Error(`本土确诊病例${i + 1}来源为空`);
    }
  }
  if (t2 != data['本土无症状感染者'].length) {
    throw new Error(`本土无症状感染者数 ${data['本土无症状感染者'].length} 与总数 ${t2} 不一致`);
  }
  for (let i = 0; i < t2; i++) {
    if (!data['本土无症状感染者'][i]) {
      throw new Error(`本土无症状感染者${i + 1}为空`);
    } else if (!data['本土无症状感染者'][i].street) {
      throw new Error(`本土无症状感染者${i + 1}街道为空`);
    } else if (!data['本土无症状感染者'][i].source) {
      throw new Error(`本土无症状感染者${i + 1}来源为空`);
    }
  }

  return data;
}

function expand(str: string): number[] {
  let match: RegExpMatchArray | null;
  if (match = str.match(/^\d+$/)) {
    return [parseInt(str)];
  } else if (match = str.match(/^(\d+)[^\d]+(\d+)$/)) {
    const id1 = parseInt(match[1]);
    const id2 = parseInt(match[2]);
    return range(id1, id2 + 1);
  } else {
    return [];
  }
}

function push(section: IReportItem[], key: keyof IReportItem, type: string, ids: number[]): void {
  for (const id of ids) {
    if (!section[id - 1]) section[id - 1] = { street: '', source: '' };
    section[id - 1][key] = type;
  }
}
