package com.example.customer_relationship_management.dtos


data class CreateContactDTO (val name:String, val surname:String, val ssnCode:String?, val emails: List<String>?, val addresses: List<String>?, val phoneNumbers: List<String>?)