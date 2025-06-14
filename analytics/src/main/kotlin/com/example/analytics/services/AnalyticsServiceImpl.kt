package com.example.analytics.services

import com.example.analytics.repositories.CustomerAnalyticsRepository
import com.example.analytics.repositories.DocumentMetadataAnalyticsRepository
import com.example.analytics.repositories.JobOfferAnalyticsRepository
import com.example.analytics.repositories.MessageAnalyticsRepository
import com.example.analytics.repositories.ProfessionalAnalyticsRepository
import org.springframework.stereotype.Service

@Service
class AnalyticsServiceImpl(
    private val customerAnalyticsRepository: CustomerAnalyticsRepository,
    private val documentMetadataAnalyticsRepository: DocumentMetadataAnalyticsRepository,
    private val jobOfferAnalyticsRepository: JobOfferAnalyticsRepository,
    private val professionalAnalyticsRepository: ProfessionalAnalyticsRepository,
    private val messageAnalyticsRepository: MessageAnalyticsRepository):AnalyticsService {

    override fun getNumberOfCustomersAndProfessionals(): Pair<Int, Int> {
        val nCustomers = customerAnalyticsRepository.count()
        val nProfessionals = professionalAnalyticsRepository.count()
        return Pair(nCustomers.toInt(), nProfessionals.toInt())
    }

    override fun getNumberOfJobOffersPerStatus(): Map<String, Int> {
        val jobOffers = jobOfferAnalyticsRepository.findAll()
        val jobOffersPerStatus = mutableMapOf<String, Int>()
        for (jobOffer in jobOffers) {
            val status = jobOffer.state
            val count = jobOffersPerStatus.getOrDefault(status, 0) + 1
            jobOffersPerStatus[status] = count
        }
        return jobOffersPerStatus
    }

    override fun getNumberOfProfessionalsPerStatus(): Map<String, Int> {
        val professionals = professionalAnalyticsRepository.findAll()
        val professionalsPerStatus = mutableMapOf<String, Int>()
        for (professional in professionals) {
            val status = professional.state
            val count = professionalsPerStatus.getOrDefault(status, 0) + 1
            professionalsPerStatus[status] = count
        }
        return professionalsPerStatus
    }

    override fun getNumberOfMessagesPerMonth(): Map<String, Int> {
        val messages = messageAnalyticsRepository.findAll()
        val messagesPerMonth = mutableMapOf<String, Int>()

        for (message in messages) {
            val createdDate = message.createdDate
            if (createdDate != null) {
                val year = createdDate.year
                val monthName = createdDate.month.getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH)
                val key = "$monthName-$year"
                val count = messagesPerMonth.getOrDefault(key, 0) + 1
                messagesPerMonth[key] = count
            }
        }
        return messagesPerMonth
    }

    override fun getNumberOfDocumentsPerMonth(): Map<String, Int> {
        val documents = documentMetadataAnalyticsRepository.findAll()
        val documentsPerMonth = mutableMapOf<String, Int>()
        for (document in documents) {
            val createdDate = document.createdOn
            if (createdDate != null) {
                val year = createdDate.year
                val monthName =
                    createdDate.month.getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH)
                val key = "$monthName-$year"
                val count = documentsPerMonth.getOrDefault(key, 0) + 1
                documentsPerMonth[key] = count
            }
        }
        return documentsPerMonth
    }

    override fun getAverageJobOfferValue(): Double? {
        val jobOffers = jobOfferAnalyticsRepository.findAll()
        var totalValue = 0.0
        var count = 0
        for (jobOffer in jobOffers) {
            if (jobOffer.value != null){
                count++
                totalValue += jobOffer.value ?: 0.0
            }
        }
        return if (count == 0) 0.0 else totalValue / count
    }


}