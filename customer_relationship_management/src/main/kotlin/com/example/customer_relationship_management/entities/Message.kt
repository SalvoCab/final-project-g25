package com.example.customer_relationship_management.entities

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.OneToMany
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime


@Entity
class Message(

        var sender: String,
        var subject: String,
        var body: String,
        var channel: String,
        var currentState: String,
        var priority: Int,
        @field:CreationTimestamp
        var createdDate: LocalDateTime? = null,

): EntityBase<Long> (){

    @OneToMany(mappedBy = "message",cascade = [CascadeType.ALL])
    val states = mutableSetOf<MessageHistory>()
    fun addState(s: MessageHistory) {
        s.message = this
        states.add(s)
    }

    fun readMessage(comment:String) {
        this.currentState="Read"
        val mh = MessageHistory("Read",comment, message = this)
        addState(mh)
    }

    fun discardMessage(comment:String) {
        this.currentState="Discarded"
        val mh = MessageHistory("Discarded",comment, message = this)
        addState(mh)
    }

    fun processMessage(comment:String) {
        this.currentState="Processing"
        val mh = MessageHistory("Processing",comment, message = this)
        addState(mh)
    }

    fun completeMessage(comment:String) {
        this.currentState="Done"
        val mh = MessageHistory("Done",comment, message = this)
        addState(mh)
    }

    fun failMessage(comment:String) {
        this.currentState="Failed"
        val mh = MessageHistory("Failed",comment, message = this)
        addState(mh)
    }

}
