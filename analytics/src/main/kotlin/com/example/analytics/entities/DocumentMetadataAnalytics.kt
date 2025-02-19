package com.example.analytics.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity

class DocumentMetadataAnalytics(

    val metadataID: Long = 0,
    val versionId: Long = 0,
    var name: String?= null,
    var size: Long = 0,
    var contentType: String? = null,
    var creationTimestamp: LocalDateTime? = null
){
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: Long =0
}