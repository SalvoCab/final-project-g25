package com.example.document_store.repositories

import com.example.document_store.entities.DocumentMetadata
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DocumentRepository : JpaRepository<DocumentMetadata, Long> {
    fun findByName(name:String) : List<DocumentMetadata>
}