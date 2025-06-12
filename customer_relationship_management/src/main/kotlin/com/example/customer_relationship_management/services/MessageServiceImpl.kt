package com.example.customer_relationship_management.services


import com.example.customer_relationship_management.controllers.InvalidStateException
import com.example.customer_relationship_management.controllers.MessageNotFoundException
import com.example.customer_relationship_management.dtos.MessageDTO
import com.example.customer_relationship_management.dtos.MessageKafkaDTO
import com.example.customer_relationship_management.dtos.SendEmailDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.dtos.toMessageKafkaDTO
import com.example.customer_relationship_management.entities.*
import com.example.customer_relationship_management.repositories.MessageRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.*
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.util.*

@Service
class MessageServiceImpl(private val messageRepository: MessageRepository,private val entityManager: EntityManager, private val kafkaTemplate: KafkaTemplate<String, MessageKafkaDTO>) : MessageService {
    override fun createMessage(
        sender: String,
        subject: String,
        body: String,
        channel: String,
        priority: Int
    ): MessageDTO {
        val m = Message(
            sender,
            subject,
            body,
            channel,
                "Received",
            priority
        )
        val state = MessageHistory("Received", "just received" ,message = m)
        m.addState(state)
        val mess =messageRepository.save(m)
        kafkaTemplate.send("MESSAGE",mess.toMessageKafkaDTO() )
        return mess.toDto()
    }

    override fun listAll(): List<MessageDTO> {
        return messageRepository.findAll().map{it.toDto()}
    }

    override fun findById(id: Long): Message {
        val optionalMessage: Optional<Message> = messageRepository.findById(id)
        if (optionalMessage.isPresent) {
            return optionalMessage.get()
        } else {
            throw MessageNotFoundException("Message not found with ID: $id")
        }
    }


    override fun listAllByState(state: String): List<MessageDTO> {
        return messageRepository.findByCurrentStateIgnoreCase(state).map{it.toDto()}
    }

    override fun listAllBySubject(subject: String): List<MessageDTO> {
        return messageRepository.findBySubjectIgnoreCase(subject).map{it.toDto()}
    }

    override fun listPaginated(offset: Int, limit: Int,state:String,sortField: String?, sortDirection: SortDirection?): List<MessageDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<Message> = criteriaBuilder.createQuery(Message::class.java)
        val messageRoot: Root<Message> = criteriaQuery.from(Message::class.java)


        val predicates = mutableListOf<Predicate>()

        if (state.isNotBlank()) {
            val predicate = criteriaBuilder.like(criteriaBuilder.lower(messageRoot.get<String>("currentState")), "%${state.lowercase()}%")
            predicates.add(predicate)
        }

        val finalPredicate = criteriaBuilder.and(*predicates.toTypedArray())
        criteriaQuery.where(finalPredicate)

        if (sortField != null && sortDirection != null) {
            val order: Order = when (sortDirection) {
                SortDirection.ASC -> criteriaBuilder.asc(messageRoot.get<String>(sortField))
                SortDirection.DESC -> criteriaBuilder.desc(messageRoot.get<String>(sortField))
            }
            criteriaQuery.orderBy(order)
        }

        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }

    override fun updatePriority(message: Message, newPriority: Int): Message {
        message.priority = newPriority
        return messageRepository.save(message)
    }

    override fun changeState(state: String,comment:String, message: Message):Message {
        when(state.lowercase()){
            "read" -> if(message.currentState=="Received"){
                message.readMessage(comment)

            }else{
                throw InvalidStateException("The message can't reach this status(read) from his actual state(${message.currentState})")
            }
            "discarded" -> if(message.currentState=="Read"){
                message.discardMessage(comment)
            }else{
                throw InvalidStateException("The message can't reach this status(discarded) from his actual state(${message.currentState})")
            }
            "done" -> if(message.currentState=="Read" || message.currentState=="Processing"){
                message.completeMessage(comment)
            }else{
                throw InvalidStateException("The message can't reach this status(done) from his actual state(${message.currentState})")
            }
            "processing" -> if(message.currentState=="Read"){
                message.processMessage(comment)
            }else{
                throw InvalidStateException("The message can't reach this status(processing) from his actual state(${message.currentState})")
            }
            "failed" -> if(message.currentState=="Read" || message.currentState=="Processing"){
                message.failMessage(comment)
            }else{
                throw InvalidStateException("The message can't reach this status(failed) from his actual state(${message.currentState})")
            }
            else -> throw InvalidStateException("Invalid state with value: $state")
        }
        val mess =messageRepository.save(message)
        kafkaTemplate.send("MESSAGE",mess.toMessageKafkaDTO() )
        return mess
    }

    override fun notify(oldState: String, newState: String, email: SendEmailDTO): String? {
        val restTemplate = RestTemplate()

        val resourceUrl = "http://localhost:8051/api"

        // Create headers and set content type to application/json
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
        }

        // Create the request body as a map
        val requestBody = mapOf(
                "recipient" to email.recipient,
                "subject" to "State Changed to: $newState",
                "body" to "The state of the message has been changed from $oldState to $newState"
        )

        // Create the HttpEntity object with headers and body
        val request = HttpEntity(requestBody, headers)

        // Send the request using RestTemplate
        val response = restTemplate.exchange(
                "$resourceUrl/emails/",
                HttpMethod.POST,
                request,
                String::class.java
        )

        return response.body
    }
}


enum class SortDirection {
    ASC,
    DESC
}