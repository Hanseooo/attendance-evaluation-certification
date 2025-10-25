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
  id: number | null;
  seminar: Seminar;
  user: User;
  content_and_relevance: number;
  presenters_effectiveness: number;
  organization_and_structure: number;
  materials_usefulness: number;
  overall_satisfaction: number;
  suggestions?: string;
  is_completed: boolean;
  created_at: string;
  certificate_url: string; // Can be empty string or base64 data URL
}

export interface SubmitEvaluationResponse {
  id: number;
  seminar: Seminar;
  user: User;
  content_and_relevance: number;
  presenters_effectiveness: number;
  organization_and_structure: number;
  materials_usefulness: number;
  overall_satisfaction: number;
  suggestions?: string;
  is_completed: boolean;
  created_at: string;
  certificate_url: string; // Base64 data URL
}

export interface EvaluationPayload {
  seminar_id: number;
  content_and_relevance: number;
  materials_usefulness: number;
  organization_and_structure: number;
  presenters_effectiveness: number;
  overall_satisfaction: number;
  suggestions: string;
}

export interface SubmitEvaluationResponse {
  success: string;
  certificate_url: string;
}

export interface CertificateTemplate {
  id: number;
  seminar: number | { id: number; title: string };
  template_image_url: string | null;
  text_x: number;
  text_y: number;
  centered: boolean;
  default_used: boolean;
  uploaded_at: string;
}

export interface CertificateTemplatePayload {
  seminar: number;
  template_image?: File;
  text_x: number;
  text_y: number;
  centered: boolean;
}

export interface Attendee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}
