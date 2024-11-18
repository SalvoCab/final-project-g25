package com.example.communication_manager

import com.example.communication_manager.dtos.SendEmailDTO
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders

import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status


@SpringBootTest
@AutoConfigureMockMvc
class EmailControllerTest: IntegrationTest() {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun send_email_successfully() {
        val emailRequest = SendEmailDTO("salvocabras99@gmail.com", "Test section", "You have run the application in the test.")
        val emailRequestJson = objectMapper.writeValueAsString(emailRequest)

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/emails/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emailRequestJson)
        )
                .andExpect(status().isOk)
                .andExpect(content().json("{\"status\":\"Email sent successfully\"}"))
    }

    @Test
    fun send_email_without_a_field() {
        val emailRequest = SendEmailDTO("", "Test section", "You have run the application in the test.")
        val emailRequestJson = objectMapper.writeValueAsString(emailRequest)

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/emails/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emailRequestJson)
        )
                .andExpect(status().isBadRequest)
    }

    @Test
    fun send_email_invalid_email() {
        val emailRequest = SendEmailDTO("hello", "Test section", "You have run the application in the test.")
        val emailRequestJson = objectMapper.writeValueAsString(emailRequest)

        mockMvc.perform(
                MockMvcRequestBuilders.post("/api/emails/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emailRequestJson)
        )
                .andExpect(status().isNotAcceptable)
    }
}