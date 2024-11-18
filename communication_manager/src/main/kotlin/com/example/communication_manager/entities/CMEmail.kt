package com.example.communication_manager.entities

import jakarta.persistence.Entity

@Entity
class CMEmail (
        var emailFrom: String,
        var subject: String,
        var message: String,
        var date: String,
        val emailTo: String,
        val cc: String,
        val bcc: String,
        val messageId: String
): EntityBase<Long> ()