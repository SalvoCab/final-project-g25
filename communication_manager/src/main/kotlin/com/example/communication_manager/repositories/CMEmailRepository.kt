package com.example.communication_manager.repositories

import com.example.communication_manager.entities.CMEmail
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CMEmailRepository : JpaRepository<CMEmail, Long> {

}