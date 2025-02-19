package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.JobOffer

data class JobOfferKafkaDTO (
    val id:Long?,
    val description : String,
    val state: String,
    val notes: String?,
    val duration: Int,
    val value:Double?,
    val customer: String?,
    val professional: String?,
    val skills: List<String>
)


fun JobOffer.toJobOfferKafkaDTO(): JobOfferKafkaDTO {
    return JobOfferKafkaDTO(
        id = this.getId(),
        description = this.description,
        state = this.state,
        notes = this.notes,
        duration = this.duration,
        value = this.value,
        customer = this.customer?.contact?.let { "${it.name} ${it.surname}" },
        professional = this.professional?.contact?.let { "${it.name} ${it.surname}" },
        skills = this.skills.map { it.skill },
    )
}