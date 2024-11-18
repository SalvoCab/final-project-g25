/*create 3 contacts*/
INSERT INTO Contact (id, name, surname, category, ssn_code) VALUES (nextval('contact_seq'), 'John','Doe', 'unknown', NULL),
                                                                   (nextval('contact_seq'), 'Mario', 'Rossi', 'unknown',  NULL),
                                                                   (nextval('contact_seq'), 'Giuseppe', 'Verdi', 'unknown',  NULL);

/*create 3 emails*/
INSERT INTO Email (id, mail) VALUES (nextval('email_seq'), 'jhondoe1@example.com'),
                                    (nextval('email_seq'), 'email2@example.com'),
                                    (nextval('email_seq'), 'email3@example.com');

/*create 3 addresses*/
INSERT INTO Address (id, address) VALUES (nextval('address_seq'), 'address number 1'),
                                         (nextval('address_seq'), 'address number 51'),
                                         (nextval('address_seq'), 'address number 101');

/*create 3 phone numbers*/
INSERT INTO Phone_Number (id, number) VALUES (nextval('phone_number_seq'), '+391234567001'),
                                             (nextval('phone_number_seq'), '+392222220051'),
                                             (nextval('phone_number_seq'), '+393333330101');

/*create 4 skills*/
INSERT INTO Skill (id, skill) VALUES (nextval('skill_seq'), 'Python'),
                                     (nextval('skill_seq'), 'Java'),
                                     (nextval('skill_seq'), 'Rust'),
                                     (nextval('skill_seq'), 'Kotlin');

/*association emails, addresses,phone numbers to contacts*/
INSERT INTO contact_email (contact_id, email_id) VALUES (1, 1), (1, 51), (101, 101);
INSERT INTO contact_address (contact_id, address_id) VALUES (1, 1), (51, 51), (51, 101),(101, 1);
INSERT INTO contact_phone_number (contact_id, phone_number_id) VALUES (51, 1), (51, 101), (101, 1), (101, 51);

/*contact 1 -> customer*/
INSERT INTO Customer (id, notes, contact_id) VALUES (nextval('customer_seq'), 'some notes', 1);

/*contact 101 -> professional*/
INSERT INTO Professional (id, location, state, daily_rate, contact_id) VALUES (nextval('professional_seq'), 'Italy', 'unemployed', 110.5, 101);
INSERT INTO professional_skill(professional_id,skill_id) VALUES (1,1),(1,51),(1,101),(1,151);

/*job offer given by customer 1*/
INSERT INTO Job_offer (id, description, state, notes, duration, value, customer_id, professional_id) VALUES (nextval('job_offer_seq'), 'Software Development', 'Consolidated', 'some consolidation note', 120, 14586.0, 1, 1);
INSERT INTO joboffer_skill (joboffer_id, skill_id) VALUES (1,1), (1,101);

/*message creation*/
INSERT INTO Message (id, sender, subject, body, channel, current_state, priority, created_date) VALUES (nextval('message_seq'), 'jhondoe1@example.com', 'Greetings', 'Hello!', 'email', 'Read', 5, '2024-05-13 00:00:00');
INSERT INTO Message_history (id, state, comment, created_date, message_id) VALUES (nextval('message_history_seq'), 'Received', 'Just received', '2024-05-13 00:00:00', 1),
                                                                                 (nextval('message_history_seq'), 'Read', 'readed', '2024-05-14 00:00:00', 1);


