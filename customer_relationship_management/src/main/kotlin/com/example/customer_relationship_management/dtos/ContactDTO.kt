package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Contact

data class ContactDTO(val id:Long?, val name:String, val surname:String, val category:String,val ssnCode:String?, val emails: List<String>, val addresses: List<String>, val phoneNumber: List<String>)

    fun Contact.toDto(): ContactDTO=ContactDTO(this.getId(),this.name,this.surname,this.category,this.ssnCode, this.emails.map{ it.mail }, this.addresses.map { it.address }, this.phoneNumbers.map { it.number })
