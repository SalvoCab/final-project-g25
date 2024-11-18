package com.example.customer_relationship_management

import com.example.customer_relationship_management.dtos.CreateJobOfferDTO
import com.example.customer_relationship_management.dtos.JobOfferDTO
import com.example.customer_relationship_management.dtos.UpdateJobOfferStatusDTO
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class JobOfferControllerTests : IntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun gettingAnEmptyListOfJobOffer() {
        mockMvc.get("/joboffers/") {
            accept = MediaType.APPLICATION_JSON
        }
            .andExpect {
                status { isOk() }
                content { contentType(MediaType.APPLICATION_JSON) }
                content {
                    jsonPath("$") {
                        isArray()
                        isEmpty()
                    }
                }
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun createsAJobOffer() {
        val description = "Software Engineer Position"
        val duration = 120
        val customerId = 1L

        val createdJobOffer = objectMapper.writeValueAsString(
            JobOfferDTO(
                2,
                description,
                "Created",
                "Some notes",
                duration,
                null,
                1,
                null,
                listOf("Python")
            )
        )

        val dto = CreateJobOfferDTO(description, "Some notes", duration, listOf(1L))

        mockMvc.perform(
            MockMvcRequestBuilders.post("/joboffers/$customerId/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseDto = result.response.contentAsString
                Assertions.assertEquals(createdJobOffer, responseDto)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun changeAJobOfferState() {
        val description = "Software Development"
        val duration = 120
        val jobOfferId = 1L

        val updatedJobOffer = objectMapper.writeValueAsString(
            JobOfferDTO(
                1,
                description,
                "Selection Phase",
                "let's go in selection phase",
                duration,
                null,
                1,
                null,
                listOf("Python", "Rust")
            )
        )

        val dto = UpdateJobOfferStatusDTO("Selection phase", "let's go in selection phase", null)

        mockMvc.perform(
            MockMvcRequestBuilders.post("/joboffers/$jobOfferId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseDto = result.response.contentAsString
                Assertions.assertEquals(updatedJobOffer, responseDto)
            }
    }


    @Test
    @Sql("/sql/data.sql")
    fun deleteAJobOffer() {
        val jobOfferId = 1L

        val deletedJobOffer = objectMapper.writeValueAsString(JobOfferDTO(
            1L,
            "Software Development",
            "Consolidated",
            "some consolidation note",
            120,
                14586.0,
            1,
            1,
            listOf("Python", "Rust")
        ))

        mockMvc.perform(
            MockMvcRequestBuilders.delete("/joboffers/$jobOfferId")
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseBody = result.response.contentAsString
                Assertions.assertEquals(deletedJobOffer, responseBody)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun getAJobOfferValue() {
        val jobOfferId = 1L
        val expectedJobOfferValue = 14586.0 // Adjust according to your actual value calculation

        mockMvc.perform(MockMvcRequestBuilders.get("/joboffers/$jobOfferId/value"))
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseBody = result.response.contentAsString
                val objectMapper = ObjectMapper()
                val jsonNode = objectMapper.readTree(responseBody)
                val actualJobOfferValue = jsonNode.get("value").asDouble()
                Assertions.assertEquals(expectedJobOfferValue, actualJobOfferValue)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun AddAJobOfferSkill() {
        val jobOfferId = 1L
        val description = "Software Development"
        val duration = 120

        // Define the expected response after adding the skill
        val expectedJobOffer = JobOfferDTO(
            id = 1,
            description = description,
            state = "Consolidated", // Updated state as per actual response
            notes = "some consolidation note", // Updated notes as per actual response
            duration = duration,
            value = 14586.0, // Actual value as per the response
            customer = 1,
            professional = 1, // Actual professional as per the response
            skills = listOf("Python", "Rust", "C++") // Including the new skill added
        )

        // Skill to be added
        val skills = "C++"

        mockMvc.perform(
            MockMvcRequestBuilders.post("/joboffers/$jobOfferId/addskill")
                .contentType(MediaType.APPLICATION_JSON)
                .content((skills))
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseDto = result.response.contentAsString
                val actualJobOffer = objectMapper.readValue(responseDto, JobOfferDTO::class.java)
                Assertions.assertEquals(expectedJobOffer, actualJobOffer)
            }
    }

    @Test
    @Sql("/sql/data.sql")
    fun RemoveAJobOfferSkill() {
        val jobOfferId = 1L
        val description = "Software Development"
        val duration = 120

        // Define the expected response after adding the skill
        val expectedJobOffer = JobOfferDTO(
            id = 1,
            description = description,
            state = "Consolidated", // Updated state as per actual response
            notes = "some consolidation note", // Updated notes as per actual response
            duration = duration,
            value = 14586.0, // Actual value as per the response
            customer = 1,
            professional = 1, // Actual professional as per the response
            skills = listOf("Rust") // Including the new skill added
        )

        // Skill to be added
        val skill = "Python"

        mockMvc.perform(
            MockMvcRequestBuilders.delete("/joboffers/$jobOfferId/skill")
                .contentType(MediaType.APPLICATION_JSON)
                .content(skill)
        )
            .andExpect(status().isOk)
            .andExpect { result ->
                val responseDto = result.response.contentAsString
                val actualJobOffer = objectMapper.readValue(responseDto, JobOfferDTO::class.java)
                Assertions.assertEquals(expectedJobOffer, actualJobOffer)
            }
    }


}