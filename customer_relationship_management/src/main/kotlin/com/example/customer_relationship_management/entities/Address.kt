package com.example.customer_relationship_management.entities

import jakarta.persistence.Entity
import jakarta.persistence.ManyToMany

@Entity
class Address (

    var address:String

) : EntityBase<Long>() {

    @ManyToMany(mappedBy = "addresses")
    val contacts: MutableSet<Contact> = mutableSetOf()

    fun addContact(c:Contact) {
        contacts.add(c)
        c.addresses.add(this)
    }

    fun removeContact(c:Contact) {
        contacts.remove(c)
        c.addresses.remove(this)
    }
}