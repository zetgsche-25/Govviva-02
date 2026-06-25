export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  role: 'CITIZEN' | 'ADMIN';
  org_id?: string;
  govbr_sub?: string;
  govbr_level?: 'BRONZE' | 'SILVER' | 'GOLD';
  govbr_authenticated?: boolean;
  lgpd_terms_accepted?: boolean;
  lgpd_privacy_accepted?: boolean;
  lgpd_marketing_consented?: boolean;
  lgpd_treatment_consented?: boolean;
  lgpd_accepted_at?: string | null;
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
  workload?: number;
  org_responsible?: string;
  org_id?: string;
  org_name?: string;
  gestor_responsavel?: string;
}

export interface PresenceCheckInfo {
  id: number | null;
  registration_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  location: string | null;
  calculated_duration: number;
  calculated_percentage: number;
  status: 'PENDING' | 'APPROVED' | 'INCOMPLETE' | 'ABSENT';
}

export interface Registration {
  registration_id: number;
  status: string;
  ticket_code?: string;
  ticket_uuid?: string;
  qrcode_encrypted?: string;
  security_hash?: string;
  event: Event;
  presence?: PresenceCheckInfo | null;
  certificate?: {
    id: number;
    code: string;
    issued_at: string;
    hash_verification: string;
    is_publicly_available: boolean;
  } | null;
}

