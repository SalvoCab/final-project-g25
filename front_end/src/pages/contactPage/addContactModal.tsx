import {useEffect, useState} from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createContact } from "../../apis/apiContact";
import { createCustomer } from "../../apis/apiCustomer";
import { createProfessional } from "../../apis/apiProfessional.tsx";
import { CreateContactDTO } from "../../objects/Contact";
import { CreateProfessionalDTO } from "../../objects/Professional.ts";
import { ensureCSRFToken } from "../../apis/apiUtils.tsx";
import { createSkill, listAllSkills } from "../../apis/apiSkill.tsx";
import { SkillDTO } from "../../objects/Skill.ts";
import Select, { MultiValue } from "react-select";

interface AddContactModalProps {
    show: boolean;
    onHide: () => void;
    onContactCreated: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ show, onHide, onContactCreated }) => {
    const [contactData, setContactData] = useState<CreateContactDTO>({
        name: "",
        surname: "",
        ssnCode: "",
        emails: [],
        addresses: [],
        phoneNumbers: [],
    });

    const [category, setCategory] = useState<"unknown" | "customer" | "professional">("unknown");

    const [professionalData, setProfessionalData] = useState<CreateProfessionalDTO>({
        location: "",
        state: "",
        dailyRate: 0.0,
        skills: [],
    });

    const [customerNotes, setCustomerNotes] = useState<string | null>("");

    const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
    const [newSkillName, setNewSkillName] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skills = await listAllSkills();
                setAvailableSkills(skills);
            } catch (error) {
                console.error("Error in loading skills:", error);
            }
        };
        fetchSkills();
    }, []);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSkillsChange = (
        selectedOptions: MultiValue<{ value: number; label: string }>
    ) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setProfessionalData(prev => ({ ...prev, skills: selectedIds }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await ensureCSRFToken();
            const contact = await createContact({ ...contactData });

            if (category === "professional") {
                await ensureCSRFToken();
                await createProfessional(contact.id,professionalData);
            } else if (category === "customer") {
                await ensureCSRFToken();
                await createCustomer(contact.id, customerNotes);
            }

            onContactCreated();
            onHide();
        } catch (error) {
            alert("Error in creating contact");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Contact</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control name="name" value={contactData.name} onChange={handleContactChange} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Surname</Form.Label>
                                <Form.Control name="surname" value={contactData.surname} onChange={handleContactChange} />
                            </Form.Group>
                        </Col>
                        <Col md={1}></Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>SSN Code</Form.Label>
                                <Form.Control name="ssnCode" value={contactData.ssnCode} onChange={handleContactChange} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select value={category} onChange={(e) => setCategory(e.target.value as any)}>
                            <option value="unknown">Unknown</option>
                            <option value="customer">Customer</option>
                            <option value="professional">Professional</option>
                        </Form.Select>
                    </Form.Group>

                    {category === "professional" && (
                        <>
                            <Row>
                                <Col md={5}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Location</Form.Label>
                                        <Form.Control value={professionalData.location} onChange={(e) => setProfessionalData((prev) => ({ ...prev, location: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>State</Form.Label>
                                        <Form.Control value={professionalData.state} onChange={(e) => setProfessionalData((prev) => ({ ...prev, state: e.target.value }))} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Daily Rate</Form.Label>
                                        <Form.Control type="number" step="0.1" value={professionalData.dailyRate} onChange={(e) => setProfessionalData((prev) => ({ ...prev, dailyRate: parseFloat(e.target.value) }))} />
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
                                                .filter(skill => professionalData.skills?.includes(skill.id!))
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
                                                setProfessionalData((prev) => ({
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
                        </>
                    )}

                    {category === "customer" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Customer Notes</Form.Label>
                            <Form.Control as="textarea" rows={3} value={customerNotes ?? ""} onChange={(e) => setCustomerNotes(e.target.value)} />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Email(s)</Form.Label>
                        <Form.Control placeholder="email1@example.com, email2@example.com" onChange={(e) => setContactData((prev) => ({ ...prev, emails: e.target.value.split(',').map((x) => x.trim()) }))} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Address(es)</Form.Label>
                        <Form.Control placeholder="Via Roma 1, Via Verdi 2" onChange={(e) => setContactData((prev) => ({ ...prev, addresses: e.target.value.split(',').map((x) => x.trim()) }))} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number(s)</Form.Label>
                        <Form.Control placeholder="123456, 7891011" onChange={(e) => setContactData((prev) => ({ ...prev, phoneNumbers: e.target.value.split(',').map((x) => x.trim()) }))} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddContactModal;