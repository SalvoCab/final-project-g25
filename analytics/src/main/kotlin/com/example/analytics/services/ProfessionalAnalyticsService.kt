package com.example.analytics.services


import com.example.analytics.dtos.ProfessionalAnalyticsDTO
import com.example.analytics.entities.ProfessionalAnalytics
import com.example.analytics.repositories.ProfessionalAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service


@Service
class ProfessionalAnalyticsService(
    private val professionalAnalyticsRepository: ProfessionalAnalyticsRepository,
) {
    @KafkaListener(topics = ["PROFESSIONAL-CREATE"], groupId = "consumer-monitoring-group",containerFactory = "kafkaProfessionalListenerContainerFactory")
    @KafkaListener(topics = ["PROFESSIONAL-UPDATE"], groupId = "consumer-monitoring-group",containerFactory = "kafkaProfessionalListenerContainerFactory")
    fun createdProfessionalListener( professional: ProfessionalAnalyticsDTO) {
        print("received PROFESSIONAL-CREATE/UPDATE")
        val professionalRetrieved = professionalAnalyticsRepository.findById(professional.id!!)
        if (!professionalRetrieved.isPresent) {
            professionalAnalyticsRepository.save(
                ProfessionalAnalytics(
                    professional.id,
                    professional.name,
                    professional.surname,
                    professional.location,
                    professional.state,
                    professional.dailyRate,
                    professional.skills.toMutableList()
                )
            )
        } else {
            val professional_monitored = professionalRetrieved.get()
            professional_monitored.name = professional.name
            professional_monitored.surname = professional.surname
            professional_monitored.location = professional.location
            professional_monitored.state = professional.state
            professional_monitored.dailyRate = professional.dailyRate
            professional_monitored.skills.clear()
            professional_monitored.skills.addAll(professional.skills)

            professionalAnalyticsRepository.save(professional_monitored)
        }

    }

}