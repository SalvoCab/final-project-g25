import {customFetch, customFetchDoc, ensureCSRFToken} from "./apiUtils.tsx";
import {DocumentMetadataDTO} from "../objects/Document.ts";


// Lista documenti paginati
export async function listDocuments(params: {
    page?: number;
    limit?: number;
}): Promise<DocumentMetadataDTO[]> {
    const query = new URLSearchParams({
        page: String(params.page ?? 0),
        limit: String(params.limit ?? 20),
    }).toString();
    return customFetch(`/ds/documents?${query}`);
}

// Dettagli di un documento
export async function getDocumentDetails(id: number): Promise<DocumentMetadataDTO> {
    return customFetch(`/ds/documents/${id}`);
}

// Upload nuovo documento
export async function uploadDocument(file: File): Promise<DocumentMetadataDTO> {
    await ensureCSRFToken();
    const formData = new FormData();
    formData.append("documento", file);
    return customFetchDoc(`/ds/documents`, {
        method: "POST",
        body: formData,
    });
}

// Download contenuto di un documento
export async function downloadDocument(id: number): Promise<Blob> {
    const response = await fetch(`/ds/documents/${id}/data/`);
    if (!response.ok) {
        throw new Error("Errore durante il download del documento");
    }
    return await response.blob(); // Usare FileSaver.js o URL.createObjectURL per salvarlo
}

// Update documento (con file nuovo)
export async function updateDocument(id: number, file: File): Promise<DocumentMetadataDTO> {
    const formData = new FormData();
    formData.append("file", file);
    return customFetch(`/ds/documents/${id}`, {
        method: "PUT",
        body: formData,
    });
}

// Elimina documento
export async function deleteDocument(id: number): Promise<{
    id: number;
    name: string;
    message: string;
}> {
    return customFetch(`/ds/documents/${id}`, {
        method: "DELETE",
    });
}
