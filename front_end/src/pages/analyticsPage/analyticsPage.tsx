import { useEffect, useState } from 'react';
import {
    getNumberOfCustomersAndProfessionals,
    getNumberOfJobOffersPerStatus,
    getNumberOfProfessionalsPerStatus,
    getNumberOfMessagesPerMonth,
    getNumberOfDocumentsPerMonth,
    getAverageJobOfferValue
} from "../../apis/apiAnalytics";

import { Card, Row, Col, Container, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type ChartData = {
    name: string;
    value: number;
};

const JOB_OFFERS_COLORS: Record<string, string> = {
    "Created": "#0088FE",
    "Selection Phase": "#00C49F",
    "Candidate Proposal": "#FFBB28",
    "Consolidated": "#FF8042",
    "Done": "#AF19FF",
    "Aborted": "#FF3333"
};

const PROFESSIONALS_COLORS: Record<string, string> = {
    "Unemployed": "#FF6384",
    "Available for Work": "#36A2EB",
    "Not Available": "#FFCE56"
};

const jobOfferStates = ["Created", "Selection Phase", "Candidate Proposal", "Consolidated", "Done", "Aborted"];
const professionalStates = ["Unemployed", "Available for Work", "Not Available"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AnalyticsDashboard: React.FC = () => {
    const [customersAndProfessionals, setCustomersAndProfessionals] = useState<{ first: number, second: number }>({ first: 0, second: 0 });
    const [jobOffersStatus, setJobOffersStatus] = useState<ChartData[]>([]);
    const [professionalsStatus, setProfessionalsStatus] = useState<ChartData[]>([]);
    const [allMessagesData, setAllMessagesData] = useState<Record<string, number>>({});
    const [allDocumentsData, setAllDocumentsData] = useState<Record<string, number>>({});
    const [messagesPerMonth, setMessagesPerMonth] = useState<ChartData[]>([]);
    const [documentsPerMonth, setDocumentsPerMonth] = useState<ChartData[]>([]);
    const [avgJobOfferValue, setAvgJobOfferValue] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        getNumberOfCustomersAndProfessionals().then((data) => {
            setCustomersAndProfessionals(data);
        });

        getNumberOfJobOffersPerStatus().then((data) => {
            setJobOffersStatus(aggregateJobOffers(convertMapToArray(data)));
        });

        getNumberOfProfessionalsPerStatus().then((data) => {
            setProfessionalsStatus(mapProfessionalsStatus(convertMapToArray(data)));
        });

        getAverageJobOfferValue().then((data) => {
            setAvgJobOfferValue(data);
        });

        getNumberOfMessagesPerMonth().then((data) => {
            setAllMessagesData(data);
            setMessagesPerMonth(normalizeMonthlyData(data, selectedYear));
        });

        getNumberOfDocumentsPerMonth().then((data) => {
            setAllDocumentsData(data);
            setDocumentsPerMonth(normalizeMonthlyData(data, selectedYear));
        });
    }, []);

    useEffect(() => {
        setMessagesPerMonth(normalizeMonthlyData(allMessagesData, selectedYear));
        setDocumentsPerMonth(normalizeMonthlyData(allDocumentsData, selectedYear));
    }, [selectedYear, allMessagesData, allDocumentsData]);

    function convertMapToArray(map: Record<string, number>): ChartData[] {
        return Object.entries(map).map(([key, value]) => ({ name: key, value }));
    }

    function aggregateJobOffers(data: ChartData[]): ChartData[] {
        const aggregated: Record<string, number> = {};
        for (const { name, value } of data) {
            let newName = name;
            if (["AbortedOne", "AbortedTwo", "AbortedThree"].includes(name)) {
                newName = "Aborted";
            }
            aggregated[newName] = (aggregated[newName] ?? 0) + value;
        }
        return jobOfferStates.map(state => ({ name: state, value: aggregated[state] ?? 0 }));
    }

    function mapProfessionalsStatus(data: ChartData[]): ChartData[] {
        const mapping: Record<string, string> = {
            "unemployed": "Unemployed",
            "available_for_work": "Available for Work",
            "not_available": "Not Available"
        };
        const aggregated: Record<string, number> = {};
        for (const { name, value } of data) {
            const mappedName = mapping[name] ?? name;
            aggregated[mappedName] = (aggregated[mappedName] ?? 0) + value;
        }
        return professionalStates.map(state => ({ name: state, value: aggregated[state] ?? 0 }));
    }

    function normalizeMonthlyData(map: Record<string, number>, year: number): ChartData[] {
        const result: ChartData[] = [];

        const monthMap: Record<string, number> = {
            "January": 1, "February": 2, "March": 3, "April": 4,
            "May": 5, "June": 6, "July": 7, "August": 8,
            "September": 9, "October": 10, "November": 11, "December": 12
        };

        const monthlyData: Record<number, number> = {};

        Object.entries(map).forEach(([key, value]) => {
            const [monthStr, yearStr] = key.split("-");
            const parsedYear = parseInt(yearStr);
            const monthNum = monthMap[monthStr];

            if (parsedYear === year && monthNum) {
                monthlyData[monthNum] = value;
            }
        });

        for (let i = 1; i <= 12; i++) {
            result.push({
                name: months[i - 1],
                value: monthlyData[i] ?? 0
            });
        }

        return result;
    }

    const handleYearChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setSelectedYear(parseInt(e.target.value));
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Customers</Card.Title>
                            <Card.Text className="display-4">{customersAndProfessionals.first}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Professionals</Card.Title>
                            <Card.Text className="display-4">{customersAndProfessionals.second}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Average Job Offer Value</Card.Title>
                            <Card.Text className="display-4">{avgJobOfferValue?.toFixed(2) ?? 'N/A'} €</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Job Offers by Status</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={jobOffersStatus} dataKey="value" nameKey="name" outerRadius={100}>
                                        {jobOffersStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={JOB_OFFERS_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Professionals by Status</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={professionalsStatus} dataKey="value" nameKey="name" outerRadius={100}>
                                        {professionalsStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PROFESSIONALS_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Form>
                        <Form.Group controlId="yearSelect">
                            <Form.Label>Select Year:</Form.Label>
                            <Form.Select value={selectedYear} onChange={handleYearChange}>
                                {[2025, 2024, 2023, 2022, 2021].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Messages per Month ({selectedYear})</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={messagesPerMonth}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Documents per Month ({selectedYear})</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={documentsPerMonth}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#ffc658" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AnalyticsDashboard;
