import { useState } from "react";
import { addJobOffer} from "../../API.tsx";
import { CreateJobOffer} from "../../objects/JobOffer.ts";

interface AddJobOfferPageProps {
  customerId: number;
  availableSkills: { id: number; name: string }[]
}

export default function AddJobOfferPage({ customerId, availableSkills }: AddJobOfferPageProps) {
  const [formData, setFormData] = useState<CreateJobOffer>({
    description: "",
    notes: "",
    duration: 0,
    skills: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSkillToggle = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
          ? prev.skills.filter(id => id !== skillId)
          : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await addJobOffer(formData, customerId);
      setSuccessMessage("Job offer successfully created!");
      setFormData({ description: "", notes: "", duration: 0, skills: [] });
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        alert(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div>
        <h2>Add Job Offer</h2>
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Description:</label>
            <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
            {errors.description && <span style={{ color: "red" }}>{errors.description}</span>}
          </div>
          <div>
            <label>Notes:</label>
            <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
            />
          </div>
          <div>
            <label>Duration (in days):</label>
            <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
            />
            {errors.duration && <span style={{ color: "red" }}>{errors.duration}</span>}
          </div>
          <div>
            <label>Skills:</label>
            {availableSkills.map(skill => (
                <label key={skill.id}>
                  <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                  />
                  {skill.name}
                </label>
            ))}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Add Job Offer"}
          </button>
        </form>
      </div>
  );
}
