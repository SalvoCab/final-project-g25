import { customFetch } from "./apiUtils.tsx";
import { SkillDTO } from "../objects/Skill.ts";


// Lista paginata di skill (con keyword e direzione)
export async function listSkills(params: {
    page?: number;
    limit?: number;
    keyword?: string;
    sortDirection?: number; // 0 = ASC, 1 = DESC
}): Promise<SkillDTO[]> {
    const query = new URLSearchParams({
        page: String(params.page ?? 0),
        limit: String(params.limit ?? 20),
        keyword: params.keyword ?? "",
        sortDirection: String(params.sortDirection ?? 0),
    }).toString();
    return customFetch(`/crm/skills?${query}`);
}

// Lista completa di tutte le skill (senza paginazione)
export async function listAllSkills(): Promise<SkillDTO[]> {
    return customFetch(`/crm/skills/all`);
}

// Crea una nuova skill (se non esiste già)
export async function createSkill(skill: string): Promise<SkillDTO> {
    return customFetch(`/crm/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: skill
    });
}


// Aggiorna il nome di una skill
export async function updateSkill(skillId: number, newSkillName: string): Promise<{
    id_skill: number;
    old_name: string;
    new_name: string;
}> {
    return customFetch(`/crm/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkillName),
    });
}

// Elimina una skill
export async function deleteSkill(skillId: number): Promise<SkillDTO> {
    return customFetch(`/crm/skills/${skillId}`, {
        method: "DELETE",
    });
}
