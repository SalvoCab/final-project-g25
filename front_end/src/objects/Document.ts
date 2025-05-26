
// DTO per i metadati del documento
export interface DocumentMetadataDTO {
    id: number | null;
    name: string;
    size: number;
    contentType: string;
    createdOn: string | null; // ISO string
}
