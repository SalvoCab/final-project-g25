package com.example.customer_relationship_management.config


import com.example.customer_relationship_management.services.ContactService
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class KeycloakListener(private val contactService: ContactService) {

    @KafkaListener(id = "CRMListener", topics = ["IAM-REGISTER"], containerFactory = "registerContainerFactory")
    fun listen(registerEventValue: RegisterEventValue) {
        contactService.createFullContact(
            name = registerEventValue.firstName,
            surname = registerEventValue.lastName,
            category = "unknown",
            ssnCode = null,
            email=registerEventValue.email,
            address = registerEventValue.address,
            phoneNumber = registerEventValue.phoneNumber
        )
    }

}