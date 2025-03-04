import React, { useState } from 'react';
import { uploadDocument } from '../../API';

const UploadDocument = () => {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadDocument;
