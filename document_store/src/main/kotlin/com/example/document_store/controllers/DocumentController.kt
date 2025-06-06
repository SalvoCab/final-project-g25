package com.example.document_store.controllers
import com.example.document_store.dtos.DocumentMetadataDTO
import com.example.document_store.dtos.toDto
import com.example.document_store.services.DocumentContentService
import com.example.document_store.services.DocumentService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.slf4j.LoggerFactory
import java.time.LocalDateTime

@RestController
@RequestMapping("/documents")
class DocumentController(private val documentService: DocumentService, private val documentContentService: DocumentContentService) {
    private val logger = LoggerFactory.getLogger(DocumentController::class.java)
    @PostMapping(consumes = ["multipart/form-data"])
    fun uploadDocument(@RequestParam(value = "documento") documento: MultipartFile): ResponseEntity<Any> {

        val found = documentService.findByName(documento.originalFilename?:"")
        if(found.isNotEmpty() || documento.originalFilename=="") {
            throw DuplicateDocumentException("The document with name ${documento.originalFilename} already exist.")
        }else {
            val savedDocument = documentService.saveDocument(
                    name = documento.originalFilename ?: "",
                    size = documento.size,
                    contentType = documento.contentType ?: "",
                    content = documento.bytes
            )
            logger.info("Document name: ${savedDocument.name} with ID: ${savedDocument.getId()} uploaded successfully")
            return ResponseEntity.ok(savedDocument.toDto())
            }
    }

    @GetMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun listAll(@RequestParam(defaultValue = "0") page: Int,@RequestParam(defaultValue = "20") limit : Int): List<DocumentMetadataDTO> {
        val offset = page * limit
        return documentService.listPaginated(offset, limit)
    }

    @GetMapping("/{metadataId}")
    @ResponseStatus(HttpStatus.OK)
    fun getDetailsById(@PathVariable metadataId: Long): ResponseEntity<Any> {
            val document = documentService.findById(metadataId)
            return ResponseEntity.status(HttpStatus.OK).body(document.toDto())
    }

    @GetMapping("/{metadataId}/data/")
    fun downloadDocument(@PathVariable metadataId: Long): ResponseEntity<Any> {
        val document = documentContentService.findById(metadataId)
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${document.document.name}\"")
                .header(HttpHeaders.CONTENT_TYPE, document.document.contentType)
                .body(document.content)
    }

    @DeleteMapping("/{metadataId}")
    fun deleteDocument(@PathVariable metadataId: Long): ResponseEntity<Any> {
        data class DocumentResponse(val id: Long, val name: String, val message: String)
        val deletionResult = documentService.delete(metadataId)
        logger.info("Document with ID '$metadataId' and name '${deletionResult.name}' has been deleted.")
        return ResponseEntity.ok().body(DocumentResponse(metadataId,deletionResult.name,"This document has been deleted"))
    }

    @PutMapping("/{metadataId}")
    fun updateDocument(@PathVariable metadataId: Long,@RequestParam("file") file: MultipartFile): ResponseEntity<Any> {
        documentService.findById(metadataId)
        val found = documentService.findByName(file.originalFilename?:"")
        if (found.isNotEmpty()) {
            val oldDocument = found.find { it.getId() == metadataId }
            if (oldDocument  == null){
                throw DuplicateDocumentException("The document with name ${file.originalFilename} already exist.")
            }
        }
        val newDocument = DocumentMetadataDTO(
                id = metadataId,
                name = file.originalFilename ?: "",
                size = file.size,
                contentType = file.contentType ?: "",
                createdOn = LocalDateTime.now()
        )
        val documentModified = documentService.updateDocument(newDocument, file.bytes).toDto()
        logger.info("Document with ID '$metadataId' and name '${newDocument.name}' uploaded successfully")
        return ResponseEntity.ok(documentModified)
    }
}