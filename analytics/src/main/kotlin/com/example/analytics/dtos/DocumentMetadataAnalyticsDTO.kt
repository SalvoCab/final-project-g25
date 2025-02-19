package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class DocumentMetadataAnalyticsDTO (
    @JsonProperty("id") val id :Long,
    @JsonProperty("name")  val name: String,
    @JsonProperty("size")  val size: Long,
    @JsonProperty("contentType")  val contentType: String,
    @JsonProperty("createdOn")  var createdOn: LocalDateTime?,
){

}