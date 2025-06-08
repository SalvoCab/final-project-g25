package com.example.api_gateway.controllers

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate


@RestController
@RequestMapping("/upload")
class UploadController {

    @Autowired
    private lateinit var restTemplate: RestTemplate


    @Value("http://localhost:8052")
    lateinit var servicePath: String


    fun uploadOrUpdateDocument(
        httpMethod: HttpMethod,
        httpHeaders: HttpHeaders,
        file: ByteArray,
        documentId: Long? = null
    ): ResponseEntity<ByteArray> {
        val processedHeaders = httpHeaders.apply {
            remove("Host")
        }
        return restTemplate.exchange(
            if(documentId == null) { "$servicePath/documents" } else { "$servicePath/documents/$documentId" },
            httpMethod,
            HttpEntity(file, processedHeaders),
            ByteArray::class.java
        )
    }

    @PostMapping("/document")
    fun uploadDocument(
        @RequestHeader httpHeaders: HttpHeaders,
        @RequestBody file: ByteArray,
    ): ResponseEntity<*> {
        return uploadOrUpdateDocument(
            HttpMethod.POST,
            httpHeaders,
            file
        )
    }

    @PutMapping("/document/{documentId}")
    fun updateDocument(
        @RequestHeader httpHeaders: HttpHeaders,
        @RequestBody file: ByteArray,
        @PathVariable("documentId") documentId: Long
    ): ResponseEntity<*> {
        return uploadOrUpdateDocument(
            HttpMethod.PUT,
            httpHeaders,
            file,
            documentId
        )
    }

}