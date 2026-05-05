export interface User {
  id: number;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN';
  org_id?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date_start: string;
  location: string;
  total_slots: number;
  available_slots: number;
  category: string;
  status: string;
  org_id?: string;
  org_name?: string;
}

export interface Registration {
  registration_id: number;
  status: string;
  event: Event;
}
