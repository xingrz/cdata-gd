import { range } from 'lodash-es';
import { IReportData, IReportItem } from '@cdata/common/types/report';

export function parseReport(input: string): IReportData {
  const data: IReportData = {
    '本土病例': [],
  };

  const section = data['本土病例'];

  const total = input.match(/新增(\d+)例新冠肺炎确诊病例和(\d+)例新冠病毒无症状感染者/);
  if (!total) throw new Error('无法解析总数');
  const totalNum = parseInt(total[1]) + parseInt(total[2]);

  let ids: number[] = [];
  for (const line of input.split('\n')) {
    let match: RegExpMatchArray | null;
    if (match = line.match(/病例([\d\-、\s]+)/)) {
      ids = expand(match[1]);
    }

    if (match = line.match(/为(.+人员)/)) {
      push(section, 'street', '管控范围', ids);
    } else if (match = line.match(/住在([^。，\s]+?街(道)?)/)) {
      // 规避 2022-11-24 报告
      if (match[1].endsWith('街')) {
        match[1] += '道';
      }
      push(section, 'street', match[1], ids);
    }

    if (match = line.match(/在([^。，\s]+)中发现/)) {
      push(section, 'source', match[1], ids);
    }
  }

  if (totalNum != section.length) {
    throw new Error(`病例数 ${section.length} 与总数 ${totalNum} 不一致`);
  }
  for (let i = 0; i < totalNum; i++) {
    if (!section[i]) {
      throw new Error(`病例${i + 1}为空`);
    } else if (!section[i].street) {
      throw new Error(`病例${i + 1}街道为空`);
    } else if (!section[i].source) {
      throw new Error(`病例${i + 1}来源为空`);
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
