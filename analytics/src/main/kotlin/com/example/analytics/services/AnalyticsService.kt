package com.example.analytics.services


interface AnalyticsService {
    fun getNumberOfCustomersAndProfessionals():Pair<Int,Int>

    fun getNumberOfJobOffersPerStatus():Map<String,Int>

    fun getNumberOfProfessionalsPerStatus():Map<String,Int>

    fun getNumberOfMessagesPerMonth():Map<String,Int>

    fun getNumberOfDocumentsPerMonth():Map<String,Int>

    fun getAverageJobOfferValue():Double?
}