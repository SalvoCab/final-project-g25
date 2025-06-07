export interface CustomerDTO {
    id: number;
    name: string;
    surname: string;
    notes: string | null;
}

export interface CustomerDetails {
    id_customer: number;
    id_contact: number;
    name: string;
    surname: string;
    notes: string | null;
    category: string;
    ssn_code: string;
    emails: string[];
    addresses: string[];
    phone_numbers: string[];
}