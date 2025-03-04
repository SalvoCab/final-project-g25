import React, { useState, useEffect } from 'react';
import { getDocuments } from '../../API';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

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
