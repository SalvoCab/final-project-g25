package com.example.customer_relationship_management.repositories

import com.example.customer_relationship_management.entities.Message
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MessageRepository : JpaRepository<Message, Long> {
    fun findBySubjectIgnoreCase(subject:String) :List<Message>
    fun findByCurrentStateIgnoreCase(currentState:String) :List<Message>

}