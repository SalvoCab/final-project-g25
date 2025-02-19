package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty

data class JobOfferAnalyticsDTO (
    @JsonProperty("id")  val id:Long?,
    @JsonProperty("description")  val description : String,
    @JsonProperty("state")  val state : String,
    @JsonProperty("notes") val notes: String?,
    @JsonProperty("duration") val duration: Int,
    @JsonProperty("value")  val value:Double?,
    @JsonProperty("customer") val customer: String?,
    @JsonProperty("professional") val professional: String?,
    @JsonProperty("skills") val skills: List<String>

)