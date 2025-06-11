package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.controllers.ContactNotFoundException
import com.example.customer_relationship_management.dtos.ContactDTO
import com.example.customer_relationship_management.dtos.CreateContactDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.entities.Address
import com.example.customer_relationship_management.entities.Contact
import com.example.customer_relationship_management.entities.Email
import com.example.customer_relationship_management.entities.PhoneNumber
import com.example.customer_relationship_management.repositories.ContactRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.*
import org.springframework.stereotype.Service
import java.util.*

@Service
class ContactServiceImpl (private val contactRepository: ContactRepository, private val entityManager: EntityManager) : ContactService {
    override fun createContact(name: String, surname: String, category: String, ssnCode: String?): Contact {
        val c = Contact(
        name,
        surname,
        category,
        ssnCode)

        return contactRepository.save(c)
    }
    override fun createFullContact(name: String, surname: String, category: String, ssnCode: String?,email: String,address: String,phoneNumber:String): Contact {
        val c = createContact(name,surname,category,ssnCode)
        c.addEmail(Email(email))
        c.addAddress(Address(address))
        c.addPhoneNumber(PhoneNumber(phoneNumber))

        return contactRepository.save(c)
    }

    override fun listAll(): List<ContactDTO> {
        return contactRepository.findAll().map{it.toDto()}
    }

    override fun findById(id: Long): Contact {
        val optionalContact: Optional<Contact> = contactRepository.findById(id)
        if (optionalContact.isPresent) {
            return optionalContact.get()
        } else {
            throw ContactNotFoundException("Contact not found with ID: $id")
        }
    }

    override fun listPaginated(offset: Int, limit: Int, email: String, address: String, number: String, keyword: String): List<ContactDTO> {
        val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery: CriteriaQuery<Contact> = criteriaBuilder.createQuery(Contact::class.java)
        val contactRoot: Root<Contact> = criteriaQuery.from(Contact::class.java)

        contactRoot.fetch<Contact, Email>("emails", JoinType.LEFT)
        contactRoot.fetch<Contact, Address>("addresses", JoinType.LEFT)
        contactRoot.fetch<Contact, PhoneNumber>("phoneNumbers", JoinType.LEFT)

        criteriaQuery.select(contactRoot).distinct(true)

        val emailJoin = contactRoot.joinSet<Contact, Email>("emails", JoinType.LEFT)
        val addressJoin = contactRoot.joinSet<Contact, Address>("addresses", JoinType.LEFT)
        val phoneNumberJoin = contactRoot.joinSet<Contact, PhoneNumber>("phoneNumbers", JoinType.LEFT)

        val predicates = mutableListOf<Predicate>()

        if (email.isNotBlank()) {
            val emailPredicate = criteriaBuilder.like(
                criteriaBuilder.lower(emailJoin.get<String>("mail")),
                "%${email.lowercase()}%"
            )
            predicates.add(emailPredicate)
        }
        if (address.isNotBlank()) {
            val addressPredicate = criteriaBuilder.like(
                criteriaBuilder.lower(addressJoin.get<String>("address")),
                "%${address.lowercase()}%"
            )
            predicates.add(addressPredicate)
        }
        if (number.isNotBlank()) {
            val numberPredicate = criteriaBuilder.like(
                criteriaBuilder.lower(phoneNumberJoin.get<String>("number")),
                "%${number.lowercase()}%"
            )
            predicates.add(numberPredicate)
        }

        if (keyword.isNotBlank()) {
            val keywordLowerCase = keyword.lowercase()
            val keywordPredicate = criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(contactRoot.get<String>("name")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(contactRoot.get<String>("surname")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(contactRoot.get<String>("category")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(contactRoot.get<String>("ssnCode")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(emailJoin.get<String>("mail")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(addressJoin.get<String>("address")), "%$keywordLowerCase%"),
                criteriaBuilder.like(criteriaBuilder.lower(phoneNumberJoin.get<String>("number")), "%$keywordLowerCase%")
            )
            predicates.add(keywordPredicate)
        }

        if (predicates.isNotEmpty()) {
            criteriaQuery.where(criteriaBuilder.and(*predicates.toTypedArray()))
        }

        criteriaQuery.orderBy(criteriaBuilder.asc(contactRoot.get<String>("name")))

        val query = entityManager.createQuery(criteriaQuery)
        query.firstResult = offset
        query.maxResults = limit

        return query.resultList.map { it.toDto() }
    }


    override fun updateName(contact: Contact, newName: String): Contact {
        contact.name = newName
        return contactRepository.save(contact)
    }

    override fun updateSurname(contact: Contact, newSurname: String): Contact {
        contact.surname = newSurname
        return contactRepository.save(contact)
    }

    override fun updateCategory(contact: Contact, newCategory: String): Contact {
        contact.category = newCategory
        return contactRepository.save(contact)
    }

    override fun updateSsn(contact: Contact, newSsn: String): Contact {
        contact.ssnCode = newSsn
        return contactRepository.save(contact)
    }

    override fun updateContact(contact: Contact, newContact: CreateContactDTO): Contact {
        contact.name = newContact.name
        contact.surname = newContact.surname
        contact.ssnCode = newContact.ssnCode
        return contactRepository.save(contact)
    }

    override fun deleteContact(contact: Contact): Contact {
        contactRepository.delete(contact)
        return contact
    }

}