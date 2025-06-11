import { useEffect, useState } from "react";
import {Button, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import { ContactDTO } from "../../objects/Contact.ts";
import { ensureCSRFToken } from "../../apis/apiUtils.tsx";
import { createProfessional } from "../../apis/apiProfessional.tsx";
import { listContacts } from "../../apis/apiContact.tsx";
import {CreateProfessionalDTO} from "../../objects/Professional.ts";
import Select, {MultiValue} from "react-select";
import {createSkill, listAllSkills} from "../../apis/apiSkill.tsx";
import {SkillDTO} from "../../objects/Skill.ts";

interface AddProfessionalModalProps {
    show: boolean;
    onHide: () => void;
    onProfessionalAdded: () => void;
}

const AddProfessionalModal: React.FC<AddProfessionalModalProps> = ({ show, onHide, onProfessionalAdded }) => {
    const [professionalData, setProfessionalData] = useState<CreateProfessionalDTO>({
        location: "",
        state: "employed",
        dailyRate: 0.0,
        skills: [],
    });
    const [loading, setLoading] = useState(false);
    const [contactSelected, setContactSelected] = useState<ContactDTO | null>(null);
    const [contacts, setContacts] = useState<ContactDTO[]>([]);

    // Filter fields
    const [emailFilter, setEmailFilter] = useState("");
    const [numberFilter, setNumberFilter] = useState("");
    const [keywordFilter, setKeywordFilter] = useState("");
    const [filtering, setFiltering] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
    const [newSkillName, setNewSkillName] = useState("");

    const handleSubmit = async () => {
        if (contactSelected === null) return;
        setLoading(true);
        try {
            await ensureCSRFToken();
            await createProfessional(contactSelected.id, professionalData);
            onProfessionalAdded();
            onHide();
        } catch (error) {
            alert("Error in creating professional. Even the best of us fail sometimes.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = async () => {
        setEmailFilter("");
        setNumberFilter("");
        setKeywordFilter("");
        setContactSelected(null);
        setFiltering(true);
        try {
            setContactSelected(null);
            await ensureCSRFToken();
            const results = await listContacts({
                page: 0,
                limit: 10000,
                email: "",
                address: "",
                number: "",
                keyword: "",
            });
            setContacts(results.filter(c => c.category === "unknown"));
            await ensureCSRFToken();
        } catch (error) {
            alert("Error fetching contacts. The server is probably just shy.");
            console.error(error);
        } finally {
            setFiltering(false);
        }
    };

    const handleFilter = async () => {
        setFiltering(true);
        try {
            setContactSelected(null);
            await ensureCSRFToken();
            const results = await listContacts({
                page: 0,
                limit: 10000,
                email: emailFilter,
                address: "",
                number: numberFilter,
                keyword: keywordFilter,
            });
            setContacts(results.filter(c => c.category === "unknown"));
            await ensureCSRFToken();
        } catch (error) {
            alert("Error fetching contacts. The server is probably just shy.");
            console.error(error);
        } finally {
            setFiltering(false);
        }
    };

    const handleSkillsChange = (
        selectedOptions: MultiValue<{ value: number; label: string }>
    ) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setProfessionalData(prev => ({ ...prev, skills: selectedIds }));
    };

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

    useEffect(() => {
        if (show){
            setProfessionalData({
                location: "",
                state: "employed",
                dailyRate: 0.0,
                skills: [],
            });
            setNewSkillName("")
            handleClearFilters();
        }
    }, [show]);


    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Upgrade a <b>contact</b> to <b>professional</b></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <h5>Filter Contacts</h5>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <Row>
                            <Col mb="3">
                                <Form.Control
                                    placeholder="Email"
                                    value={emailFilter}
                                    onChange={(e) => setEmailFilter(e.target.value)}
                                />
                            </Col>
                            <Col mb="3">
                                <Form.Control
                                    placeholder="Phone Number"
                                    value={numberFilter}
                                    onChange={(e) => setNumberFilter(e.target.value)}
                                />
                            </Col>
                            <Col mb="3">
                                <Form.Control
                                    placeholder="Keyword"
                                    value={keywordFilter}
                                    onChange={(e) => setKeywordFilter(e.target.value)}
                                />
                            </Col>
                            <Col mb="3">
                                <div className="btn-group">
                                    <Button onClick={handleFilter} variant="outline-primary">
                                        {filtering ? <Spinner animation="border" size="sm" /> : "Apply"}
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline-danger">
                                        {filtering ? <Spinner animation="border" size="sm" /> : "Reset"}
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Select Contact</Form.Label>
                        <Form.Select
                            value={contactSelected?.id ?? ""}
                            onChange={(e) => {
                                const selected = contacts.find(c => c.id === parseInt(e.target.value));
                                setContactSelected(selected ?? null);
                            }}
                        >
                            <option value="">-- Choose an unknown contact --</option>
                            {contacts.map(contact => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.name} {contact.surname} {contact.emails.length>0 && <>({contact.emails.join(", ")})</>} {contact.phoneNumber.length>0 && <>({contact.phoneNumber.join(", ")})</>}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

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
                                <Form.Select
                                    name="state"
                                    value={professionalData?.state}
                                    onChange={(e) => setProfessionalData((prev) => ({ ...prev, state: e.target.value }))}
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
                                <Form.Control type="number" step="0.1" value={professionalData?.dailyRate} onChange={(e) => setProfessionalData((prev) => ({ ...prev, dailyRate: parseFloat(e.target.value) }))} />
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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button className="btn-custom" onClick={handleSubmit} disabled={loading || !contactSelected}>
                    {loading ? "Upgrading..." : "Upgrade"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddProfessionalModal;
