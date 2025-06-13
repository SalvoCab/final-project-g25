package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.controllers.AssociationAlreadyExistException
import com.example.customer_relationship_management.controllers.InvalidDeletionException
import com.example.customer_relationship_management.controllers.ProfessionalNotFoundException
import com.example.customer_relationship_management.dtos.ProfessionalDTO
import com.example.customer_relationship_management.dtos.ProfessionalKafkaDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.entities.*
import com.example.customer_relationship_management.repositories.ProfessionalRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.*
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service

@Service
class ProfessionalServiceImpl (private val professionalRepository: ProfessionalRepository, private val entityManager: EntityManager, private val kafkaTemplate: KafkaTemplate<String, ProfessionalKafkaDTO>) : ProfessionalService {
    override fun listPaginated(offset: Int, limit: Int,skills: List<Long>?, location: String, state: String, keyword:String): List<ProfessionalDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<Professional> = criteriaBuilder.createQuery(Professional::class.java)
        val root: Root<Professional> = criteriaQuery.from(Professional::class.java)
        val contactJoin = root.join<Professional, Contact>("contact")
        val predicates = mutableListOf<Predicate>()

        if (!skills.isNullOrEmpty()) {
            val skillJoins = skills.map { skillId ->
                val skillJoin = root.join<Professional, Skill>("skills")
                skillJoin.on(criteriaBuilder.equal(skillJoin.get<Long>("id"), skillId)).getOn()
            }.toTypedArray()

            predicates.add(criteriaBuilder.and(*skillJoins))
        }

        if (location.isNotBlank()) {
            val locationLowerCase = location.lowercase()
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get<String>("location")), "%$locationLowerCase%"))
        }
        if (state.isNotBlank()) {
            val stateLowerCase = state.lowercase()
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get<String>("state")), "%$stateLowerCase%"))
        }
        if (keyword.isNotBlank()) {
            val keywordLowerCase = keyword.lowercase()

            val keywordPredicate = criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(contactJoin.get("name")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(contactJoin.get("surname")), "%$keywordLowerCase%")
            )
            predicates.add(keywordPredicate)
        }
        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)
        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }

    override fun createProfessional(location: String, state: String, dailyRate: Double, skills: List<Skill>?, contact: Contact): Professional {
        if (contact.category.lowercase() != "unknown")
            throw AssociationAlreadyExistException("You cannot create a professional to a contact that has category ${contact.category}")
        contact.category="professional"
        val professional = Professional(location,state,dailyRate, contact)
        skills?.forEach{skill ->

            professional.addSkill(skill)
        }

        return professionalRepository.save(professional)
    }

    override fun updateProfessional(location: String, state: String, dailyRate: Double, professional: Professional): Professional {
        professional.location = location
        professional.state = state
        professional.dailyRate = dailyRate
        return professionalRepository.save(professional)
    }

    override fun findById(id: Long): Professional {
        val optionalProfessional = professionalRepository.findById(id)
        if (optionalProfessional.isPresent) {
            return optionalProfessional.get()
        } else {
            throw ProfessionalNotFoundException("Professional not found with ID: $id")
        }
    }

    override fun deleteProfessional(professional: Professional) {
        if (professional.enroles.isNotEmpty())
            throw InvalidDeletionException("you cannot delete a professional that is related to some job offers")
        professional.contact.category="unknown"
        return professionalRepository.delete(professional)
    }

    override fun addProfessionalSkill(professional: Professional, newSkill: Skill): Professional {
        professional.addSkill(newSkill)
        return professionalRepository.save(professional)
    }

    override fun removeProfessionalSkill(professional: Professional, skill: Skill): Professional {
        professional.removeSkill(skill)
        return professionalRepository.save(professional)
    }

}