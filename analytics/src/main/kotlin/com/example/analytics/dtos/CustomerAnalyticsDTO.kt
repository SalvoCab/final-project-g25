package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty

data class CustomerAnalyticsDTO (
    @JsonProperty("id")  val id:Long?,
    @JsonProperty("name")  val name : String,
    @JsonProperty("surname")  val surname : String,
    @JsonProperty("notes") val notes: String?,
)