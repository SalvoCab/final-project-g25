create sequence address_seq
    increment by 50;

create sequence contact_seq
    increment by 50;

create sequence customer_seq
    increment by 50;

create sequence email_seq
    increment by 50;

create sequence job_offer_seq
    increment by 50;

create sequence message_history_seq
    increment by 50;

create sequence message_seq
    increment by 50;

create sequence phone_number_seq
    increment by 50;

create sequence professional_seq
    increment by 50;

create sequence skill_seq
    increment by 50;

create table if not exists address
(
    id      bigint not null
    primary key,
    address varchar(255)
    );

create table if not exists contact
(
    id       bigint not null
    primary key,
    category varchar(255),
    name     varchar(255),
    ssn_code varchar(255),
    surname  varchar(255)
    );

create table if not exists contact_address
(
    contact_id bigint not null
    constraint fkqqxykpjj1qrgxle7cpp0txicc
    references contact,
    address_id bigint not null
    constraint fka63wvjlxiwgo0098siqj9kjav
    references address,
    primary key (contact_id, address_id)
    );

create table if not exists customer
(
    id         bigint not null
    primary key,
    notes      varchar(255),
    contact_id bigint
    constraint uk_9wi1wa1mp861xeqlfxeyg5t8m
    unique
    constraint fkdw0fbdq1pdvck4bh72ryf4ac
    references contact
    );

create table if not exists email
(
    id   bigint not null
    primary key,
    mail varchar(255)
    );

create table if not exists contact_email
(
    contact_id bigint not null
    constraint fkjhb6oolv2p95xsci34vuoiq00
    references contact,
    email_id   bigint not null
    constraint fk2wlgsyv59totqq1ghc75yvwmc
    references email,
    primary key (contact_id, email_id)
    );

create table if not exists message
(
    id            bigint  not null
    primary key,
    body          varchar(255),
    channel       varchar(255),
    created_date  timestamp(6),
    current_state varchar(255),
    priority      integer not null,
    sender        varchar(255),
    subject       varchar(255)
    );

create table if not exists message_history
(
    id           bigint not null
    primary key,
    comment      varchar(255),
    created_date timestamp(6),
    state        varchar(255),
    message_id   bigint
    constraint fk5cw93icwmtefn9xs1b5xm733p
    references message
    );

create table if not exists phone_number
(
    id     bigint not null
    primary key,
    number varchar(255)
    );

create table if not exists contact_phone_number
(
    contact_id      bigint not null
    constraint fksxodlri1xcqvdvltpgn3r5f45
    references contact,
    phone_number_id bigint not null
    constraint fksx3f2lcspu5pumlj3phn2o4fu
    references phone_number,
    primary key (contact_id, phone_number_id)
    );

create table if not exists professional
(
    id         bigint           not null
    primary key,
    daily_rate double precision not null,
    location   varchar(255),
    state      varchar(255),
    contact_id bigint
    constraint uk_dnuv084kwtrqlgoi001vd457g
    unique
    constraint fk6rhmwdhqticr8ws58i09q6n1r
    references contact
    );

create table if not exists job_offer
(
    id              bigint  not null
    primary key,
    description     varchar(255),
    duration        integer not null,
    notes           varchar(255),
    state           varchar(255),
    value           double precision,
    customer_id     bigint
    constraint fk6sibwaqbyqo4xihjf3mm7adfd
    references customer,
    professional_id bigint
    constraint fkj0upbpkiplvyl75wp59vy8of7
    references professional
    );

create table if not exists skill
(
    id    bigint not null
    primary key,
    skill varchar(255)
    );

create table if not exists joboffer_skill
(
    joboffer_id bigint not null
    constraint fknppnroorbkwrhd3p6ow8l54il
    references job_offer,
    skill_id    bigint not null
    constraint fkmcra2cy898lji0iochgor3qv5
    references skill,
    primary key (joboffer_id, skill_id)
    );

create table if not exists professional_skill
(
    professional_id bigint not null
    constraint fkkv78kjao08pa3qenpc57egqnc
    references professional,
    skill_id        bigint not null
    constraint fkbj7ttbh5vf54jwbox7jfae0lo
    references skill,
    primary key (professional_id, skill_id)
    );
