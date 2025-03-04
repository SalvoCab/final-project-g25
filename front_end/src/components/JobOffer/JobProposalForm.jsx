import React, { useState } from "react";
import "./JobProposalForm.css"; // Import CSS file

const JobProposalForm = ({ onSubmit }) => {
  const [description, setDescription] = useState("");
  const [state, setState] = useState("Candidate Proposal"); // Default state
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !duration || !state) {
      alert("Description, duration, and state are required.");
      return;
    }

    const newProposal = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      state,
      notes: notes || null, // Allow null value for optional field
      duration: parseInt(duration),
      value: value ? parseFloat(value) : null, // Convert to float if entered
    };

    onSubmit(newProposal);

    // Reset form fields
    setDescription("");
    setState("Candidate Proposal");
    setNotes("");
    setDuration("");
    setValue("");
  };

  return (
    <div className="job-form-container">
      <h2>Submit a Job Proposal</h2>
      <form onSubmit={handleSubmit}>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>State:</label>
        <select value={state} onChange={(e) => setState(e.target.value)} required>
          <option value="Selection Phase">Selection Phase</option>
          <option value="Aborted">Aborted</option>
          <option value="Candidate Proposal">Candidate Proposal</option>
          <option value="Consolidated">Consolidated</option>
          <option value="Done">Done</option>
        </select>

        <label>Duration (days):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />

        <label>Value ($):</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

        <button type="submit">Submit Proposal</button>
      </form>
    </div>
  );
};

export default JobProposalForm;
