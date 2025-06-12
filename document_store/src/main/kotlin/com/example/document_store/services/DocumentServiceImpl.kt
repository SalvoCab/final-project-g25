package com.example.document_store.services

import com.example.document_store.controllers.DocumentNotFoundException
import com.example.document_store.dtos.DocumentMetadataDTO
import com.example.document_store.dtos.toDto
import com.example.document_store.entities.DocumentContent
import com.example.document_store.entities.DocumentMetadata
import com.example.document_store.repositories.DocumentRepository
import jakarta.transaction.Transactional
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import java.util.Optional
@Service
class DocumentServiceImpl(private val documentRepository: DocumentRepository, private val kafkaTemplate: KafkaTemplate<String, DocumentMetadataDTO>) : DocumentService{

    @Transactional
    override fun saveDocument(name: String, size: Long, contentType: String, content: ByteArray): DocumentMetadata {
        val documentMetadata = DocumentMetadata(name,size,contentType)
        val documentContent = DocumentContent(documentMetadata.getId(), documentMetadata,content)
        documentMetadata.documentContent = documentContent
        val doc = documentRepository.save(documentMetadata)
        kafkaTemplate.send("DOCUMENT", doc.toDto())
        return documentMetadata
    }

    override fun listAll(): List<DocumentMetadataDTO> {
        return documentRepository.findAll().map{it.toDto()}
    }

    override fun listPaginated(offset: Int, limit: Int): List<DocumentMetadataDTO> {
        val allDocuments = listAll()

        val endIndex = (offset + limit).coerceAtMost(allDocuments.size)

        return allDocuments.subList(offset, endIndex)
    }

   @Transactional
    override fun findByName(name: String): List<DocumentMetadata> {
        return documentRepository.findByName(name)
    }

    override fun findById(id: Long): DocumentMetadata {
        val optionalDocument: Optional<DocumentMetadata> = documentRepository.findById(id)
        if (optionalDocument.isPresent) {
            return optionalDocument.get()
        } else {
            throw DocumentNotFoundException("Document not found with ID: $id")
        }
    }

    override fun delete(id: Long): DocumentMetadata {
        val documentMetadata: DocumentMetadata = findById(id)
        documentRepository.delete(documentMetadata)
        return documentMetadata
    }

    override fun updateDocument(newDocumentMetadata: DocumentMetadataDTO, content:ByteArray): DocumentMetadata {
        val documentId = newDocumentMetadata.id ?: throw IllegalArgumentException("Document ID cannot be null")
        val documentMetadata = findById(documentId)
        documentMetadata.apply {
            name = newDocumentMetadata.name
            size = newDocumentMetadata.size
            contentType = newDocumentMetadata.contentType
            documentContent!!.content = content
        }
        return documentRepository.save(documentMetadata)

    }

    override fun updateDocument(id: Long, name: String): DocumentMetadata {
        val documentMetadata = findById(id)
        documentMetadata.name = name
        return documentRepository.save(documentMetadata)
    }
}
