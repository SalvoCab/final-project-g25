package com.example.customer_relationship_management.dtos

data class SendEmailDTO(
    val recipient: String,
    val subject: String,
    val body: String
)