package com.example.customer_relationship_management.entities

import jakarta.persistence.*


@Entity
class Contact (

    var name: String,
    var surname: String,
    var category :String,
    var ssnCode :String?,

): EntityBase<Long> () {

    @OneToOne(mappedBy = "contact")
    val professional: Professional? = null

    @OneToOne(mappedBy = "contact")
    val customer: Customer? = null

    @ManyToMany
    @JoinTable(name="contact_email",
        joinColumns = [JoinColumn(name="contact_id")],
        inverseJoinColumns = [JoinColumn(name="email_id")]
    )
    val emails: MutableSet<Email> = mutableSetOf()

    fun addEmail(m: Email) {
        emails.add(m)
        m.contacts.add(this)
    }

    fun removeEmail(m: Email) {
        emails.remove(m)
        m.contacts.remove(this)
    }

    @ManyToMany
    @JoinTable(name="contact_address",
        joinColumns = [JoinColumn(name="contact_id")],
        inverseJoinColumns = [JoinColumn(name="address_id")]
    )
    val addresses: MutableSet<Address> = mutableSetOf()

    fun addAddress(a: Address) {
        addresses.add(a)
        a.contacts.add(this)
    }

    fun removeAddress(a: Address) {
        addresses.remove(a)
        a.contacts.remove(this)
    }

    @ManyToMany
    @JoinTable(name="contact_phoneNumber",
        joinColumns = [JoinColumn(name="contact_id")],
        inverseJoinColumns = [JoinColumn(name="phoneNumber_id")]
    )
    val phoneNumbers: MutableSet<PhoneNumber> = mutableSetOf()

    fun addPhoneNumber(p: PhoneNumber) {
        phoneNumbers.add(p)
        p.contacts.add(this)
    }

    fun removePhoneNumber(p: PhoneNumber) {
        phoneNumbers.remove(p)
        p.contacts.remove(this)
    }


}