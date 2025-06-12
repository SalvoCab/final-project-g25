import {CreateProfessionalDTO, ProfessionalDetails, ProfessionalDTO} from "../objects/Professional.ts";
import {customFetch} from "./apiUtils.tsx";




// 1. Lista paginata
export function listProfessionals(params: {
    page?: number;
    limit?: number;
    skills?: number[];
    location?: string;
    state?: string;
    keyword?: string;
}): Promise<ProfessionalDTO[]> {
    const query = new URLSearchParams({
        page: String(params.page ?? 0),
        limit: String(params.limit ?? 20),
        skills: params.skills?.join(",") ?? "",
        location: params.location ?? "",
        state: params.state ?? "",
        keyword: params.keyword ?? "",
    }).toString();
    return customFetch<ProfessionalDTO[]>(`/crm/professionals?${query}`);
}

// 2. Crea Professional associato a un contatto
export function createProfessional(contactId: number, dto: CreateProfessionalDTO): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${contactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

// 3. Aggiorna Professional
export function updateProfessional(professionalId: number, dto: CreateProfessionalDTO): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

// 4. Dettagli completi di un Professional
export function getProfessionalDetails(professionalId: number): Promise<ProfessionalDetails> {
    return customFetch<ProfessionalDetails>(`/crm/professionals/${professionalId}`);
}

// 5. Elimina solo il Professional (non il contatto)
export function deleteProfessional(professionalId: number): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}`, {
        method: "DELETE",
    });
}

// 6. Elimina Professional e Contatto associato
export function deleteProfessionalAndContact(professionalId: number): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}/contact`, {
        method: "DELETE",
    });
}

// 7. Aggiunge skill (creandola se non esiste)
export function addSkillToProfessional(professionalId: number, skill: string): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}/addskill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
    });
}

// 8. Associa skill esistente
export function associateSkillToProfessional(professionalId: number, skill: string): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}/skill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
    });
}

// 9. Rimuove skill da un professional
export function removeSkillFromProfessional(professionalId: number, skill: string): Promise<ProfessionalDTO> {
    return customFetch<ProfessionalDTO>(`/crm/professionals/${professionalId}/skill`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
    });
}