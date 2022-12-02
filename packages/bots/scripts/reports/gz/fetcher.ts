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
  const { articles } = await http.get('http://wjw.gz.gov.cn/postmeta/i/53522.json').json<IIndex>();
  return articles;
}
