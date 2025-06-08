import { useEffect, useState } from "react";
import {BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import "./App.css";
import Navbar from "./components/navbar/navbar";
import Sidebar from "./components/sidebar/sidebar.tsx";
import ProfilePage from "./pages/profilePage/profilePage";
import { Container, Row, Col, Card } from "react-bootstrap";
import AddJobOfferPage from "./pages/jobOfferPage/JobOfferPage";
import ListJobOffers from "./pages/jobOfferPage/JobOfferList.tsx";
import ListContacts from "./pages/contactPage/contactPage.tsx";
import ContactUsPage from "./pages/ContactUsPage/ContactUsPage.tsx";
import ListMessages from "./pages/MessagesPage/MessagesPage.tsx";
import ListDocuments from "./pages/DocumentsPage/DocumentsPage.tsx";
import ListProfessionals from "./pages/professionalPage/professionalPage.tsx";
import ListCustomers from "./pages/customerPage/customerPage.tsx";

export interface MeInterface {
    name: string;
    loginUrl: string;
    logoutUrl: string;
    principal: {
        username: string;
        givenName: string;
        familyName: string;
        email: string;
    } | null;
    role: string;
    xsrfToken: string;
}

function HomeUnautheticated() {
    // Mostra la homepage descrittiva di default; mostra ContactUsPage se la route è "/contact-us".
    return (
        <Container className="py-5">
            {/* Hero Section */}
            <Row className="text-center mb-5">
                <Col>
                    <h1 className="display-4 mb-5">The platform that connects talent and opportunity</h1>
                    <div className="decorative-line-gradient"></div>
                </Col>
            </Row>

            {/* Box Section */}
            <Row className="mb-5 gx-4">
                <Col md={6}>
                    <Card className="h-100 custom-card">
                        <Card.Body className="d-flex align-items-center justify-content-center p-5">
                            <h3 className="text-center">Are you a company looking for reliable professionals?</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 custom-card">
                        <Card.Body className="d-flex align-items-center justify-content-center p-5">
                            <h3 className="text-center">Are you a professional ready to showcase your skills?</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Value Proposition */}
            <Row className="mb-5">
                <Col lg={8} className="mx-auto text-center">
                    <p className="lead">
                        Our platform was created to build real, targeted connections between job providers and job seekers. Unlike automated portals, every
                        job listing here is personally managed by our team, ensuring quality and the perfect match.
                    </p>
                </Col>
            </Row>

            {/* Process Steps */}
            <Row className="mb-5 gx-4">
                <Col md={4}>
                    <div className="process-step text-center p-4">
                        <p className="lead mb-0">Companies send us open positions.</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="process-step text-center p-4">
                        <p className="lead mb-0">Professionals submit their CV and skills.</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="process-step text-center p-4">
                        <p className="lead mb-0">Our manager takes care of the rest.</p>
                    </div>
                </Col>
            </Row>

            {/* Bottom CTA Section */}
            <Row className="text-center mt-5">
                <Col>
                    <h3 className="mb-4">Simple. Human. Effective.</h3>
                    <p className="lead mb-4">
                        Get in touch with us today and start building your next success, whether you're looking for top talent or your next professional
                        opportunity.
                    </p>
                    <Link
                        className="btn btn-contact-filled"
                        to="/contact-us"
                    >
                        Contact Us
                    </Link>
                </Col>
            </Row>
        </Container>
    );
}

function App() {
    const [me, setMe] = useState<MeInterface | null>(null);

    const fetchMe = async () => {
        try {
            const res = await fetch("/me");
            const meData = (await res.json()) as MeInterface;
            setMe(meData);
        } catch (error) {
            setMe(null);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <Router>
            <Navbar me={me} />
            <main>
                {/* Per utenti autenticati */}
                {me && me.principal ? (
                    <Container fluid>
                        <Row>
                            <Col md={3} lg={2} className="sidebar-wrapper p-0">
                                <Sidebar />
                            </Col>
                            <Col md={9} lg={10} className="main-content">
                                <Routes>
                                    <Route path="/" element={<h2>Welcome to the Management System</h2>} />
                                    <Route path="/profile" element={<ProfilePage me={me} />} />
                                    <Route path="/job-offers" element={<AddJobOfferPage customerId={42} availableSkills={[{ id: 1, name: "Java" }, { id: 2, name: "Kotlin" }]} />} />
                                    <Route path="/job-offers-list" element={<ListJobOffers />} />
                                    <Route path="/contacts" element={<ListContacts me={me} />} />
                                    <Route path="/professionals" element={<ListProfessionals me={me} />}/>
                                    <Route path="/customers" element={<ListCustomers me={me} />}/>
                                    <Route path="/messages" element={<ListMessages/>}/>
                                    <Route path="/documents" element={<ListDocuments me={me}/>}/>
                                </Routes>
                            </Col>
                        </Row>
                    </Container>
                ) : (
                    // Per utenti non autenticati
                    <Routes>
                        <Route path="/ui" element={<HomeUnautheticated />} />
                        <Route path="/contact-us" element={<ContactUsPage />} />
                    </Routes>
                )}
            </main>
            <footer>
                <p>© 2024 Match&Work</p>
            </footer>
        </Router>
    );
}

export default App;