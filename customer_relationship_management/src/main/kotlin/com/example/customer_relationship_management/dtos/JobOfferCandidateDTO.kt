package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.JobOfferCandidate

data class JobOfferCandidateDTO(
    val professional: ProfessionalDTO,
    val candidateId: Long?,
    var status: String?,
    var note: String?,
)

fun JobOfferCandidate.toDto(): JobOfferCandidateDTO= JobOfferCandidateDTO(this.professional.toDto(),this.getId(), this.status, this.note)