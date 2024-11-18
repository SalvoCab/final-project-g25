package com.example.customer_relationship_management

import com.example.customer_relationship_management.dtos.SkillDTO
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
class SkillControllerTests : IntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfSkills() {
        mockMvc.get("/skills/") {
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
    fun createsASkill() {
        val skill ="Javascript"
        val createdSkill = SkillDTO(152, "Javascript")


        mockMvc.perform(
            MockMvcRequestBuilders.post("/skills/")
                .content(skill)
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                // Validate response
                val responseDto = objectMapper.readValue(result.response.contentAsString, SkillDTO::class.java)
                Assertions.assertEquals(createdSkill, responseDto)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun getSkills() {

        val expectedSkills = listOf(
            SkillDTO(51, "Java"),
            SkillDTO(151, "Kotlin"),
            SkillDTO(1, "Python"),
            SkillDTO(101, "Rust"),
        )

        mockMvc.perform(
            MockMvcRequestBuilders.get("/skills")
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                // Validate response
                val responseJson = result.response.contentAsString
                val responseSkills = objectMapper.readValue(responseJson, object : TypeReference<List<SkillDTO>>() {})
                Assertions.assertEquals(expectedSkills, responseSkills)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun deletesASkill() {
        val skillId = 1L

        val deletedSkill = SkillDTO(1L, "Python")

        mockMvc.perform(
            MockMvcRequestBuilders.delete("/skills/$skillId")
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect { result ->
                val responseBody = result.response.contentAsString
                val responseSkill = objectMapper.readValue(responseBody, SkillDTO::class.java)
                Assertions.assertEquals(deletedSkill, responseSkill)
            }
    }

}