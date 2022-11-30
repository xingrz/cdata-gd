export interface IReport {
  time: string;
  data: IReportData;
  ref?: string;
}

export type IReportData = Record<IReportType, IReportItem[]>;

export type IReportType = string;

export interface IReportItem {
  street: string;
  source: string;
}
