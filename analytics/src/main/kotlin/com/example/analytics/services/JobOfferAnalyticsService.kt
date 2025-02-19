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
        val offerRetrived = jobOfferAnalyticsRepository.findById(offer.id)
        if (!offerRetrived.isPresent) {
            jobOfferAnalyticsRepository.save(
                JobOfferAnalytics(
                    offer.id,offer.description,offer.customer,
                    offer.requiredSkills,offer.duration,
                    offer.offerStatus,offer.notes,offer.professional,offer.value))

        }else{
            val offer_monitored = offerRetrived.get()
            offer_monitored.offerStatus=offer.offerStatus
            offer_monitored.notes=offer.notes
            offer_monitored.value=offer.value
            offer_monitored.description=offer.description
            offer_monitored.requiredSkills=offer.requiredSkills
            offer_monitored.duration=offer.duration
            jobOfferAnalyticsRepository.save(offer_monitored)
        }

    }


    /*   fun updatedJobOfferListener( offer: JobOfferMonitoringDTO ) {
               print("received JOB_OFFER-UPDATE")
               val offer_monitored = jobOfferMonitoringRepository.findById(offer.id).get()
               offer_monitored.offerStatus=offer.offerStatus
               offer_monitored.notes=offer.notes
               offer_monitored.value=offer.value
               offer_monitored.description=offer.description
               offer_monitored.requiredSkills=offer.requiredSkills
               offer_monitored.duration=offer.duration
               jobOfferMonitoringRepository.save(offer_monitored)
       }*/
}