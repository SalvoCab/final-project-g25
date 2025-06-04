import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createContact } from "../../apis/apiContact";
import { createCustomer } from "../../apis/apiCustomer";
import { createProfessional } from "../../apis/apiProfessional.tsx";
import { CreateContactDTO } from "../../objects/Contact";
import { CreateProfessionalDTO } from "../../objects/Professional.ts";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";

interface AddContactModalProps {
    show: boolean;
    onHide: () => void;
    onContactCreated: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ show, onHide, onContactCreated }) => {
    const [contactData, setContactData] = useState<CreateContactDTO>({
        name: "",
        surname: "",
        emails: [],
        addresses: [],
        phoneNumbers: [],
    });

    const [category, setCategory] = useState<"unknown" | "customer" | "professional">("unknown");

    const [professionalData, setProfessionalData] = useState<CreateProfessionalDTO>({
        location: "",
        state: "",
        dailyRate: 0,
        skills: [],
    });

    const [customerNotes, setCustomerNotes] = useState<string | null>("");

    const [loading, setLoading] = useState(false);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            await ensureCSRFToken(); // <--- assicurati che il token ci sia

            const contact = await createContact({ ...contactData });

            if (category === "professional") {
                await ensureCSRFToken(); // <--- assicurati che il token ci sia
                await createProfessional(contact.id, professionalData);
            } else if (category === "customer") {
                await ensureCSRFToken(); // <--- assicurati che il token ci sia
                await createCustomer(contact.id, customerNotes);
            }

            onContactCreated(); // Refresh lista
            onHide(); // Chiudi modal
        } catch (error) {
            alert("Errore durante la creazione del contatto");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Aggiungi Contatto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control name="name" value={contactData.name} onChange={handleContactChange} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Cognome</Form.Label>
                                <Form.Control name="surname" value={contactData.surname} onChange={handleContactChange} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Categoria</Form.Label>
                        <Form.Select value={category} onChange={(e) => setCategory(e.target.value as any)}>
                            <option value="unknown">Unknown</option>
                            <option value="customer">Customer</option>
                            <option value="professional">Professional</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Extra per categoria */}
                    {category === "professional" && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control value={professionalData.location} onChange={(e) => setProfessionalData(prev => ({ ...prev, location: e.target.value }))} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Control value={professionalData.state} onChange={(e) => setProfessionalData(prev => ({ ...prev, state: e.target.value }))} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Daily Rate</Form.Label>
                                <Form.Control type="number" value={professionalData.dailyRate} onChange={(e) => setProfessionalData(prev => ({ ...prev, dailyRate: Number(e.target.value) }))} />
                            </Form.Group>
                        </>
                    )}

                    {category === "customer" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Note Cliente</Form.Label>
                            <Form.Control as="textarea" rows={3} value={customerNotes ?? ""} onChange={(e) => setCustomerNotes(e.target.value)} />
                        </Form.Group>
                    )}

                    {/* Email, indirizzi e telefoni (separati da virgola) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Email(s)</Form.Label>
                        <Form.Control placeholder="email1@example.com, email2@example.com"
                                      onChange={(e) => setContactData(prev => ({ ...prev, emails: e.target.value.split(',').map(x => x.trim()) }))} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Indirizzo/i</Form.Label>
                        <Form.Control placeholder="Via Roma 1, Via Verdi 2"
                                      onChange={(e) => setContactData(prev => ({ ...prev, addresses: e.target.value.split(',').map(x => x.trim()) }))} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Numero/i di Telefono</Form.Label>
                        <Form.Control placeholder="123456, 7891011"
                                      onChange={(e) => setContactData(prev => ({ ...prev, phoneNumbers: e.target.value.split(',').map(x => x.trim()) }))} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Annulla</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddContactModal;
