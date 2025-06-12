import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {ProfessionalDTO, CreateProfessionalDTO} from "../../objects/Professional.ts";
import {useEffect, useState} from "react";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";
import {updateProfessional} from "../../apis/apiProfessional.tsx";
import Select, {MultiValue} from "react-select";
import {createSkill, listAllSkills} from "../../apis/apiSkill.tsx";
import {SkillDTO} from "../../objects/Skill.ts";

interface EditProfessionalModalProps {
    professional: ProfessionalDTO | null;
    show: boolean;
    onHide: () => void;
    onProfessionalEdited: () => void;
}

const EditProfessionalModal: React.FC<EditProfessionalModalProps> = ({professional, show, onHide, onProfessionalEdited }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateProfessionalDTO>({
        location: "",
        state: "employed",
        dailyRate: 0,
        skills: []
    });
    const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
    const [newSkillName, setNewSkillName] = useState("");
    const handleSubmit = async () => {
        if (!professional) return;
        setLoading(true);
        try {
            await ensureCSRFToken();
            await updateProfessional(professional.id, formData);
            onProfessionalEdited();
            onHide();
        } catch (error) {
            alert("Error in editing professional");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skills = await listAllSkills();
                setAvailableSkills(skills);
            } catch (error) {
                console.error("Error loading skills:", error);
            }
        };

        fetchSkills();
    }, []);

    useEffect(() => {
        if (show && professional) {
            setFormData({
                location: professional.location,
                state: professional.state,
                dailyRate: professional.dailyRate,
                skills: availableSkills
                    .filter(skill => professional.skills.includes(skill.skill))
                    .map(skill => skill.id!)
            });
        }
    }, [show, professional, availableSkills]);

    const handleSkillsChange = (
        selectedOptions: MultiValue<{ value: number; label: string }>
    ) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setFormData(prev => ({ ...prev, skills: selectedIds }));
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Professional {professional ? `(${professional.name} ${professional.surname})` : ""}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Select
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                >
                                    <option value="employed">Employed</option>
                                    <option value="available_for_work">Available for Work</option>
                                    <option value="not_available">Not Available</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Daily Rate</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    value={formData.dailyRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) }))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Skills</Form.Label>
                                <Select
                                    isMulti
                                    options={availableSkills.map(skill => ({
                                        value: skill.id!,
                                        label: skill.skill,
                                    }))}
                                    value={availableSkills
                                        .filter(skill => formData.skills?.includes(skill.id!))
                                        .map(skill => ({
                                            value: skill.id!,
                                            label: skill.skill,
                                        }))
                                    }
                                    onChange={handleSkillsChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>New skill</Form.Label>
                                <Form.Control type="text" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="Insert new skill" />
                                <Button variant="secondary" className="mt-2" onClick={async () => {
                                    if (!newSkillName.trim()) return;
                                    try {
                                        const newSkill = await createSkill(newSkillName.trim());
                                        setAvailableSkills((prev) => [...prev, newSkill]);
                                        setFormData((prev) => ({
                                            ...prev,
                                            skills: [...(prev.skills ?? []), newSkill.id!],
                                        }));
                                        setNewSkillName("");
                                        await ensureCSRFToken();
                                    } catch (error) {
                                        console.error("Error creating skill:", error);
                                    }
                                }}>Add skill</Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button className="btn-custom" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProfessionalModal;
