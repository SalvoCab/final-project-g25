package com.example.customer_relationship_management.dtos

data class CreateProfessionalDTO (
        val location:String,
        val state:String,
        val dailyRate:Double,
        val skills: List<Long>?)