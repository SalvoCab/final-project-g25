import {ProfessionalDTO} from "./Professional.ts";

export interface JobOffer{
    id: number;
    description: string;
    state: string,
    notes?: string,
    duration: number,
    value?: number,
    customer?: number,
    professional?: number,
    skills : {id:number,skill:string}[]
    candidates?: CandidateDTO[]

}

export interface candidate{
    professionalId: number;
    status: string;
    note: string;
}
export interface CandidateDTO{
    professional: ProfessionalDTO;
    candidateId: number;
    status: string;
    note: string;
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
export interface UpdateCandidateDTO{
    note: string;
    state: string;
}
export interface UpdateJobOfferStatusDTO {
    state: string;
    notes: string;
    professionalId?: number | null;
}
