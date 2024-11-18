package com.example.customer_relationship_management.services


import com.example.customer_relationship_management.dtos.SkillDTO
import com.example.customer_relationship_management.entities.Skill

interface SkillService {

    fun createSkill(skill:String): Skill

    fun listPaginated(offset: Int, limit: Int,key:String, sortDirection: SortDirection?): List<SkillDTO>

    fun listAll() : List<SkillDTO>

    fun findById(id:Long): Skill

    fun updateSkill(skill: Skill, newSkill:String): SkillDTO

    fun deleteSkill(skill: Skill): SkillDTO

    fun findBySkill(skill: String): List<Skill>

}