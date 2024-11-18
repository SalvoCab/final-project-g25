package com.example.customer_relationship_management

import com.example.customer_relationship_management.dtos.ContactDTO
import com.example.customer_relationship_management.dtos.CreateContactDTO
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class ContactControllerTests : IntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfContacts() {
        mockMvc.get("/contacts/") {
            accept = MediaType.APPLICATION_JSON }
            .andExpect { status { isOk() }
                content { contentType(MediaType.APPLICATION_JSON) }
                content { jsonPath("$"){
                    isArray()
                    isEmpty()
                    }
                }
            }
    }


    @Test
    @Sql("/sql/data.sql")
    fun createsAContact() {
        val dto = CreateContactDTO("John", "Doe", "123-456-789", null, null, null)
        val createdContact = ContactDTO(102, "John", "Doe", "unknown", "123-456-789", listOf(), listOf(), listOf())


        mockMvc.perform(
            MockMvcRequestBuilders.post("/contacts/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                // Validate response
                val responseDto = objectMapper.readValue(result.response.contentAsString, ContactDTO::class.java)
                assertEquals(createdContact, responseDto)
            }
    }

    @Test

    fun createsTwoContacts() {
        // Given
        val dto1 = CreateContactDTO("John", "Doe",  "123-456-789",null, null, null)
        val createdContact1 = ContactDTO(1, "John", "Doe", "unknown", "123-456-789", listOf(),listOf(),listOf())

        val dto2 = CreateContactDTO("Mario", "Rossi", "123-456-789",null, null, null)
        val createdContact2 = ContactDTO(2, "Mario", "Rossi", "unknown", "123-456-789",listOf(),listOf(),listOf())


        mockMvc.perform(
            MockMvcRequestBuilders.post("/contacts/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto1))
        )
        // When-Then
        mockMvc.perform(
            MockMvcRequestBuilders.post("/contacts/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto2))
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                // Validate response
                val responseDto = objectMapper.readValue(result.response.contentAsString, ContactDTO::class.java)
                assertEquals(createdContact2, responseDto)
                assertNotEquals(createdContact1, responseDto)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun deletesAContact() {

        val deletedContact = objectMapper.writeValueAsString(mapOf("id" to 51, "name" to "Mario", "surname" to "Rossi"))
        val contactIdToDelete = 51L // Change this to the actual ID of the contact you want to delete
        mockMvc.perform(
                MockMvcRequestBuilders.delete("/contacts/$contactIdToDelete")
        )
                .andExpect(status().isOk)
                .andExpect { result ->
                    val responseBody = result.response.contentAsString
                    assertEquals(deletedContact, responseBody)
                }
    }

    @Test
    @Sql("/sql/data.sql")
    fun deleteContactEmail_Success() {
        val contactId = 1L
        val emailId = 1L
        val deletedEmail = objectMapper.writeValueAsString(mapOf("id_mail" to 1, "email" to "jhondoe1@example.com"))
        mockMvc.perform(
                MockMvcRequestBuilders.delete("/contacts/$contactId/email/$emailId")
        )
                .andExpect(status().isOk)
                .andExpect{result ->
                    val responseBody = result.response.contentAsString
                    assertEquals(deletedEmail, responseBody)
                }
    }

    @Test
    @Sql("/sql/data.sql")
    fun deleteContactEmail_NotAssociated() {
        val contactId = 1L
        val emailId = 101L //email not associated at the contact 1

        mockMvc.perform(
                MockMvcRequestBuilders.delete("/contacts/$contactId/email/$emailId")
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andExpect(status().isUnauthorized) // UNAUTHORIZED in case of no association
    }
}