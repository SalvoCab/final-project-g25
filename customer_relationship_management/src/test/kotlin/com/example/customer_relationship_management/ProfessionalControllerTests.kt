package com.example.customer_relationship_management

import com.example.customer_relationship_management.dtos.CreateProfessionalDTO
import com.example.customer_relationship_management.dtos.ProfessionalDTO
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
class ProfessionalControllerTests : IntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfProfessional() {
        mockMvc.get("/professionals/") {
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
    fun createsAProfessional() {
        val dto = CreateProfessionalDTO("Italy","Unemployed", 27.4, listOf(1L,101L))
        val createdProfessional = objectMapper.writeValueAsString(ProfessionalDTO(2,"Mario","Rossi","Italy", "Unemployed",27.4, listOf("Python","Rust")))
        val contactId = 51L

        mockMvc.perform(
                MockMvcRequestBuilders.post("/professionals/$contactId")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
        )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect { result ->
                    val responseDto = result.response.contentAsString
                    Assertions.assertEquals(createdProfessional, responseDto)
                }
    }
}