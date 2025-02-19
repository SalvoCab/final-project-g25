package com.example.analytics.dtos

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class DocumentMetadataAnalyticsDTO (
    @JsonProperty("historyId") val id :Long,
    @JsonProperty("versionId") val version: Long,
    @JsonProperty("size")  val size: Long,
    @JsonProperty("contentType")  val contentType: String?,
    @JsonProperty("name")  val name: String,
    @JsonProperty("creationTimestamp")  var creationTimestamp: LocalDateTime,
){

}