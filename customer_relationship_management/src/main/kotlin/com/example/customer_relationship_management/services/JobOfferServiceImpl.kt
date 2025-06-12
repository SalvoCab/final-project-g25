package com.example.customer_relationship_management.services



import com.example.customer_relationship_management.controllers.InvalidStateException
import com.example.customer_relationship_management.dtos.JobOfferCandidateDTO
import com.example.customer_relationship_management.dtos.JobOfferDTO
import com.example.customer_relationship_management.dtos.JobOfferKafkaDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.dtos.toJobOfferKafkaDTO
import com.example.customer_relationship_management.entities.Customer
import com.example.customer_relationship_management.entities.JobOffer
import com.example.customer_relationship_management.entities.JobOfferCandidate
import com.example.customer_relationship_management.entities.Professional
import com.example.customer_relationship_management.entities.Skill
import com.example.customer_relationship_management.repositories.JobOfferCandidateRepository
import com.example.customer_relationship_management.repositories.JobOfferRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.kafka.core.KafkaTemplate

import org.springframework.stereotype.Service

@Service
class JobOfferServiceImpl (
    private val jobOfferRepository: JobOfferRepository,
    private val entityManager: EntityManager,
    private val jobOfferCandidateRepository: JobOfferCandidateRepository,
    private val kafkaTemplate: KafkaTemplate<String, JobOfferKafkaDTO>
) : JobOfferService {
    override fun createJobOffer(
        description: String,
        state: String,
        notes: String?,
        duration: Int,
        value: Double?,
        customer: Customer,
        professional: Professional?,
        skills:List<Skill>?
    ): JobOffer {
        val jb =JobOffer( description, state, notes, duration, value, customer, professional )
        skills?.forEach{skill ->

            jb.addSkill(skill)
        }
        val offer = jobOfferRepository.save(jb)
        kafkaTemplate.send("JOB_OFFER-CREATE",offer.toJobOfferKafkaDTO())
        return offer
    }

    override fun findById(id: Long): JobOffer {
        return jobOfferRepository.getReferenceById(id)
    }

    override fun listPaginated(offset: Int, limit: Int, state: String, customer: Long, professional: Long): List<JobOfferDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<JobOffer> = criteriaBuilder.createQuery(JobOffer::class.java)
        val root: Root<JobOffer> = criteriaQuery.from(JobOffer::class.java)

        val predicates = mutableListOf<Predicate>()

        if (customer != 0L) {
            predicates.add(criteriaBuilder.equal(root.get<Customer>("customer").get<Long>("id"), customer))
        }
        if (professional != 0L) {
            predicates.add(criteriaBuilder.equal(root.get<Professional>("professional").get<Long>("id"), professional))
        }
        if (state.isNotBlank()) {
            val stateLowerCase = state.lowercase()
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get<String>("state")), "%$stateLowerCase%"))
        }

        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)
        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }


    override fun listOpenPaginated(offset: Int, limit: Int, customerId: Long, statesNotAllowed : List<String>): List<JobOfferDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<JobOffer> = criteriaBuilder.createQuery(JobOffer::class.java)
        val root: Root<JobOffer> = criteriaQuery.from(JobOffer::class.java)

        val predicates = mutableListOf<Predicate>()

        predicates.add(criteriaBuilder.equal(root.get<Customer>("customer").get<Long>("id"), customerId))

        statesNotAllowed.forEach { state ->
            predicates.add(criteriaBuilder.notEqual(criteriaBuilder.lower(root.get<String>("state")),state))
        }

        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)
        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }


    override fun listAcceptedPaginated(offset: Int, limit: Int, professionalId: Long, statesNotAllowed: List<String>): List<JobOfferDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<JobOffer> = criteriaBuilder.createQuery(JobOffer::class.java)
        val root: Root<JobOffer> = criteriaQuery.from(JobOffer::class.java)

        val predicates = mutableListOf<Predicate>()

        predicates.add(criteriaBuilder.equal(root.get<Professional>("professional").get<Long>("id"), professionalId))

        statesNotAllowed.forEach { state ->
            predicates.add(criteriaBuilder.notEqual(criteriaBuilder.lower(root.get<String>("state")),state))
        }

        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)
        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }

    override fun listAbortedPaginated(offset: Int, limit: Int, state:String, customer: Long, professional: Long): List<JobOfferDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<JobOffer> = criteriaBuilder.createQuery(JobOffer::class.java)
        val root: Root<JobOffer> = criteriaQuery.from(JobOffer::class.java)

        val predicates = mutableListOf<Predicate>()

        if (customer != 0L) {
            predicates.add(criteriaBuilder.equal(root.get<Customer>("customer").get<Long>("id"), customer))
        }
        if (professional != 0L) {
            predicates.add(criteriaBuilder.equal(root.get<Professional>("professional").get<Long>("id"), professional))
        }

        predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get<String>("state")),state))
        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)
        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }


    override fun updateJobOffer(
        description: String,
        notes: String?,
        duration: Int,
        jobOffer: JobOffer
    ): JobOffer {
        jobOffer.description = if (description != "") description else jobOffer.description
        jobOffer.notes = if (notes != "") notes else jobOffer.notes
        jobOffer.duration = if (duration > 0) duration else jobOffer.duration
        val offer = jobOfferRepository.save(jobOffer)
        kafkaTemplate.send("JOB_OFFER-UPDATE",offer.toJobOfferKafkaDTO())
        return offer
    }

    override fun updateJobOfferStatus(state: String, notes: String?,professional: Professional?, jobOffer: JobOffer): JobOffer {
        when(state.lowercase()){
            "selection phase" -> if(jobOffer.state.lowercase()=="created" || jobOffer.state.lowercase()=="candidate proposal" || jobOffer.state.lowercase()=="consolidated" || jobOffer.state.lowercase()=="done"){
                jobOffer.goToSelectionPhase(notes?:"")
                if(jobOffer.professional!=null){
                    jobOffer.value = null
                    jobOffer.professional!!.state="available_for_work"
                    jobOffer.professional!!.removeJob(jobOffer)
                }

            }else{
                throw InvalidStateException("The job offer can't reach this status(selection phase) from his actual state(${jobOffer.state})")
            }
            "candidate proposal" -> if(jobOffer.state.lowercase()=="selection phase"){
                jobOffer.goToCandidateProposal(notes?:"")

            }else{
                throw InvalidStateException("The job offer can't reach this status(candidate proposal) from his actual state(${jobOffer.state})")
            }
            "consolidated" -> if(jobOffer.state.lowercase()=="candidate proposal"){
                jobOffer.goToConsolidated(notes?:"")
                if (professional != null) {
                    if(professional.state.lowercase()=="available_for_work"){
                        professional.state="employed"
                        professional.addJob(jobOffer)
                        jobOffer.value=professional.dailyRate*jobOffer.duration*1.1
                    }else{
                        throw InvalidStateException("This professional is already cannot be employed")
                    }

                }


            }else{
                throw InvalidStateException("The job offer can't reach this status(consolidated) from his actual state(${jobOffer.state})")
            }
            "done" -> if(jobOffer.state.lowercase()=="consolidated"){
                jobOffer.goToDone(notes?:"")
                if(jobOffer.professional!=null){
                    jobOffer.professional!!.state="available_for_work"
                }

            }else{
                throw InvalidStateException("The job offer can't reach this status(done) from his actual state(${jobOffer.state})")
            }
            "abortedone" -> if(jobOffer.state.lowercase()=="created"){
                jobOffer.goToAbortedOne(notes?:"")
                if(jobOffer.professional!=null){
                    jobOffer.professional!!.state="available_for_work"
                }

            }else{
                throw InvalidStateException("The job offer can't reach this status(aborted) from his actual state(${jobOffer.state})")
            }
            "abortedtwo" -> if(jobOffer.state.lowercase()=="selection phase"){
                jobOffer.goToAbortedTwo(notes?:"")
                if(jobOffer.professional!=null){
                    jobOffer.professional!!.state="available_for_work"
                }

            }else{
                throw InvalidStateException("The job offer can't reach this status(aborted) from his actual state(${jobOffer.state})")
            }
            "abortedthree" -> if(jobOffer.state.lowercase()=="candidate proposal"){
                jobOffer.goToAbortedThree(notes?:"")
                if(jobOffer.professional!=null){
                    jobOffer.professional!!.state="available_for_work"
                }

            }else{
                throw InvalidStateException("The job offer can't reach this status(aborted) from his actual state(${jobOffer.state})")
            }
            else -> throw InvalidStateException("Invalid state with value: $state")
        }
        val offer = jobOfferRepository.save(jobOffer)
        kafkaTemplate.send("JOB_OFFER-UPDATE",offer.toJobOfferKafkaDTO())
        return offer
    }

    override fun deleteJobOffer(jobOffer: JobOffer) : JobOffer{
        val skillsToRemove = ArrayList(jobOffer.skills)
        skillsToRemove.forEach{
            jobOffer.removeSkill(it)
        }
        jobOffer.professional?.removeJob(jobOffer)
        jobOffer.customer?.removeJob(jobOffer)
        jobOfferRepository.delete(jobOffer)
        return jobOffer
    }

    override fun addJobOfferSkill(jobOffer: JobOffer, newSkill: Skill): JobOffer {
        jobOffer.addSkill(newSkill)
        return jobOfferRepository.save(jobOffer)
    }

    override fun removeJobOfferSkill(jobOffer: JobOffer, skill: Skill): JobOffer {
        jobOffer.removeSkill(skill)
        return jobOfferRepository.save(jobOffer)
    }

    override fun save(jobOffer: JobOffer): JobOffer {
        return jobOfferRepository.save(jobOffer)
    }

    override fun listCandidateFirstPhase(jobOfferId: Long): List<JobOfferCandidateDTO> {
        val candidates = jobOfferCandidateRepository.findByJobOfferIdAndStatus(jobOfferId, "selected")
        return candidates.map { it.toDto() }
    }

    override fun listCandidateSecondPhase(jobOfferId: Long): List<JobOfferCandidateDTO> {
        val candidates = jobOfferCandidateRepository.findByJobOfferIdAndStatus(jobOfferId, "Accepted")
        return candidates.map { it.toDto() }
    }

    override fun findCandidateByID (candidateId:Long) : JobOfferCandidate {
        val candidate = jobOfferCandidateRepository.findById(candidateId)
        return candidate.get()
    }

    override fun updateCandidate(candidate: JobOfferCandidate): JobOfferCandidate {
        return jobOfferCandidateRepository.save(candidate)
    }

}