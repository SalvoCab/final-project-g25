package com.example.document_store.dtos


import com.example.document_store.entities.DocumentContent

data class DocumentContentDTO(val id:Long?,val content:ByteArray)

fun DocumentContent.toDto(): DocumentContentDTO=DocumentContentDTO(this.documentId,this.content)