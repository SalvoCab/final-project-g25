package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.JobOfferCandidate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JobOfferCandidateRepository : JpaRepository<JobOfferCandidate,Long>{

    fun findByJobOfferIdAndStatus(jobOfferId: Long, status: String): List<JobOfferCandidate>
}
