package com.example.customer_relationship_management.dtos

data class CreateMessageDTO(
    val sender: String,
    val subject: String,
    val body: String,
    val channel: String,
    val priority: Int
)