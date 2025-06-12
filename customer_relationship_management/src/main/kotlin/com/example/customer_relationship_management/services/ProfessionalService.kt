package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.dtos.ProfessionalDTO
import com.example.customer_relationship_management.entities.Contact
import com.example.customer_relationship_management.entities.Professional
import com.example.customer_relationship_management.entities.Skill

interface ProfessionalService {

    fun listPaginated(offset: Int, limit: Int, skills: List<Long>?, location: String, state: String, keyword:String) : List<ProfessionalDTO>

    fun createProfessional(location: String, state: String, dailyRate: Double, skills: List<Skill>?, contact: Contact): Professional

    fun updateProfessional(location: String, state: String, dailyRate: Double, professional: Professional): Professional

    fun findById(id:Long) : Professional

    fun deleteProfessional(professional: Professional)

    fun addProfessionalSkill(professional :Professional, newSkill:Skill): Professional

    fun removeProfessionalSkill(professional :Professional, skill:Skill): Professional
}