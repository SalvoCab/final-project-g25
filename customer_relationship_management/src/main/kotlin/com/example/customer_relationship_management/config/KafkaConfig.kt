package com.example.customer_relationship_management.config

import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.kstream.KStream
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafkaStreams
/*
@Configuration
@EnableKafkaStreams
class KafkaConfig {
    @Value("\${eventTopic}")
    private lateinit var eventTopic: String

    @Bean
    fun kStream(streamsBuilder: StreamsBuilder): KStream<String, EventDTO> {
        val s: KStream<String, EventDTO> = streamsBuilder.stream("inputTopic")
        s.mapValues { v -> EventDTO("Processed: ${v.body}") }
                .to("outputTopic")
        return s
    }
}
data class EventDTO(
        val body: String
)
*/