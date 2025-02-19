package com.example.analytics.entities

import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.time.LocalDateTime

@Entity
class MessageAnalytics(
    @Id
    var idMessage: String?= null,
    var channel: String?= null,
    var priority: Int?= 0,
    var creationTimestamp: LocalDateTime?= null,
    var status: String?= null,
    var statusTimestamp: LocalDateTime?= null,
)