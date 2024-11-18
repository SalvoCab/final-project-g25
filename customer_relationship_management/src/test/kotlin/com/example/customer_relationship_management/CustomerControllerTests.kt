package com.example.customer_relationship_management

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerTests :IntegrationTest() {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfCustomers() {
        mockMvc.get("/customers/") {
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
    fun createsACustomer() {
        val notes = "some notes"
        val createdCustomer = objectMapper.writeValueAsString(mapOf(
                "id" to 2,
                "name" to "Mario",
                "surname" to "Rossi",
                "notes" to "some notes"))
        val contactId = 51L

        mockMvc.perform(
                MockMvcRequestBuilders.post("/customers/$contactId")
                        .content(notes)
        )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect { result ->
                    val responseDto = result.response.contentAsString
                    Assertions.assertEquals(createdCustomer, responseDto)
                }
    }

    @Test
    @Sql("/sql/data.sql")
    fun updateCustomer_Success() {
        val customerId = 1L
        val updatedNotes = "Updated notes"
        val updatedCustomer = objectMapper.writeValueAsString(mapOf(
                "id" to 1,
                "name" to "John",
                "surname" to "Doe",
                "notes" to "Updated notes"))
        mockMvc.perform(
                MockMvcRequestBuilders.put("/customers/$customerId")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedNotes)
        )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect{ result ->
                    val responseDto = result.response.contentAsString
                    Assertions.assertEquals(updatedCustomer, responseDto)
                }
    }

    @Test
    @Sql("/sql/data.sql")
    fun deleteCustomer_NotFound() {
        val customerId = 2L

        mockMvc.perform(
            MockMvcRequestBuilders.delete("/customers/$customerId")
        )
            .andExpect(MockMvcResultMatchers.status().isNotFound)
    }

    @Test
    @Sql("/sql/data.sql")
    fun deleteCustomer_unauthorized() {
        val customerId = 1

        val deletedCustomer = objectMapper.writeValueAsString(mapOf(
            "id" to 1,
            "name" to "John",
            "surname" to "Doe",
            "notes" to "Updated notes"))

        mockMvc.perform(
            MockMvcRequestBuilders.delete("/customers/$customerId")
        )
            .andExpect(MockMvcResultMatchers.status().isUnauthorized)
    }



}