package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.Professional
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProfessionalRepository: JpaRepository<Professional,Long> {
}