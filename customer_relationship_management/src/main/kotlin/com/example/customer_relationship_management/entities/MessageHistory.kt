package com.example.customer_relationship_management.entities

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
class MessageHistory (

    var state:String,

    var comment:String,

    @field:CreationTimestamp
    var createdDate: LocalDateTime? = null,

    @ManyToOne(cascade = [CascadeType.ALL])
    var message: Message

): EntityBase<Long> ()
