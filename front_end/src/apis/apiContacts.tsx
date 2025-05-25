
// List Contacts with filters
import {ContactDTO, CreateContactDTO} from "../objects/Contact.ts";
import {customFetch} from "./apiUtils.tsx";

export async function listContacts(params: {
    page?: number;
    limit?: number;
    email?: string;
    address?: string;
    number?: string;
    keyword?: string;
}): Promise<ContactDTO[]> {
    const query = new URLSearchParams({
        page: String(params.page ?? 0),
        limit: String(params.limit ?? 20),
        email: params.email ?? "",
        address: params.address ?? "",
        number: params.number ?? "",
        keyword: params.keyword ?? "",
    }).toString();
    return customFetch(`/crm/contacts?${query}`);
}

// Get Contact Details
export async function getContactDetails(contactId: number) {
    return customFetch(`/crm/contacts/${contactId}`);
}

// Create Contact
export async function createContact(data: CreateContactDTO): Promise<ContactDTO> {
    return customFetch(`/crm/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

// Update full contact
export async function updateContact(contactId: number, data: CreateContactDTO): Promise<ContactDTO> {
    return customFetch(`/crm/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

// Merge contacts
export async function mergeContacts(firstContactId: number, secondContactId: number) {
    return customFetch(`/crm/contacts/${firstContactId}/${secondContactId}`, {
        method: "POST",
    });
}

// Delete contact
export async function deleteContact(contactId: number) {
    return customFetch(`/crm/contacts/${contactId}`, {
        method: "DELETE",
    });
}

export async function addEmail(contactId: number, email: string) {
    return customFetch(`/crm/contacts/${contactId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
    });
}

export async function addAddress(contactId: number, address: string) {
    return customFetch(`/crm/contacts/${contactId}/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
    });
}

export async function addPhoneNumber(contactId: number, number: string) {
    return customFetch(`/crm/contacts/${contactId}/phoneNumber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(number),
    });
}

export async function updateEmail(contactId: number, emailId: number, newEmail: string) {
    return customFetch(`/crm/contacts/${contactId}/email/${emailId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmail),
    });
}

export async function updateAddress(contactId: number, addressId: number, newAddress: string) {
    return customFetch(`/crm/contacts/${contactId}/address/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
    });
}

export async function updatePhoneNumber(contactId: number, phoneId: number, newNumber: string) {
    return customFetch(`/crm/contacts/${contactId}/phoneNumber/${phoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNumber),
    });
}

export async function deleteEmail(contactId: number, emailId: number) {
    return customFetch(`/crm/contacts/${contactId}/email/${emailId}`, {
        method: "DELETE",
    });
}

export async function deleteAddress(contactId: number, addressId: number) {
    return customFetch(`/crm/contacts/${contactId}/address/${addressId}`, {
        method: "DELETE",
    });
}

export async function deletePhoneNumber(contactId: number, phoneId: number) {
    return customFetch(`/crm/contacts/${contactId}/phoneNumber/${phoneId}`, {
        method: "DELETE",
    });
}

export async function updateName(contactId: number, newName: string) {
    return customFetch(`/crm/contacts/${contactId}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newName),
    });
}

export async function updateSurname(contactId: number, newSurname: string) {
    return customFetch(`/crm/contacts/${contactId}/surname`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSurname),
    });
}

export async function updateCategory(contactId: number, newCategory: string) {
    return customFetch(`/crm/contacts/${contactId}/category`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
    });
}

export async function updateSSN(contactId: number, newSSN: string) {
    return customFetch(`/crm/contacts/${contactId}/ssn`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSSN),
    });
}