import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CandidateList.css';

const CandidateList = () => {
  const [skillsSearch, setSkillsSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');

  const candidates = [
    {
      id: 1,
      name: 'Abolfazl',
      surname: 'Javidian',
      skills: 'React, JavaScript',
      experience: '15 years',
      email: 'abolfazl.javidian@gmail.com',
      address: 'Turin',
      ssn: '123-45-6789',
      telephone: '111-222-1234',
      photo: 'https://via.placeholder.com/50',
    },
    {
      id: 2,
      name: 'Jane',
      surname: 'Smith',
      skills: 'Python, Data Science',
      experience: '10 years',
      email: 'jane.smith@gmail.com',
      address: 'Milan',
      ssn: '987-65-4321',
      telephone: '333-444-5678',
      photo: 'https://via.placeholder.com/50',
    },
    {
      id: 3,
      name: 'John',
      surname: 'Doe',
      skills: 'React, Node.js',
      experience: '8 years',
      email: 'john.doe@gmail.com',
      address: 'Rome',
      ssn: '321-54-8769',
      telephone: '555-666-7890',
      photo: 'https://via.placeholder.com/50',
    },
  ];

  // Filter candidates based on search inputs
  const filteredCandidates = candidates.filter((candidate) => {
    const candidateExperience = parseInt(candidate.experience); // Extract numerical experience
    const inputExperience = parseInt(experienceSearch) || 0; // Convert user input to a number or default to 0

    return (
      candidate.skills.toLowerCase().includes(skillsSearch.toLowerCase()) &&
      candidateExperience >= inputExperience
    );
  });

  return (
    <div className="candidate-list">
      <h2>Candidate List</h2>

      {/* Search Inputs */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by skills"
          value={skillsSearch}
          onChange={(e) => setSkillsSearch(e.target.value)}
          className="search-input"
        />
        <input
          type="number"
          placeholder="Search by minimum experience (years)"
          value={experienceSearch}
          onChange={(e) => setExperienceSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Candidate Table */}
      <table className="candidate-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Skills</th>
            <th>Experience</th>
            <th>Email</th>
            <th>Address</th>
            <th>Telephone</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((candidate) => (
            <tr key={candidate.id}>
              <td>
                <img
                  src={candidate.photo}
                  alt={`${candidate.name} ${candidate.surname}`}
                  className="candidate-photo"
                />
              </td>
              <td>{candidate.name}</td>
              <td>{candidate.surname}</td>
              <td>{candidate.skills}</td>
              <td>{candidate.experience}</td>
              <td>{candidate.email}</td>
              <td>{candidate.address}</td>
              <td>{candidate.telephone}</td>
              <td>
                <Link to={`/candidates/${candidate.id}`} className="details-link">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateList;
