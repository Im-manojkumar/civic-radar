export type Role = 'CITIZEN' | 'ADMIN';
export type Language = 'en' | 'ta';

export enum IssueCategory {
  ROADS = 'Roads',
  WATER = 'Water Supply',
  SANITATION = 'Sanitation',
  ELECTRICITY = 'Electricity',
  TRAFFIC = 'Traffic',
  OTHER = 'Other'
}

export enum IssueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum Urgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  urgency: Urgency;
  status: IssueStatus;
  location: string;
  timestamp: number;
  aiAnalysis?: string;
}

export interface AppConfig {
  theme: 'light' | 'dark';
  language: Language;
  modules: {
    analytics: boolean;
    aiAssistant: boolean;
  };
}
