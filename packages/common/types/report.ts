export interface IReport {
  time: string;
  data: IReportData;
  ref?: string;
}

export type IReportType = '本土确诊病例' | '本土无症状感染者';

export type IReportData = Record<IReportType, IReportItem[]>;

export interface IReportItem {
  street: string;
  source: string;
}
