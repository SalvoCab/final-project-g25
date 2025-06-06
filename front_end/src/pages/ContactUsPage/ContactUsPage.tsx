import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import {createMessage} from "../../apis/apiMessage.tsx";
import {CreateMessageDTO} from "../../objects/Message.ts";


const ContactUsPage: React.FC = () => {
    const [formData, setFormData] = useState({
        sender: '',
        subject: '',
        body: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const messageData: CreateMessageDTO = {
                ...formData,
                channel: 'email', // default value
                priority: 10      // default value
            };

            await createMessage(messageData); // Utilizzo dell'API createMessage
            alert('Message sent successfully!');
            setFormData({ sender: '', subject: '', body: '' }); // Reset form
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the message');
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Send a message to our operators</h2>

            <Alert variant="info">
                <Alert.Heading>Important Information</Alert.Heading>
                <p>
                    If you are a professional, please include in the message:
                </p>
                <ul>
                    <li>Your hourly rate</li>
                    <li>Your key skills</li>
                    <li>Contact information for getting back to you (phone/email/address)</li>
                </ul>
                <hr />
                <p>
                    If you are a company, please include in the message:
                </p>
                <ul>
                    <li>Description of the open position</li>
                    <li>Number of expected workdays</li>
                    <li>Contact details for follow-up</li>
                </ul>
            </Alert>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Name/Company</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.sender}
                        onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                        required
                        placeholder="Enter your name or the company's name"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="Subject of the message"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={6}
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        required
                        placeholder="Enter your message here with all the necessary information..."
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Send Message
                </Button>
            </Form>
        </Container>
    );
};

export default ContactUsPage;