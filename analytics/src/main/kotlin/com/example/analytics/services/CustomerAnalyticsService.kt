package com.example.analytics.services

import com.example.analytics.dtos.CustomerAnalyticsDTO
import com.example.analytics.entities.CustomerAnalytics
import com.example.analytics.repositories.CustomerAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service

@Service
class CustomerAnalyticsService(
    private val customerAnalyticsRepository: CustomerAnalyticsRepository,
) {

    @KafkaListener(topics = ["CUSTOMER"], groupId = "consumer-monitoring-group",containerFactory = "kafkaCustomerListenerContainerFactory")
    fun createdCustomerListener( customer: CustomerAnalyticsDTO) {
        print("received CUSTOMER")
        val customerRetrieved = customerAnalyticsRepository.findById(customer.id!!)
        if (!customerRetrieved.isPresent) {
            customerAnalyticsRepository.save(
                CustomerAnalytics(
                    customer.id,
                    customer.name,
                    customer.surname,
                    customer.notes!!,

                )
            )

        }else{
            val customer_monitored = customerRetrieved.get()
            customer_monitored.name=customer.name
            customer_monitored.surname=customer.surname
            customer_monitored.notes=customer.notes!!
            customerAnalyticsRepository.save(customer_monitored)
        }

    }

}