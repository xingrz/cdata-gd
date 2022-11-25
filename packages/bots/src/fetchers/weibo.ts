import http from 'got';
import { CookieJar } from 'tough-cookie';

interface IResult<T> {
  ok: number;
  data?: T;
}

interface IMyMBlog {
  since_id: string;
  list: IWeibo[];
  total: number;
}

export interface IWeibo {
  created_at: string;  // "Thu Nov 24 08:41:51 +0800 2022"
  idstr: string;
  mid: string;
  mblogid: string;
  user: {
    idstr: string;
    screen_name: string;
    profile_url: string;
    verified: boolean;
    domain: string;
  };
  text_raw: string;
  text: string;
}

export async function genVisitor(cookieJar: CookieJar): Promise<void> {
  await http.get('https://weibo.com/ajax/statuses/mymblog', {
    cookieJar,
    searchParams: { uid: 1962787713, page: 1, feature: 0 },
  });

  const visitor = await http.post('https://passport.weibo.com/visitor/genvisitor', {
    cookieJar,
    form: { cb: 'gen_callback' },
  }).text();
  const match = visitor.match(/"tid":"([^"]+)"/);
  if (!match) throw new Error('无法获取 tid');
  const tid = match[1];

  await http.get('https://passport.weibo.com/visitor/visitor', {
    cookieJar,
    searchParams: {
      a: 'incarnate',
      t: tid,
    },
  });
}

export async function fetchWeibo(cookieJar: CookieJar, uid: string, page = 1, feature = 0): Promise<IWeibo[]> {
  const { data } = await http.get('https://weibo.com/ajax/statuses/mymblog', {
    cookieJar,
    searchParams: { uid, page, feature },
  }).json<IResult<IMyMBlog>>();
  if (!data) throw new Error('列表抓取异常');
  return data.list;
}

interface ILongText {
  longTextContent: string;
}

export async function fetchLongText(cookieJar: CookieJar, id: string): Promise<string> {
  const { data } = await http.get('https://weibo.com/ajax/statuses/longtext', {
    cookieJar,
    searchParams: { id },
  }).json<IResult<ILongText>>();
  if (!data) throw new Error('长文抓取异常');
  return data.longTextContent;
}
