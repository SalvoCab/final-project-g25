package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.dtos.ContactDTO
import com.example.customer_relationship_management.dtos.CreateContactDTO
import com.example.customer_relationship_management.entities.Contact

interface ContactService {

    fun createContact(name:String,surname:String,category:String,ssnCode:String?): Contact
    fun listAll() : List<ContactDTO>
    fun findById(id:Long) : Contact
    fun listPaginated(offset: Int, limit: Int,email:String, address:String, number:String, keyword:String): List<ContactDTO>
    fun updateName(contact: Contact,newName: String): Contact
    fun updateSurname(contact: Contact,newSurname: String): Contact
    fun updateCategory(contact: Contact,newCategory: String): Contact
    fun updateSsn(contact: Contact,newSsn: String): Contact
    fun updateContact(contact: Contact,newContact: CreateContactDTO): Contact

    fun deleteContact(contact: Contact): Contact
}