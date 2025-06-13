package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Professional


data class ProfessionalKafkaDTO (
    val id:Long?,
    val name : String,
    val surname: String,
    val location: String,
    val state: String,
    val dailyRate:Double?,
    val skills: List<String>
)


fun Professional.toProfessionalKafkaDTO(): ProfessionalKafkaDTO {
    return ProfessionalKafkaDTO(
        id = this.getId(),
        name = this.contact.name,
        surname = this.contact.surname,
        location = this.location,
        state = this.state,
        dailyRate = this.dailyRate,
        skills = this.skills.map { it.skill },
    )
}