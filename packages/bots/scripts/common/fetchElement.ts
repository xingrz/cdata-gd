import http from 'got';
import * as cheerio from 'cheerio';

export default async function fetchElement(url: string, selector: string): Promise<string> {
  const html = await http.get(url).text();
  const $ = cheerio.load(html);
  return $(selector).toArray().map((el) => $(el).text().trim()).join('\n');
}
