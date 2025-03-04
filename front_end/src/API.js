import axios from 'axios';

const Server_URL = 'http://localhost:3001';

export const getDocuments = (page, limit) =>
  axios.get(`${Server_URL}/documents`, { params: { page, limit } });

export const getDocumentDetails = (metadataId) =>
  axios.get(`${Server_URL}/documents/${metadataId}`);

export const getDocumentData = (metadataId) =>
  axios.get(`${Server_URL}/documents/${metadataId}/data`);

export const uploadDocument = (formData) =>
  axios.post(`${Server_URL}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateDocument = (metadataId, formData) =>
  axios.put(`${Server_URL}/documents/${metadataId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDocument = (metadataId) =>
  axios.delete(`${Server_URL}/documents/${metadataId}`);
