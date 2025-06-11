package com.example.customer_relationship_management.dtos

data class JobOfferCandidateRequestDTO(
    val professionalId: Long,
    val status: String? = null,
    val note: String? = null
)