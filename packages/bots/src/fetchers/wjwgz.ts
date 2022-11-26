import http from 'got';
import * as cheerio from 'cheerio';

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

export async function fetchArticle(url: string): Promise<string> {
  const html = await http.get(url).text();
  const $ = cheerio.load(html);
  return $('[wzades="正文"] p').toArray().map((el) => $(el).text().trim()).join('\n');
}
