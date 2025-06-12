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
    override fun listPaginated(offset: Int, limit: Int, keyword: String): List<CustomerDTO> {
        val criteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery = criteriaBuilder.createQuery(Customer::class.java)
        val root = criteriaQuery.from(Customer::class.java)

        // Fai la JOIN con Contact
        val contactJoin = root.join<Customer, Contact>("contact")

        val predicates = mutableListOf<Predicate>()

        if (keyword.isNotBlank()) {
            val keywordLowerCase = keyword.lowercase()

            val keywordPredicate = criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(contactJoin.get("name")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(contactJoin.get("surname")), "%$keywordLowerCase%")
            )
            predicates.add(keywordPredicate)
        }

        if (predicates.isNotEmpty()) {
            criteriaQuery.where(criteriaBuilder.and(*predicates.toTypedArray()))
        }

        criteriaQuery.select(root).distinct(true) // distinct per evitare duplicati

        val query = entityManager.createQuery(criteriaQuery)
        query.firstResult = offset
        query.maxResults = limit

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