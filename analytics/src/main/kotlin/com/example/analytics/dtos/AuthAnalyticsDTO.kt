package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty

data class AuthAnalyticsDTO(
    @JsonProperty("userId") val userId: String,
    @JsonProperty("username") val name: String?,
)