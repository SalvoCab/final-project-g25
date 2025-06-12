package com.example.customer_relationship_management


import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication


//@EnableJpaAuditing
@SpringBootApplication
class CustomerRelationshipManagementApplication

fun main(args: Array<String>) {
    runApplication<CustomerRelationshipManagementApplication>(*args)
}
