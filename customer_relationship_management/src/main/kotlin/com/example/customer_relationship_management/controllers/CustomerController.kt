package com.example.customer_relationship_management.controllers

import com.example.customer_relationship_management.dtos.CustomerDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.services.ContactDetailsService
import com.example.customer_relationship_management.services.ContactService
import com.example.customer_relationship_management.services.CustomerService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/customers")
class CustomerController(private val customerService: CustomerService, private val contactService: ContactService, private val contactDetailsService: ContactDetailsService) {
    private val logger = LoggerFactory.getLogger(CustomerController::class.java)

    @GetMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun listAll(@RequestParam(defaultValue = "0") page: Int,
                @RequestParam(defaultValue = "20") limit : Int): List<CustomerDTO> {
        val offset = page * limit
        return customerService.listPaginated(offset, limit)
    }

    @PostMapping("/{contactId}")
    @ResponseStatus(HttpStatus.OK)
    fun createCustomer(@RequestBody notes: String?, @PathVariable contactId: Long) : CustomerDTO {
        val contact = contactService.findById(contactId)
        val createdCustomer = customerService.createCustomer(notes, contact)
        logger.info("Customer with ID:${createdCustomer.getId()} associated with a contact ID:${contact.getId()} has been created")
        return createdCustomer.toDto()
    }

    @PutMapping("/{customerId}")
    @ResponseStatus(HttpStatus.OK)
    fun updateCustomer(@RequestBody notes: String?, @PathVariable customerId: Long) : CustomerDTO {
        val customer = customerService.findById(customerId)
        val updatedCustomer = customerService.updateCustomer(notes, customer)
        logger.info("notes of Customer with ID:${updatedCustomer.getId()} have been updated")
        return updatedCustomer.toDto()
    }

    @GetMapping("/{customerId}")
    fun getDetailsById(@PathVariable customerId: Long): ResponseEntity<Any> {
        val customer = customerService.findById(customerId)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_customer" to customer.getId(),
                "id_contact" to customer.contact.getId(),
                "name" to customer.contact.name,
                "surname" to customer.contact.surname,
                "notes" to customer.notes,
                "category" to customer.contact.category,
                "ssn_code" to customer.contact.ssnCode,
                "emails" to customer.contact.emails.map { it.mail },
                "addresses" to customer.contact.addresses.map { it.address },
                "phone_numbers" to customer.contact.phoneNumbers.map { it.number }
        ))
    }

    //This API Delete only the Customer, the contact will be still available, and it's category will be set on "unknown"
    @DeleteMapping("/{customerId}")
    @ResponseStatus(HttpStatus.OK)
    fun deleteCustomer(@PathVariable customerId: Long): CustomerDTO {
        val customer = customerService.findById(customerId)
        customerService.deleteCustomer(customer)
        logger.info("Customer with ID '${customer.getId()}' has been deleted.")
        return customer.toDto()
    }


    //This API Delete the Customer and also the associated contact
    @DeleteMapping("/{customerId}/contact")
    @ResponseStatus(HttpStatus.OK)
    fun deleteCustomerContact(@PathVariable customerId: Long): CustomerDTO {
        val customer = customerService.findById(customerId)
        customerService.deleteCustomer(customer)
        //creating copy to avoid ConcurrentModificationException
        val emailsCopy = ArrayList(customer.contact.emails)
        val addressesCopy = ArrayList(customer.contact.addresses)
        val phoneNumbersCopy = ArrayList(customer.contact.phoneNumbers)

        //iteration in all copies
        emailsCopy.forEach { email ->
            contactDetailsService.deleteEmail(email, customer.contact)
        }
        addressesCopy.forEach { address ->
            contactDetailsService.deleteAddress(address, customer.contact)
        }
        phoneNumbersCopy.forEach { number ->
            contactDetailsService.deletePhoneNumber(number, customer.contact)
        }
        contactService.deleteContact(customer.contact)
        logger.info("Customer with ID '${customer.getId()}' and Contact with ID: '${customer.contact.getId()}'have been deleted.")
        return customer.toDto()
    }
}