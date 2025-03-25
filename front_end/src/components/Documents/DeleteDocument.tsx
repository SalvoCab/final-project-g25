import React from 'react';
import { deleteDocument } from '../../API.ts';

// Definiamo i tipi per i props del componente
interface DeleteDocumentProps {
    metadataId: string;
    onSuccess: () => void;
}

const DeleteDocument: React.FC<DeleteDocumentProps> = ({ metadataId, onSuccess }) => {
    const handleDelete = async () => {
        try {
            await deleteDocument(metadataId);
            alert('Document deleted successfully!');
            onSuccess(); // Refresh parent component
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    return (
        <div>
            <h2>Delete Document</h2>
            <p>Are you sure you want to delete this document?</p>
            <button onClick={handleDelete}>Yes</button>
            <button>No</button>
        </div>
    );
};

export default DeleteDocument;
