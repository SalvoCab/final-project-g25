package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Professional

class ProfessionalDTO(
        val id: Long?,
        val name:String,
        val surname:String,
        val location:String,
        val state:String,
        val dailyRate: Double,
        val skills: List<String>
)

fun Professional.toDto(): ProfessionalDTO=ProfessionalDTO(this.getId(),this.contact.name,this.contact.surname,this.location,this.state, this.dailyRate, this.skills.map{it.skill})
