package com.example.customer_relationship_management.controllers


import com.example.customer_relationship_management.dtos.CreateMessageDTO
import com.example.customer_relationship_management.dtos.HistoryDTO
import com.example.customer_relationship_management.dtos.MessageDTO
import com.example.customer_relationship_management.dtos.SendEmailDTO
import com.example.customer_relationship_management.services.ContactDetailsService
import com.example.customer_relationship_management.services.ContactService
import com.example.customer_relationship_management.services.MessageService
import com.example.customer_relationship_management.services.SortDirection

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.slf4j.LoggerFactory

import org.springframework.web.bind.annotation.*
import org.springframework.http.*



@RestController
@RequestMapping("/messages")
class MessageController(private val messageService: MessageService,private val contactService: ContactService , private val contactDetailsService: ContactDetailsService) {

    private val logger = LoggerFactory.getLogger(MessageController::class.java)


    //list all the messages, using page,limit and subject to filter
    @GetMapping("/", "")
    @ResponseStatus(HttpStatus.OK)
    fun listAll(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(defaultValue = "") state: String,
        @RequestParam(defaultValue = "createdDate") sortField: String,
        @RequestParam(defaultValue = "1") sortDirection: Int
    ): List<MessageDTO> {
        val offset = page * limit
        var direction = SortDirection.ASC
        if(sortDirection == 1){
            direction = SortDirection.DESC
        }

        return messageService.listPaginated(offset, limit, state,sortField,direction)
    }

    @PostMapping("/", "")
    @ResponseStatus(HttpStatus.OK)
    fun createMessage(@RequestBody dto: CreateMessageDTO): MessageDTO {
        if (dto.sender == "" || dto.body == "" || dto.subject == ""|| dto.channel == "" || dto.priority < 0 || dto.priority >10)
            throw NoContentException("Provide a valid message")

        val createdMessage = messageService.createMessage(dto.sender, dto.subject, dto.body, dto.channel, dto.priority)

        if (dto.channel.lowercase() == "email"){
            val email = contactDetailsService.findByMail(dto.sender)
            if(email == null){
                val createdContact = contactService.createContact("???","???","unknown",null)
                contactDetailsService.createEmail(dto.sender, createdContact)
            }
        }
        if (dto.channel.lowercase() == "phone call" || dto.channel.lowercase() == "text message" || dto.channel == "whatsapp" || dto.channel == "telegram"){
            val number = contactDetailsService.findByPhoneNumber(dto.sender)
            if(number == null){
                val createdContact = contactService.createContact("???","???","unknown",null)
                contactDetailsService.createPhoneNumber(dto.sender, createdContact)
            }
        }

        logger.info("Message with ID:${createdMessage.id}, sender:${createdMessage.sender}, subject:${createdMessage.subject} has been created")
        return createdMessage
    }

    @GetMapping("/{messageId}")
    fun getMessageById(@PathVariable messageId: Long): ResponseEntity<Any> {
        val message = messageService.findById(messageId)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
            "id_message" to message.getId(),
            "sender" to message.sender,
            "state" to message.currentState,
            "subject" to message.subject,
            "body" to message.body ,
            "channel" to message.channel,
            "priority" to message.priority,
            "createdDate" to message.createdDate,
            "history" to message.states.map { mapOf("state" to it.state, "comment" to it.comment, "date" to it.createdDate) }
        ))
    }

    @PostMapping("/{messageId}")
    fun changeState(@RequestBody dto: HistoryDTO, @PathVariable messageId: Long) : ResponseEntity<Any>{
        val message = messageService.findById(messageId)
        val oldState = message.currentState
        val emailDTO = SendEmailDTO(
            recipient = message.sender,
            subject = "State Change",
            body = "The state of the message has been changed from $oldState to ${dto.state}"
        )
        messageService.notify(oldState,dto.state,emailDTO)

        val updatedMessage =messageService.changeState(dto.state,dto.comment,message)







        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
            "id_message" to updatedMessage.getId(),
            "sender" to updatedMessage.sender,
            "state" to updatedMessage.currentState,
            "subject" to updatedMessage.subject,
            "body" to updatedMessage.body ,
            "channel" to updatedMessage.channel,
            "priority" to updatedMessage.priority,
            "createdDate" to updatedMessage.createdDate,
            "history" to updatedMessage.states.map { mapOf("state" to it.state, "comment" to it.comment) }
        ))
    }

    @GetMapping("/{messageId}/history")
    fun getMessageHistory(@PathVariable messageId: Long) : ResponseEntity<List<HistoryDTO>> {
        val message = messageService.findById(messageId)

        val history = message.states.map {
            HistoryDTO(it.state, it.comment)
        }

        return ResponseEntity.status(HttpStatus.OK).body(history)
    }

    @PutMapping("/{messageId}/priority")
    fun changePriority(@PathVariable messageId: Long, @RequestBody priority: Int): ResponseEntity<Any>{

        val message = messageService.findById(messageId)
        return if (priority in 1 until 11) {

            val updatedMessage = messageService.updatePriority(message, priority)
            ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_message" to updatedMessage.getId(),
                "sender" to updatedMessage.sender,
                "state" to updatedMessage.currentState,
                "subject" to updatedMessage.subject,
                "body" to updatedMessage.body,
                "channel" to updatedMessage.channel,
                "priority" to updatedMessage.priority,
                "createdDate" to updatedMessage.createdDate,
                "history" to updatedMessage.states.map { mapOf("state" to it.state, "comment" to it.comment) }
            ))
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("The priority value must be > 0 and < 10!")
        }
    }

}