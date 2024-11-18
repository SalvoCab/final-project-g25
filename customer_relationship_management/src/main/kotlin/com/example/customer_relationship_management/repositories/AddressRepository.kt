package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.Address
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AddressRepository: JpaRepository<Address, Long> {
    fun findByAddress(address: String):Address?
}