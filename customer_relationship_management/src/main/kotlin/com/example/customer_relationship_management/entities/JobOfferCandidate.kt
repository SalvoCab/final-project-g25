package com.example.customer_relationship_management.entities

import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne

@Entity
class JobOfferCandidate(
    @ManyToOne
    @JoinColumn(name = "joboffer_id")
    var jobOffer: JobOffer,

    @ManyToOne
    @JoinColumn(name = "professional_id")
    var professional: Professional,

    var status: String? = null,
    var note: String? = null
) : EntityBase<Long>()
