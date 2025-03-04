import React, { useState, useEffect } from 'react';
import { getDocumentDetails } from '../../API';

const DocumentDetails = ({ metadataId }) => {
  const [document, setDocument] = useState(null);

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
