package com.example.document_store.services

import com.example.document_store.dtos.DocumentContentDTO
import com.example.document_store.entities.DocumentMetadata
import com.example.document_store.entities.DocumentContent

interface DocumentContentService {

    fun create(id:Long?, document: DocumentMetadata, content:ByteArray): DocumentContentDTO

    fun listAll() : List<DocumentContentDTO>

    fun findById(id:Long): DocumentContent

}