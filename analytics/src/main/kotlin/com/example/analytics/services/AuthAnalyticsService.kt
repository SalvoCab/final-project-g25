package com.example.analytics.services

import com.example.analytics.dtos.AuthAnalyticsDTO
import com.example.analytics.entities.AuthAnalytics
import com.example.analytics.repositories.AuthAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.support.KafkaHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Service

@Service
class AuthAnalyticsService(
    private val authAnalyticsRepository: AuthAnalyticsRepository,
) {

    @KafkaListener(topics = ["IAM-LOGIN"], groupId = "consumer-monitoring-group",containerFactory = "kafkaAuthListenerContainerFactory")
    fun loginListener(@Header(KafkaHeaders.RECEIVED_TIMESTAMP) ts: Long, message: AuthAnalyticsDTO ) {
        authAnalyticsRepository.save(AuthAnalytics(username  =message.name,loginTime = ts))
    }
}