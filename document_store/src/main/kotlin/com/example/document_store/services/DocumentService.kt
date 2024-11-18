package com.example.document_store.services

import com.example.document_store.dtos.DocumentMetadataDTO
import com.example.document_store.entities.DocumentMetadata


interface DocumentService {

    fun saveDocument(name: String, size: Long, contentType: String, content: ByteArray): DocumentMetadata

    fun listAll() : List<DocumentMetadataDTO>

    fun listPaginated(offset: Int, limit: Int): List<DocumentMetadataDTO>
    fun findById(id:Long): DocumentMetadata
    fun findByName(name:String): List<DocumentMetadata>

    fun delete(id:Long): DocumentMetadata

    fun updateDocument(newDocumentMetadata: DocumentMetadataDTO, content:ByteArray): DocumentMetadata

}