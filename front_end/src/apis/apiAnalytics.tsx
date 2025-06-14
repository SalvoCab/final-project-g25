import {customFetch} from "./apiUtils.tsx";
import {
    CustomersAndProfessionals,
    StatusMap,
    MessagesPerMonth,
    DocumentsPerMonth,
    AverageJobOfferValue
} from '../objects/Analytics.ts';

export async function getNumberOfCustomersAndProfessionals(): Promise<CustomersAndProfessionals> {
    return customFetch(`/an/analytics/numberOfCustomersAndProfessionals`);
}

export async function getNumberOfJobOffersPerStatus(): Promise<StatusMap> {
    return customFetch(`/an/analytics/numberOfJobOffersPerStatus`);
}

export async function getNumberOfProfessionalsPerStatus(): Promise<StatusMap> {
    return customFetch(`/an/analytics/numberOfProfessionalsPerStatus`);
}

export async function getNumberOfMessagesPerMonth(): Promise<MessagesPerMonth> {
    return customFetch(`/an/analytics/numberOfMessagesPerMonth`);
}

export async function getNumberOfDocumentsPerMonth(): Promise<DocumentsPerMonth> {
    return customFetch(`/an/analytics/numberOfDocumentsPerMonth`);
}

export async function getAverageJobOfferValue(): Promise<AverageJobOfferValue> {
    return customFetch(`/an/analytics/averageJobOfferValue`);
}
