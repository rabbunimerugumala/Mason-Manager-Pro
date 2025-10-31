
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
  additionalCosts: Omit<AdditionalCost, 'id'>[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Place {
  id: string;
  name: string;
  workerRate: number;
  labourerRate: number;
  records: DailyRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
    name: string;
    phone: string;
}
