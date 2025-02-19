package com.example.analytics.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity

class DocumentMetadataAnalytics(
    @Id
    val id: Long? = 0,
    var name: String= "",
    var size: Long = 0,
    var contentType: String = "",
    var createdOn: LocalDateTime? = null
){

}