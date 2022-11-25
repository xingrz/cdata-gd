export enum IIncreaseTypes {
  '新增本土确诊病例',
  '新增本土无症状感染者',
  '新增境外输入确诊病例',
  '新增境外输入无症状感染者',
};

export type IIncreaseType = keyof typeof IIncreaseTypes;
export type ICity = string;

export interface IStats {
  time: string;
  data: Record<IIncreaseType, Record<ICity, number>>;
}
