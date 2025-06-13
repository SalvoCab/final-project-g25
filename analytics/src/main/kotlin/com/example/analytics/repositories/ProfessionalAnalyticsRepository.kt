package com.example.analytics.repositories

import com.example.analytics.entities.ProfessionalAnalytics
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.stereotype.Repository

@EnableJpaRepositories
@Repository
interface ProfessionalAnalyticsRepository:JpaRepository<ProfessionalAnalytics,Long> {

}