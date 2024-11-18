package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.JobOffer

data class JobOfferDTO(
    val id:Long?,
    var description: String,
    var state: String,
    var notes: String?,
    var duration: Int,
    var value: Double?,
    var customer: Long?,
    var professional: Long?,
    var skills : List<String>
)

fun JobOffer.toDto(): JobOfferDTO=JobOfferDTO(this.getId(), this.description, this.state, this.notes, this.duration, this.value, this.customer?.getId(), this.professional?.getId(),this.skills.map { it.skill })