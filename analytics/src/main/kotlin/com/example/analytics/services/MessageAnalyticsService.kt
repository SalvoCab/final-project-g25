package com.example.analytics.services


import com.example.analytics.dtos.MessageAnalyticsDTO
import com.example.analytics.entities.MessageAnalytics
import com.example.analytics.repositories.MessageAnalyticsRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service


@Service
class MessageAnalyticsService(private val messageAnalyticsRepository: MessageAnalyticsRepository) {
    @KafkaListener(topics = ["MESSAGE"], groupId = "group1",containerFactory = "kafkaMessageListenerContainerFactory")
    fun messageListener( message: MessageAnalyticsDTO) {
        val msg = messageAnalyticsRepository.findById(message.id)
        if (!msg.isPresent){
            messageAnalyticsRepository.save(MessageAnalytics(message.id,message.channel,message.priority,message.creationTimestamp,message.status,message.statusTimestamp))
        }else{
            msg.get().status =message.status
            msg.get().statusTimestamp =message.statusTimestamp
            msg.get().priority = message.priority
            messageAnalyticsRepository.save(msg.get())
        }

    }

}