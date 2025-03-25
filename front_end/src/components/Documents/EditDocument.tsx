import React, { useState } from 'react';
import { updateDocument } from '../../API.ts';

// Definiamo i tipi per i props
interface EditDocumentProps {
    metadataId: string;
}

const EditDocument: React.FC<EditDocumentProps> = ({ metadataId }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return; // Verifica che un file sia stato selezionato

        const formData = new FormData();
        formData.append('file', file);

        try {
            await updateDocument(metadataId, formData);
            alert('Document updated successfully!');
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Document</h2>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                required
            />
            <button type="submit">Update</button>
        </form>
    );
};

export default EditDocument;
