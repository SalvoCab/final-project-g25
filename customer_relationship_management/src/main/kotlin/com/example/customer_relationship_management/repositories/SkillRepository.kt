package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.Skill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SkillRepository : JpaRepository<Skill,Long> {

    fun findBySkill(skill: String) : List<Skill>

}