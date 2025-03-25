import React, { useState, useEffect } from 'react';
import { getDocumentDetails } from '../../API.ts';

// Definiamo il tipo per il documento
interface Document {
  name: string;
  type: string;
  createdAt: string;
}

// Definiamo i tipi per i props
interface DocumentDetailsProps {
  metadataId: string;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ metadataId }) => {
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await getDocumentDetails(metadataId);
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document details:', error);
      }
    };
    fetchDetails();
  }, [metadataId]);

  if (!document) return <p>Loading...</p>;

  return (
      <div>
        <h2>{document.name}</h2>
        <p>Type: {document.type}</p>
        <p>Created At: {document.createdAt}</p>
      </div>
  );
};

export default DocumentDetails;
