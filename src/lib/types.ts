export interface AdditionalCost {
  id: string;
  description: string;
  amount: number;
}

export interface DailyRecord {
  id: string;
  date: string; // ISO string 'YYYY-MM-DD'
  workers: number;
  labourers: number;
  additionalCosts: AdditionalCost[];
  notes?: string;
}

export interface Place {
  id:string;
  name: string;
  workerRate: number;
  labourerRate: number;
  records: DailyRecord[];
}

export interface User {
  id: string;
  name: string;
}
