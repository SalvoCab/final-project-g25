import React from 'react';
import { useParams } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  surname: string;
  skills: string;
  experience: number;
  email: string;
  address: string;
  ssn: string;
  telephone: string;
  photo: string;
}

const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Abolfazl',
    surname: 'Javidian',
    skills: 'React, JavaScript',
    experience: 15,
    email: 'abolfazl.javidian@gmail.com',
    address: 'Turin',
    ssn: '123-45-6789',
    telephone: '111-222-1234',
    photo: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'Jane',
    surname: 'Smith',
    skills: 'Python, Data Science',
    experience: 10,
    email: 'jane.smith@gmail.com',
    address: 'Milan',
    ssn: '987-65-4321',
    telephone: '333-444-5678',
    photo: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    name: 'John',
    surname: 'Doe',
    skills: 'React, Node.js',
    experience: 8,
    email: 'john.doe@gmail.com',
    address: 'Rome',
    ssn: '321-54-8769',
    telephone: '555-666-7890',
    photo: 'https://via.placeholder.com/50',
  },
];

const CandidateProfile: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();

  const candidate = candidates.find((c) => c.id === candidateId);

  if (!candidate) {
    return <p>Candidate not found!</p>;
  }

  return (
      <div className="candidate-profile">
        <h2>{candidate.name} {candidate.surname}</h2>
        <img src={candidate.photo} alt={`${candidate.name} ${candidate.surname}`} />
        <p><strong>Skills:</strong> {candidate.skills}</p>
        <p><strong>Experience:</strong> {candidate.experience} years</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Address:</strong> {candidate.address}</p>
        <p><strong>Telephone:</strong> {candidate.telephone}</p>
      </div>
  );
};

export default CandidateProfile;
