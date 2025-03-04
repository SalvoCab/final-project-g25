import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const EditCandidate = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState({
    name: 'John',
    surname: 'Doe',
    skills: 'React, JavaScript',
    experience: '3 years',
    email: 'john.doe@example.com',
    address: '123 Elm Street',
    ssn: '123-45-6789',
    telephone: '555-1234',
    photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Candidate:', candidate);
  };

  return (
    <form className="edit-candidate" onSubmit={handleSubmit}>
      <h2>Edit Candidate</h2>
      <input
        type="text"
        value={candidate.name}
        onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.surname}
        onChange={(e) => setCandidate({ ...candidate, surname: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.skills}
        onChange={(e) => setCandidate({ ...candidate, skills: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.experience}
        onChange={(e) => setCandidate({ ...candidate, experience: e.target.value })}
        required
      />
      <input
        type="email"
        value={candidate.email}
        onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.address}
        onChange={(e) => setCandidate({ ...candidate, address: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.ssn}
        onChange={(e) => setCandidate({ ...candidate, ssn: e.target.value })}
        required
      />
      <input
        type="text"
        value={candidate.telephone}
        onChange={(e) => setCandidate({ ...candidate, telephone: e.target.value })}
        required
      />
      <input
        type="file"
        onChange={(e) => setCandidate({ ...candidate, photo: e.target.files[0] })}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default EditCandidate;
