package com.example.analytics.entities

import jakarta.persistence.*


@Entity
data class JobOfferAnalytics (
    @Id
    var id:Long? =0,
    var description : String = "",
    var state: String = "",
    var notes: String = "",
    var duration: Int =0,
    var value:Double?=null,
    var customer: String? = null,
    var professional: String? =null,
    @ElementCollection(fetch = FetchType.EAGER)
    var skills: List<String> = listOf(),
){

}