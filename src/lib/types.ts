export interface DailyRecord {
  id: string;
  date: string; // ISO string 'YYYY-MM-DD'
  workers: number;
  labourers: number;
  muta: number;
  machines: number;
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  workerRate: number;
  labourerRate: number;
  records: DailyRecord[];
}
