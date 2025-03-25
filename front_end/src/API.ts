import axios, { AxiosResponse } from 'axios';

const Server_URL = 'http://localhost:3001';

export const getDocuments = (page: number, limit: number): Promise<AxiosResponse<never>> =>
    axios.get(`${Server_URL}/documents`, { params: { page, limit } });

export const getDocumentDetails = (metadataId: string): Promise<AxiosResponse<never>> =>
    axios.get(`${Server_URL}/documents/${metadataId}`);

export const getDocumentData = (metadataId: string): Promise<AxiosResponse<never>> =>
    axios.get(`${Server_URL}/documents/${metadataId}/data`);

export const uploadDocument = (formData: FormData): Promise<AxiosResponse<never>> =>
    axios.post(`${Server_URL}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateDocument = (metadataId: string, formData: FormData): Promise<AxiosResponse<never>> =>
    axios.put(`${Server_URL}/documents/${metadataId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const deleteDocument = (metadataId: string): Promise<AxiosResponse<never>> =>
    axios.delete(`${Server_URL}/documents/${metadataId}`);
