package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.controllers.SkillNotFoundException
import com.example.customer_relationship_management.dtos.SkillDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.entities.Skill
import com.example.customer_relationship_management.repositories.SkillRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.*
import org.springframework.stereotype.Service
import java.util.*


@Service
class SkillServiceImpl (private val skillRepository: SkillRepository,private val entityManager: EntityManager) : SkillService {
    override fun createSkill(skill: String): Skill {
        return skillRepository.save(Skill(skill))
    }

    override fun listPaginated(offset: Int, limit: Int, key: String, sortDirection: SortDirection?): List<SkillDTO> {

        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<Skill> = criteriaBuilder.createQuery(Skill::class.java)
        val skillRoot: Root<Skill> = criteriaQuery.from(Skill::class.java)

        var predicate: Predicate? = null

        if (key.isNotBlank()) {
            val keywordLowerCase = key.lowercase()
            predicate = criteriaBuilder.like(criteriaBuilder.lower(skillRoot.get("skill")), "%$keywordLowerCase%")
        }

        if (predicate != null) {
            criteriaQuery.where(predicate)
        }

        if (sortDirection != null) {
            val order: Order = when (sortDirection) {
                SortDirection.ASC -> criteriaBuilder.asc(skillRoot.get<String>("skill"))
                SortDirection.DESC -> criteriaBuilder.desc(skillRoot.get<String>("skill"))
            }
            criteriaQuery.orderBy(order)
        }

        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }

    override fun listAll(): List<SkillDTO> {
        return skillRepository.findAll().map{it.toDto()}
    }

    override fun findById(id: Long): Skill {
        val optionalSkill: Optional<Skill> = skillRepository.findById(id)
        if (optionalSkill.isPresent) {
            return optionalSkill.get()
        } else {
            throw SkillNotFoundException("Skill not found with ID: $id")
        }
    }

    override fun updateSkill(skill: Skill,newSkill:String): SkillDTO {
        skill.skill=newSkill
        return skillRepository.save(skill).toDto()
    }

    override fun deleteSkill(skill:Skill): SkillDTO {
        skill.professionals.forEach{
            skill.removeProfessional(it)
        }
        skill.jobOffers.forEach{
            skill.removeJobOffer(it)
        }
        skillRepository.delete(skill)
        return skill.toDto()
    }

    override fun findBySkill(skill: String): List<Skill> {
        return skillRepository.findBySkill(skill)
    }

}