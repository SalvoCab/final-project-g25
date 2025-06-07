export interface CreateProfessionalDTO {
    location: string;
    state: string;
    dailyRate: number;
    skills?: number[];
}

export interface ProfessionalDTO {
    id: number;
    name: string;
    surname: string;
    location: string;
    state: string;
    dailyRate: number;
    skills: string[];
}

export interface ProfessionalDetails {
    id_professional: number;
    id_contact: number;
    name: string;
    surname: string;
    location: string;
    state: string;
    daily_rate: number;
    category: string;
    ssn_code: string;
    emails: string[];
    addresses: string[];
    phone_numbers: string[];
    skills: string[];
}