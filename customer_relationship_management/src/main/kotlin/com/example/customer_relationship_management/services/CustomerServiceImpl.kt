package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.controllers.AssociationAlreadyExistException
import com.example.customer_relationship_management.controllers.CustomerNotFoundException
import com.example.customer_relationship_management.controllers.InvalidDeletionException
import com.example.customer_relationship_management.dtos.CustomerDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.entities.*
import com.example.customer_relationship_management.repositories.CustomerRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.*
import org.springframework.stereotype.Service

@Service
class CustomerServiceImpl (private val customerRepository: CustomerRepository, private val entityManager: EntityManager) : CustomerService{
    override fun listPaginated(offset: Int, limit: Int): List<CustomerDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<Customer> = criteriaBuilder.createQuery(Customer::class.java)
        val root: Root<Customer> = criteriaQuery.from(Customer::class.java)

        criteriaQuery.select(root)

        val query = entityManager.createQuery(criteriaQuery)
        query.maxResults = limit
        query.firstResult = offset

        return query.resultList.map { it.toDto() }
    }

    override fun createCustomer(notes: String?, contact: Contact): Customer {
        if (contact.category.lowercase() != "unknown")
            throw AssociationAlreadyExistException("You cannot create a costumer to a contact that has category ${contact.category}")
        contact.category="customer"
        val customer = Customer(notes, contact)
        return customerRepository.save(customer)
    }

    override fun updateCustomer(notes: String?, customer: Customer): Customer {
        customer.notes = notes
        return customerRepository.save(customer)
    }

    override fun findById(id: Long): Customer {
        val optionalCustomer = customerRepository.findById(id)
        if (optionalCustomer.isPresent) {
            return optionalCustomer.get()
        } else {
            throw CustomerNotFoundException("Customer not found with ID: $id")
        }
    }

    override fun deleteCustomer(customer: Customer) {
        if (customer.offers.isNotEmpty())
            throw InvalidDeletionException("you cannot delete a customer that has job offers")
        customer.contact.category="unknown"
        return customerRepository.delete(customer)
    }

}