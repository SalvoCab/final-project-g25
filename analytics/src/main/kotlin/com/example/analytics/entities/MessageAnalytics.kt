package com.example.analytics.entities

import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.time.LocalDateTime

@Entity
class MessageAnalytics(
    @Id
    var id: Long?= null,
    var sender : String ="",
    var subject : String ="",
    var channel: String= "",
    var currentState : String?=null,
    var priority: Int= 0,
    var createdDate: LocalDateTime?= null,
    var statusTimestamp: LocalDateTime?= null,
)