package com.example.customer_relationship_management.entities

import jakarta.persistence.Entity
import jakarta.persistence.ManyToMany


@Entity
class Email(

    var mail:String

) : EntityBase<Long>() {

    @ManyToMany(mappedBy = "emails")
    val contacts: MutableSet<Contact> = mutableSetOf()

    fun addContact(c:Contact) {
        contacts.add(c)
        c.emails.add(this)
    }

    fun removeContact(c:Contact) {
        contacts.remove(c)
        c.emails.remove(this)
    }
}
