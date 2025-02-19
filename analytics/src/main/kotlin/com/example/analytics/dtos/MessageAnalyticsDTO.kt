package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class MessageAnalyticsDTO(
    @JsonProperty("id") var id: Long?,
    @JsonProperty("sender") var sender: String,
    @JsonProperty("subject") var subject: String,
    @JsonProperty("channel") var channel: String,
    @JsonProperty("currentState") var currentState: String?,
    @JsonProperty("priority") var priority: Int,
    @JsonProperty("createdDate") var createdDate: LocalDateTime?,
    @JsonProperty("statusTimestamp") var statusTimestamp: LocalDateTime?,
)