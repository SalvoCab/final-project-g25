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
    skills: string[]
}