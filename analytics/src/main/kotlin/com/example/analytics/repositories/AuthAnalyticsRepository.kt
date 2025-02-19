package com.example.analytics.repositories

import com.example.analytics.entities.AuthAnalytics
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository



@Repository
interface AuthAnalyticsRepository : JpaRepository<AuthAnalytics, Long> {


}