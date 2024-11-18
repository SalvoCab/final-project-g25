package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.dtos.MessageDTO
import com.example.customer_relationship_management.dtos.SendEmailDTO
import com.example.customer_relationship_management.entities.Message


interface MessageService {
    fun createMessage(sender:String, subject: String, body: String, channel: String, priority: Int): MessageDTO
    fun listAll() : List<MessageDTO>
    fun findById(id:Long) : Message
    fun listAllByState(state:String) : List<MessageDTO>
    fun listAllBySubject(subject:String) : List<MessageDTO>
    fun listPaginated(offset: Int, limit: Int,state:String,sortField: String?, sortDirection: SortDirection?): List<MessageDTO>
    fun updatePriority(message: Message, newPriority: Int): Message
    fun changeState(state:String,comment:String,message:Message):Message

    fun notify(oldState:String, newState:String, email:SendEmailDTO):String?
}