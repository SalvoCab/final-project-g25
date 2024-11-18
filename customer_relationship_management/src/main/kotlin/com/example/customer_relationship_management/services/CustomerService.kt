package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.dtos.CustomerDTO
import com.example.customer_relationship_management.entities.Contact
import com.example.customer_relationship_management.entities.Customer

interface CustomerService {

    fun listPaginated(offset: Int, limit: Int) : List<CustomerDTO>

    fun createCustomer(notes:String?, contact: Contact): Customer

    fun updateCustomer(notes:String?, customer: Customer): Customer

    fun findById(id:Long) : Customer

    fun deleteCustomer(customer: Customer)

}