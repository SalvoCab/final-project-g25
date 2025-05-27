import { CustomerDTO } from "../objects/Customer.ts";
import { customFetch } from "./apiUtils.tsx";

// Dettagli cliente con contatto incluso
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

// List customers (paginati)
export async function listCustomers(params: {
    page?: number;
    limit?: number;
}): Promise<CustomerDTO[]> {
    const query = new URLSearchParams({
        page: String(params.page ?? 0),
        limit: String(params.limit ?? 20),
    }).toString();
    return customFetch(`/crm/customers?${query}`);
}

// Get customer details by ID
export async function getCustomerDetails(customerId: number): Promise<CustomerDetails> {
    return customFetch(`/crm/customers/${customerId}`);
}

// Create customer (da un contatto esistente)
export async function createCustomer(contactId: number, notes: string | null): Promise<CustomerDTO> {
    return customFetch(`/crm/customers/${contactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes),
    });
}

// Update customer notes
export async function updateCustomer(customerId: number, notes: string | null): Promise<CustomerDTO> {
    return customFetch(`/crm/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes),
    });
}

// Delete customer (senza cancellare il contatto)
export async function deleteCustomer(customerId: number): Promise<CustomerDTO> {
    return customFetch(`/crm/customers/${customerId}`, {
        method: "DELETE",
    });
}

// Delete customer + contatto associato
export async function deleteCustomerAndContact(customerId: number): Promise<CustomerDTO> {
    return customFetch(`/crm/customers/${customerId}/contact`, {
        method: "DELETE",
    });
}
