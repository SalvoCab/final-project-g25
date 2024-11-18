package com.example.customer_relationship_management

import com.example.customer_relationship_management.dtos.*
import com.fasterxml.jackson.core.type.TypeReference
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
class MessageControllerTests : IntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfMessages() {
        mockMvc.get("/messages/") {
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
    fun createsAMessage() {
        val dto = CreateMessageDTO("John@mail.com", "job proposal", "are you intrested?", "email", 1)

        mockMvc.perform(
            MockMvcRequestBuilders.post("/messages/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                // Validate response
                val responseDto = objectMapper.readValue(result.response.contentAsString, MessageDTO::class.java)
                Assertions.assertEquals(dto.sender, responseDto.sender)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun updateMessagePriority() {
        val messageId = 1L
        val priority = 10

        mockMvc.perform(
            MockMvcRequestBuilders.put("/messages/$messageId/priority")
                .contentType(MediaType.APPLICATION_JSON)
                .content(priority.toString())
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                val responseJson = result.response.contentAsString
                val responseMap = objectMapper.readValue(responseJson, object : TypeReference<Map<String, Any>>() {})
                val responsePriority = responseMap["priority"] as Int
                Assertions.assertEquals(priority, responsePriority)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun getMessageHistory() {
        val messageId = 1L
        val expectedHistory = listOf(
            HistoryDTO("Received", "Just received"),
            HistoryDTO("Read", "readed")
        )

        mockMvc.perform(
            MockMvcRequestBuilders.get("/messages/$messageId/history")
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                // Validate response
                val responseJson = result.response.contentAsString
                val responseHistory = objectMapper.readValue(responseJson, object : TypeReference<List<HistoryDTO>>() {})
                Assertions.assertEquals(expectedHistory, responseHistory)
            }
    }

}