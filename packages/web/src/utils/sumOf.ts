export default function sumOf(section: Record<string, number>): number {
  return Object.values(section).reduce((n, sum) => n + sum, 0);
}
