package com.example.analytics.entities

import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id

@Entity
class ProfessionalAnalytics(
    @Id
    val id: Long? = 0,
    var name: String= "",
    var surname: String= "",
    var location: String= "",
    var state: String = "",
    var dailyRate: Double = 0.0,
    @ElementCollection(fetch = FetchType.EAGER)
    var skills: MutableList<String> = mutableListOf()
)
{

}