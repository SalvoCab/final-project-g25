package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Customer

data class CustomerDTO (
        val id: Long?,
        val name:String,
        val surname:String,
        val notes:String?
)

fun Customer.toDto(): CustomerDTO=CustomerDTO(this.getId(),this.contact.name,this.contact.surname, this.notes)
