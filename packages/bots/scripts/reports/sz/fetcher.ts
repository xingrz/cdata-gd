import got from 'got';

const http = got.extend({
  prefixUrl: 'https://opendata.sz.gov.cn/data/dataSet/',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Origin': 'https://opendata.sz.gov.cn',
  },
});

interface IDataFile {
  id: string;
  fileName: string;
  fileSize: number;
  updateDate: string;  // "2022-11-30 08:03"
}

export async function getFileList(resId: string): Promise<IDataFile[]> {
  return await http.post('getFileList', {
    form: {
      resId: resId,
      sourceType: 3,
      sourceSuffix: 'json',
      beginDate: '',
      endDate: '',
    },
  }).json<IDataFile[]>();
}

interface IFileDownload {
  message: string;
  result: string; // "true"
}

export async function singleFileDownload(resId: string, fileId: string): Promise<string | undefined> {
  const { message, result } = await http.post('singleFileDownload', {
    form: {
      resId: resId,
      fileId: fileId,
    },
  }).json<IFileDownload>();

  if (result == 'true') {
    return message;
  }
}

interface IItem {
  XH: string;  // 序号
  JZQ: string;  // 居住区
  JZJD: string;  // 居住街道
  FXTJ: string;  // 发现途径
  XB: string;  // 性别
  NL: string;  // 年龄
  RQ: string;  // 日期
  XXDZ: string;  // 详细地址
}

export async function getFile(url: string): Promise<IItem[]> {
  const json = await got.get(url).text();
  return JSON.parse(json.substring(1, json.length - 1));
}
