package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.PhoneNumber
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PhoneNumberRepository: JpaRepository<PhoneNumber,Long> {
    fun findByNumber(number: String):PhoneNumber?
}