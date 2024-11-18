package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Message
import java.time.LocalDateTime

data class MessageDTO(
        val id: Long?,
        val sender: String,
        val subject: String,
        val body: String,
        val channel: String,
        val currentState: String,
        val priority: Int,
        val createdDate: LocalDateTime?
)

fun Message.toDto(): MessageDTO=MessageDTO(this.getId(), this.sender, this.subject, this.body, this.channel, this.currentState, this.priority, this.createdDate)