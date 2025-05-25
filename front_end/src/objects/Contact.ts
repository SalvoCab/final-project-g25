export interface CreateContactDTO {
    name: string;
    surname: string;
    ssnCode?: string;
    emails?: string[];
    addresses?: string[];
    phoneNumbers?: string[];
}

export interface ContactDTO {
    id: number;
    name: string;
    surname: string;
    category: string;
    ssnCode?: string;
    emails: string[];
    addresses: string[];
    phoneNumber: string[];
}