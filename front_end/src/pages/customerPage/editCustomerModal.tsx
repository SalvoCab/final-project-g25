import {Button, Form, Modal} from "react-bootstrap";
import {CustomerDTO} from "../../objects/Customer.ts";
import {useEffect, useState} from "react";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";
import { updateCustomer} from "../../apis/apiCustomer.tsx";

interface EditCustomerModalProps {
    customer: CustomerDTO | null;
    show: boolean;
    onHide: () => void;
    onCustomerEdited: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({customer, show, onHide, onCustomerEdited }) => {
    const [newNotes, setNewNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerDTO | null>(null);

    const handleSubmit = async () => {
        if (customer === null ) return
        setLoading(true);
        try {
            await ensureCSRFToken();
            await updateCustomer(customer.id, newNotes );

            onCustomerEdited();
            onHide();
        } catch (error) {
            alert("Error in editing customer");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(show){
            setNewNotes(customer?.notes ?? "");
            setCustomerData(customer);
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Customer notes {customerData? <>({customerData.name} {customerData.surname}) </>: ""}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} value={newNotes ?? ""} onChange={(e) => setNewNotes(e.target.value)} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Editing..." : "Edit"}
                </Button>
            </Modal.Footer>
        </Modal>
    );

};

export default EditCustomerModal;