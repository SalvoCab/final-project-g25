package com.example.communication_manager.dtos

data class SendEmailDTO(
        val recipient: String,
        val subject: String,
        val body: String
)
