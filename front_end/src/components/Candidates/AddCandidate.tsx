import React, { useState } from 'react';

interface CandidateFormData {
  name: string;
  surname: string;
  skills: string;
  experience: string;
  email: string;
  address: string;
  ssn: string;
  telephone: string;
  photo: string;
}

const AddCandidate: React.FC = () => {
  const [formData, setFormData] = useState<CandidateFormData>({
    name: '',
    surname: '',
    skills: '',
    experience: '',
    email: '',
    address: '',
    ssn: '',
    telephone: '',
    photo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        photo: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Candidate added:', formData);
  };

  return (
      <div className="add-candidate">
        <h2>Add Candidate</h2>
        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="surname">Surname</label>
            <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="skills">Skills</label>
            <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="experience">Experience</label>
            <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="address">Address</label>
            <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="ssn">SSN</label>
            <input
                type="text"
                id="ssn"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="telephone">Telephone</label>
            <input
                type="text"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
            />
          </div>
          <div className="form-row">
            <label htmlFor="photo">Photo</label>
            <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
            />
            {formData.photo && (
                <div className="photo-preview">
                  <img src={formData.photo} alt="Candidate Preview" className="photo-img" />
                </div>
            )}
          </div>
          <div className="form-row">
            <button type="submit" className="submit-btn">
              Add Candidate
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddCandidate;
