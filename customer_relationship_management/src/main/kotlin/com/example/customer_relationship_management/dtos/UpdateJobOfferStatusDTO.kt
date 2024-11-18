package com.example.customer_relationship_management.dtos

data class UpdateJobOfferStatusDTO(
        val state: String,
        val notes: String,
        val professionalId : Long?
)