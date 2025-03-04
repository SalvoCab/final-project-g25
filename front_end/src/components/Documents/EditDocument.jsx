import React, { useState } from 'react';
import { updateDocument } from '../../API';

const EditDocument = ({ metadataId }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Update</button>
    </form>
  );
};

export default EditDocument;
