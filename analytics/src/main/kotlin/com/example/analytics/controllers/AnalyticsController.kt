package com.example.analytics.controllers

import com.example.analytics.services.AnalyticsService
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/analytics")
class AnalyticsController(private val analyticsService: AnalyticsService) {
    private val logger = LoggerFactory.getLogger(AnalyticsController::class.java)

    @RequestMapping("/numberOfCustomersAndProfessionals")
    fun getNumberOfCustomersAndProfessionals():Pair<Int,Int> {
        logger.info("Request received to get number of customers and professionals")
        return analyticsService.getNumberOfCustomersAndProfessionals()
    }

    @RequestMapping("/numberOfJobOffersPerStatus")
    fun getNumberOfJobOffersPerStatus():Map<String,Int> {
        logger.info("Request received to get number of job offers per status")
        return analyticsService.getNumberOfJobOffersPerStatus()
    }

    @RequestMapping("/numberOfProfessionalsPerStatus")
    fun getNumberOfProfessionalsPerStatus():Map<String,Int> {
        logger.info("Request received to get number of professionals per status")
        return analyticsService.getNumberOfProfessionalsPerStatus()
    }

    @RequestMapping("/numberOfMessagesPerMonth")
    fun getNumberOfMessagesPerMonth():Map<String,Int> {
        logger.info("Request received to get number of messages per month")
        return analyticsService.getNumberOfMessagesPerMonth()
    }

    @RequestMapping("/numberOfDocumentsPerMonth")
    fun getNumberOfDocumentsPerMonth():Map<String,Int> {
        logger.info("Request received to get number of documents per month")
        return analyticsService.getNumberOfDocumentsPerMonth()
    }

    @RequestMapping("/averageJobOfferValue")
    fun getAverageJobOfferValue():Double? {
        logger.info("Request received to get average job offer value")
        return analyticsService.getAverageJobOfferValue()
    }
}