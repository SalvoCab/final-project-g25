import React, { useState, useEffect } from 'react';
import { getDocuments } from '../../API.ts';

interface Document {
    metadataId: string;
    name: string;
}

const DocumentsList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { data } = await getDocuments(page, limit);
                setDocuments(data);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };
        fetchDocuments();
    }, [page, limit]);

    return (
        <div>
            <h2>Documents List</h2>
            <ul>
                {documents.map((doc) => (
                    <li key={doc.metadataId}>{doc.name}</li>
                ))}
            </ul>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
            </button>
            <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
    );
};

export default DocumentsList;
