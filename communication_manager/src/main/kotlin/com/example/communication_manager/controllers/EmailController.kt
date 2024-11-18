package com.example.communication_manager.controllers

import com.example.communication_manager.dtos.SendEmailDTO
import org.apache.camel.CamelContext
import org.apache.camel.ProducerTemplate
import org.apache.camel.builder.ExchangeBuilder
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/emails")
class EmailController(val camelContext: CamelContext, val producerTemplate: ProducerTemplate) {

    private val logger = LoggerFactory.getLogger(EmailController::class.java)

    @PostMapping("/", "")
    @ResponseStatus(HttpStatus.OK)
    fun sendEmail(@RequestBody emailRequest: SendEmailDTO): Map<String, Any> {
        val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
        if (emailRequest.recipient == "" || emailRequest.subject == "" || emailRequest.body == "")
            throw NoContentException("You have to fill all field")
        if(!emailRegex.matches(emailRequest.recipient))
            throw EmailFormatException("Please insert an email in a good format")
        val exchange = ExchangeBuilder.anExchange(camelContext)
                .withHeader("to", emailRequest.recipient)
                .withHeader("subject", emailRequest.subject)
                .withBody(emailRequest.body)
                .build()
        producerTemplate.send("direct:sendEmail", exchange)
        logger.info("The e-mail to ${emailRequest.recipient} has been sent")
        return mapOf("status" to "Email sent successfully", "headers" to exchange.`in`.headers)
    }
}

