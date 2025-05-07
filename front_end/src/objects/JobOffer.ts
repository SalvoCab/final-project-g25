export interface JobOffer{
    id: number;
    description: string;
    state: string,
    notes?: string,
    duration: number,
    value?: string,
    customer?: number,
    professional?: number,
    skills : string[]
}

export interface CreateJobOffer{
    description: string
    notes?: string
    duration: number
    skills: number[]
}

export interface Skill {
    id: number;
    name: string;
}

export interface UpdateJobOfferStatusDTO {
    state: string;
    notes: string;
    professionalId?: number | null;
}