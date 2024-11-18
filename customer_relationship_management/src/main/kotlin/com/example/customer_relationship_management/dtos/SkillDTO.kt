package com.example.customer_relationship_management.dtos

import com.example.customer_relationship_management.entities.Skill


data class SkillDTO (
    val id: Long?,
    val skill: String
)

fun Skill.toDto(): SkillDTO=SkillDTO(this.getId(), this.skill)