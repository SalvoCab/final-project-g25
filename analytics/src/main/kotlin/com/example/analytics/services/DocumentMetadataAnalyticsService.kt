package com.example.analytics.services

import com.example.analytics.dtos.DocumentMetadataAnalyticsDTO
import com.example.analytics.entities.DocumentMetadataAnalytics
import com.example.analytics.repositories.DocumentMetadataAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service

@Service
class DocumentMetadataAnalyticsService(private val documentMetadataAnalyticsRepository: DocumentMetadataAnalyticsRepository) {
    @KafkaListener(topics = ["DOCUMENT"], groupId = "consumer-monitoring-group",containerFactory = "kafkaDocumentListenerContainerFactory")
    fun messageListener( document: DocumentMetadataAnalyticsDTO) {

        documentMetadataAnalyticsRepository.save(DocumentMetadataAnalytics(document.id,document.version,document.name,document.size,document.contentType,document.creationTimestamp))


    }

}