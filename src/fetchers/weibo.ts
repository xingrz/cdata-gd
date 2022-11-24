import http from 'got';
import { CookieJar } from 'tough-cookie';

interface IResult<T> {
  ok: number;
  data: T;
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

export async function fetchWeibo(uid: string, page = 1, feature = 0): Promise<IWeibo[]> {
  const cookieJar = new CookieJar();

  await http.get('https://weibo.com/ajax/statuses/mymblog', {
    cookieJar,
    searchParams: { uid, page, feature },
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

  const { data } = await http.get('https://weibo.com/ajax/statuses/mymblog', {
    cookieJar,
    searchParams: { uid, page, feature },
  }).json<IResult<IMyMBlog>>();

  return data.list;
}
