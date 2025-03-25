import React, { useState } from 'react';
import { uploadDocument } from '../../API.ts';

const UploadDocument: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return; // Verifica che un file sia stato selezionato

        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadDocument(formData);
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Upload Document</h2>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                required
            />
            <button type="submit">Upload</button>
        </form>
    );
};

export default UploadDocument;
