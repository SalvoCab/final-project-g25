package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.dtos.JobOfferCandidateDTO
import com.example.customer_relationship_management.dtos.JobOfferDTO
import com.example.customer_relationship_management.entities.Customer
import com.example.customer_relationship_management.entities.JobOffer
import com.example.customer_relationship_management.entities.JobOfferCandidate
import com.example.customer_relationship_management.entities.Professional
import com.example.customer_relationship_management.entities.Skill

interface JobOfferService {
    fun createJobOffer(
        description: String,
        state: String,
        notes: String?,
        duration: Int,
        value: Double?,
        customer: Customer,
        professional: Professional?,
        skills:List<Skill>?
    ): JobOffer

    fun findById(id: Long): JobOffer

    fun listPaginated(offset: Int, limit: Int, state: String, customer: Long, professional: Long): List<JobOfferDTO>

    fun listOpenPaginated(offset: Int, limit: Int, customerId: Long,statesNotAllowed: List<String>): List<JobOfferDTO>

    fun listAcceptedPaginated(offset: Int, limit: Int, professionalId: Long,statesNotAllowed: List<String>): List<JobOfferDTO>

    fun listAbortedPaginated(offset: Int, limit: Int, state:String, customer: Long, professional: Long): List<JobOfferDTO>

    fun updateJobOffer(
        description: String,
        notes: String?,
        duration: Int,
        jobOffer: JobOffer
    ): JobOffer

    fun updateJobOfferStatus(state: String, notes: String?,professional:Professional?, jobOffer: JobOffer): JobOffer

    fun deleteJobOffer(jobOffer: JobOffer): JobOffer

    fun addJobOfferSkill(jobOffer :JobOffer, newSkill: Skill): JobOffer

    fun removeJobOfferSkill(jobOffer :JobOffer, skill: Skill): JobOffer

    fun save(jobOffer: JobOffer): JobOffer

    fun  listCandidateFirstPhase(jobOfferId: Long) : List<JobOfferCandidateDTO>
    fun  listCandidateSecondPhase(jobOfferId: Long) : List<JobOfferCandidateDTO>

    fun findCandidateByID (candidateId:Long) : JobOfferCandidate

    fun updateCandidate(candidate: JobOfferCandidate): JobOfferCandidate
}