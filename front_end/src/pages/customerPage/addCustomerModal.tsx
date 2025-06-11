import { useEffect, useState } from "react";
import {Button, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import { ContactDTO } from "../../objects/Contact.ts";
import { ensureCSRFToken } from "../../apis/apiUtils.tsx";
import { createCustomer } from "../../apis/apiCustomer.tsx";
import { listContacts } from "../../apis/apiContact.tsx"; // assuming the path
import "./customerPage.css"
interface AddCustomerModalProps {
    show: boolean;
    onHide: () => void;
    onCustomerAdded: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ show, onHide, onCustomerAdded }) => {
    const [newNotes, setNewNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [contactSelected, setContactSelected] = useState<ContactDTO | null>(null);
    const [contacts, setContacts] = useState<ContactDTO[]>([]);

    // Filter fields
    const [emailFilter, setEmailFilter] = useState("");
    const [numberFilter, setNumberFilter] = useState("");
    const [keywordFilter, setKeywordFilter] = useState("");
    const [filtering, setFiltering] = useState(false);

    const handleSubmit = async () => {
        if (contactSelected === null) return;
        setLoading(true);
        try {
            await ensureCSRFToken();
            await createCustomer(contactSelected.id, newNotes);
            onCustomerAdded();
            onHide();
        } catch (error) {
            alert("Error in creating customer. Even the best of us fail sometimes.");
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

    useEffect(() => {
        if (show){
            setNewNotes("");
            handleClearFilters();
        }

    }, [show]);

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Upgrade a <b>contact</b> to <b>customer</b></Modal.Title>
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

                    <Form.Group className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                        />
                    </Form.Group>
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

export default AddCustomerModal;
