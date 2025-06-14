package com.example.analytics.services

import com.example.analytics.dtos.JobOfferAnalyticsDTO
import com.example.analytics.entities.JobOfferAnalytics
import com.example.analytics.repositories.JobOfferAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service

@Service
class JobOfferAnalyticsService(
    private val jobOfferAnalyticsRepository: JobOfferAnalyticsRepository,
) {

    @KafkaListener(topics = ["JOB_OFFER-UPDATE"], groupId = "consumer-monitoring-group",containerFactory = "kafkaJobOfferListenerContainerFactory")
    @KafkaListener(topics = ["JOB_OFFER-CREATE"], groupId = "consumer-monitoring-group",containerFactory = "kafkaJobOfferListenerContainerFactory")
    fun createdJobOfferListener( offer: JobOfferAnalyticsDTO ) {
        print("received JOB_OFFER-CREATE/UPDATE")
        val offerRetrieved = jobOfferAnalyticsRepository.findById(offer.id!!)
        if (!offerRetrieved.isPresent) {
            jobOfferAnalyticsRepository.save(
                JobOfferAnalytics(
                    offer.id,
                    offer.description,
                    offer.state,
                    offer.notes!!,
                    offer.duration,
                    offer.value,
                    offer.customer,
                    offer.professional,
                    offer.skills.toMutableList()))

        }else{
            val offer_monitored = offerRetrieved.get()
            offer_monitored.state=offer.state
            offer_monitored.notes=offer.notes!!
            offer_monitored.value=offer.value
            offer_monitored.description=offer.description
            offer_monitored.skills.clear()
            offer_monitored.skills.addAll(offer.skills)
            offer_monitored.duration=offer.duration
            jobOfferAnalyticsRepository.save(offer_monitored)
        }

    }

}