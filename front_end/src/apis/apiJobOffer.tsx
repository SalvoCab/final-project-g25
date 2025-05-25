import {CreateJobOffer, JobOffer, UpdateJobOfferStatusDTO} from "../objects/JobOffer";
import {customFetch} from "./apiUtils.tsx";


export function addJobOffer(
    job: CreateJobOffer,
    customerId: number,
): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${customerId}/customer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });
}

// GET /joboffers
export function listJobOffers(
    page = 0,
    limit = 20,
    state = "",
    customer = 0,
    professional = 0
): Promise<JobOffer[]> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        state,
        customer: customer.toString(),
        professional: professional.toString(),
    });

    return customFetch(`/crm/joboffers?${params.toString()}`);
}

// GET /joboffers/open/{customerId}
export function listOpenJobOffers(customerId: number, page = 0, limit = 20): Promise<JobOffer[]> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    return customFetch(`/crm/joboffers/open/${customerId}?${params.toString()}`);
}

// GET /joboffers/accepted/{professionalId}
export function listAcceptedJobOffers(professionalId: number, page = 0, limit = 20): Promise<JobOffer[]> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    return customFetch(`/crm/joboffers/accepted/${professionalId}?${params.toString()}`);
}

// GET /joboffers/aborted
export function listAbortedJobOffers(customer = 0, professional = 0, page = 0, limit = 20): Promise<JobOffer[]> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        customer: customer.toString(),
        professional: professional.toString(),
    });

    return customFetch(`/crm/joboffers/aborted?${params.toString()}`);
}

// POST /joboffers/{customerId}/customer
export function createJobOffer(job: CreateJobOffer, customerId: number): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${customerId}/customer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });
}

// PUT /joboffers/{jobOfferId}
export function updateJobOffer(jobOfferId: number, job: CreateJobOffer): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });
}

// DELETE /joboffers/{jobOfferId}
export function deleteJobOffer(jobOfferId: number): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}`, {
        method: "DELETE",
    });
}

// POST /joboffers/{jobOfferId}
export function updateJobOfferStatus(jobOfferId: number, dto: UpdateJobOfferStatusDTO): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
    });
}

// GET /joboffers/{jobOfferId}/value
export function getJobOfferValue(jobOfferId: number): Promise<{ job_id: number; value: number }> {
    return customFetch(`/crm/joboffers/${jobOfferId}/value`);
}

// POST /joboffers/{jobOfferId}/addskill
export function addSkillToJobOffer(jobOfferId: number, skill: string): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}/addskill`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skill),
    });
}

// DELETE /joboffers/{jobOfferId}/skill
export function removeSkillFromJobOffer(jobOfferId: number, skill: string): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}/skill`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skill),
    });
}

// POST /joboffers/{jobOfferId}/skill
export function associateSkillToJobOffer(jobOfferId: number, skill: string): Promise<JobOffer> {
    return customFetch(`/crm/joboffers/${jobOfferId}/skill`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(skill),
    });
}