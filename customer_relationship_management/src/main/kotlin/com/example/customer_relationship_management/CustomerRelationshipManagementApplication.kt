package com.example.customer_relationship_management


import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication


//@EnableJpaAuditing
@SpringBootApplication
class CustomerRelationshipManagementApplication/*{
    @Bean                 //name, partitions, replicas
    fun topic() = NewTopic("topic1", 10, 1)

    @Bean
    fun runner(template: KafkaTemplate<String?, String?>) =
            ApplicationRunner { template.send("topic1", "test") }

    @KafkaListener(id = "myId", topics = ["topic1"])
    fun listen(value: String?) {
        println(value)
    }
}*/


fun main(args: Array<String>) {
    runApplication<CustomerRelationshipManagementApplication>(*args)
}
