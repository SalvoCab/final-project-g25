package com.example.analytics.repositories

import com.example.analytics.entities.MessageAnalytics
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MessageAnalyticsRepository : JpaRepository<MessageAnalytics, Long> {

}