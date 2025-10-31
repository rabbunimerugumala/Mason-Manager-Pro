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
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Place {
  id: string;
  name: string;
  workerRate: number;
  labourerRate: number;
  // records are now a subcollection, so we don't store them here.
  // records: DailyRecord[]; 
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserProfile {
    id: string;
    name: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}
