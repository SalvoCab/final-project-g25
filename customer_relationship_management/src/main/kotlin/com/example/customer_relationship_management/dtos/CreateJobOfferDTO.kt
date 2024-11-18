package com.example.customer_relationship_management.dtos


data class CreateJobOfferDTO(
    var description: String,
    var notes: String?,
    var duration: Int,
    val skills: List<Long>?
)