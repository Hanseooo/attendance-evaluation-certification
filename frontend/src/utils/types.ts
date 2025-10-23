export interface User {
  pk: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  isEmailVerified: boolean;
  role: string;
}

export interface LoginResponse {
  key: string; // auth token
  user: User;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export type Seminar = {
  id: number;
  title: string;
  description: string;
  speaker?: string;
  venue: string;
  date_start: string;
  date_end?: string;
  duration_minutes?: number;
  is_done?: boolean;
  certificate_template?: string | null;
  created_at?: string;
};

export type MySeminar = {
  id: number;
  user: number;
  seminar: Seminar;
  created_at: string;
};

export type SortDirection = "asc" | "desc";
export type SortField = "date" | "duration";

export type Filters = {
  sortField: SortField;
  sortDir: SortDirection;
  hideAttending: boolean;
};

export type AttendanceAction = "check_in" | "check_out";

export interface RecordAttendanceResponse {
  success?: string;
  error?: string;
}

export interface Evaluation {
  id: number;
  seminar: Seminar; // object, not just ID
  user: User;
  content_relevance: number;
  presenter_effectiveness: number;
  organization_structure: number;
  usefulness_materials: number;
  overall_satisfaction: number;
  suggestions?: string;
  is_completed: boolean;
  created_at: string;
}

export interface EvaluationPayload {
  seminar: number;
  content_relevance: number;
  presenter_effectiveness: number;
  organization_structure: number;
  usefulness_materials: number;
  overall_satisfaction: number;
  suggestions: string;
}

export interface CertificateTemplate {
  id: number;
  seminar: number;
  template: string; // URL
  text_x: number;
  text_y: number;
  centered: boolean;
  uploaded_at: string;
}

export interface CertificateTemplatePayload {
  seminar: number;
  template: File;
  text_x: number;
  text_y: number;
  centered: boolean;
}