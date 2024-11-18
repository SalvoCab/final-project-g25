package com.example.document_store

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status




@SpringBootTest
@AutoConfigureMockMvc
class DocumentStoreApplicationTests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun testUploadDocument() {
        val file = MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".toByteArray())

        mockMvc.perform(post("/documents").content(file.bytes))
            .andExpect(status().isOk)
    }

    @Test
    fun testUploadDocumentDuplicate() {
        val file = MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".toByteArray())
        mockMvc.perform(MockMvcRequestBuilders.multipart("/documents").file(file))
            .andExpect(status().isConflict)
    }

    @Test
    fun testListAllDocuments() {
        mockMvc.perform(MockMvcRequestBuilders.get("/documents"))
            .andExpect(status().isOk)
    }

    @Test
    fun testGetDetailsById() {
        mockMvc.perform(MockMvcRequestBuilders.get("/documents/{metadataId}", 1))
            .andExpect(status().isOk)
    }

    @Test
    fun testDownloadDocument() {
        mockMvc.perform(MockMvcRequestBuilders.get("/documents/{metadataId}/data", 1))
            .andExpect(status().isOk)
    }

    @Test
    fun testUpdateDocument() {
        val file = MockMultipartFile("file", "test.txt", "text/plain", "Updated content".toByteArray())
        mockMvc.perform(MockMvcRequestBuilders.multipart("/documents/{metadataId}", 1).file(file))
            .andExpect(status().isOk)
    }

    @Test
    fun testDeleteDocument() {
        mockMvc.perform(MockMvcRequestBuilders.delete("/documents/{metadataId}", 1))
            .andExpect(status().isOk)
    }


}
