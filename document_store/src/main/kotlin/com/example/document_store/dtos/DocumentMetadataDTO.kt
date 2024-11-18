package com.example.document_store.dtos

import com.example.document_store.entities.DocumentMetadata
import java.time.LocalDateTime



data class DocumentMetadataDTO(val id:Long?, val name:String, val size:Long, val contentType:String, val createdOn: LocalDateTime?)

    fun DocumentMetadata.toDto(): DocumentMetadataDTO=DocumentMetadataDTO(this.getId(),this.name,this.size,this.contentType,this.createdOn)