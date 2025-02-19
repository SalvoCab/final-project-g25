package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Message
import java.time.LocalDateTime


data class MessageKafkaDTO(
    val id:Long?,
    val sender: String,
    val subject: String,
    val channel : String,
    var currentState: String?= null,
    val priority: Int,
    var createdDate: LocalDateTime?= null,
    var statusTimestamp: LocalDateTime?= null,
)

fun Message.toMessageKafkaDTO(): MessageKafkaDTO =
    MessageKafkaDTO(
        this.getId(),
        this.sender,
        this.subject,
        this.channel,
        this.currentState,
        this.priority,
        this.createdDate,
        this.states.maxByOrNull{ it.createdDate ?: LocalDateTime.now() }?.createdDate
    )