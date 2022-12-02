import http from 'got';

export interface IArticleItem {
  id: number;
  title: string;
  created_at: string;
  url: string;
}

interface IIndex {
  articles: IArticleItem[];
  updated: string;
}

export async function fetchIndex(): Promise<IArticleItem[]> {
  const { articles } = await http.get('http://wjw.sz.gov.cn/postmeta/i/109155.json').json<IIndex>();
  return articles;
}
