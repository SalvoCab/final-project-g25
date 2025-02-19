package com.example.analytics.entities

import jakarta.persistence.*


@Entity
data class JobOfferAnalytics (
    @Id
    var id:Long = 0,
    var description : String? = null,
    var customer: String? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    var requiredSkills: MutableSet<String> = mutableSetOf(),
    var duration: Long?= null,
    var offerStatus: String? = null,
    var notes: String? = null,
    var professional: String? = null,
    var value:Double? = null
){

}