package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Customer

data class CustomerKafkaDTO(
    val id:Long?,
    val name: String,
    val surname: String,
    val notes : String?,

)

fun Customer.toCustomerKafkaDTO(): CustomerKafkaDTO =
    CustomerKafkaDTO(
        this.getId(),
        this.contact.name,
        this.contact.surname,
        this.notes,

    )

