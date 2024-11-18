package com.example.customer_relationship_management.entities

import jakarta.persistence.Entity
import jakarta.persistence.ManyToMany

@Entity
class PhoneNumber (

    var number : String

) : EntityBase<Long>() {

    @ManyToMany(mappedBy = "phoneNumbers")
    val contacts: MutableSet<Contact> = mutableSetOf()

    fun addContact(c:Contact) {
        contacts.add(c)
        c.phoneNumbers.add(this)
    }

    fun removeContact(c:Contact) {
        contacts.remove(c)
        c.phoneNumbers.remove(this)
    }
}