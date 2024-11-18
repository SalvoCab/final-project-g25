package com.example.document_store.entities

import jakarta.persistence.*



@Entity
class DocumentContent (

    @Id
    var documentId: Long? = null,

    @OneToOne
    @MapsId
    var document: DocumentMetadata,

    @Lob
    var content: ByteArray,
) {}