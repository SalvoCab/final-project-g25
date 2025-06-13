package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty

data class ProfessionalAnalyticsDTO (
    @JsonProperty("id")  val id:Long?,
    @JsonProperty("name")  val name : String,
    @JsonProperty("surname")  val surname : String,
    @JsonProperty("location") val location: String,
    @JsonProperty("state") val state: String,
    @JsonProperty("dailyRate")  val dailyRate:Double,
    @JsonProperty("skills") val skills: List<String>

)