package com.example.document_store.services
import com.example.document_store.controllers.DocumentNotFoundException


import com.example.document_store.dtos.DocumentContentDTO
import com.example.document_store.dtos.toDto
import com.example.document_store.entities.DocumentMetadata
import com.example.document_store.entities.DocumentContent
import com.example.document_store.repositories.DocumentContentRepository
import org.springframework.stereotype.Service
import java.util.*


@Service
class DocumentContentServiceImpl(
    private val documentContentRepository: DocumentContentRepository): DocumentContentService {

    override fun create(id: Long?, document: DocumentMetadata, content: ByteArray): DocumentContentDTO {
        val docContent = DocumentContent(id, document, content)
        return documentContentRepository.save(docContent).toDto()
    }

    override fun listAll(): List<DocumentContentDTO> {
        return documentContentRepository.findAll().map { it.toDto() }
    }

    override fun findById(id: Long): DocumentContent {
        val optionalDocument: Optional<DocumentContent> = documentContentRepository.findById(id)
        if (optionalDocument.isPresent) {
            return optionalDocument.get()
        } else {
            throw DocumentNotFoundException("Document not found with ID: $id")
        }
    }

}
