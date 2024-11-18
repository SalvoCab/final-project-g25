package com.example.document_store.entities

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime


@Entity
class DocumentMetadata (

    var name: String,
    var size: Long = 0,
    var contentType: String,

    @field:CreationTimestamp
    var createdOn: LocalDateTime? = null,

    @OneToOne(mappedBy = "document", cascade = [CascadeType.ALL])
    var documentContent: DocumentContent? =null,

): EntityBase<Long> ()