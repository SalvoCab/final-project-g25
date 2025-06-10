package com.example.customer_relationship_management.controllers

import com.example.customer_relationship_management.dtos.ContactDTO
import com.example.customer_relationship_management.dtos.CreateContactDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.services.ContactDetailsService
import com.example.customer_relationship_management.services.ContactService
import com.example.customer_relationship_management.services.CustomerService
import com.example.customer_relationship_management.services.ProfessionalService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/contacts")
class ContactController (
    private val contactService: ContactService,
    private val contactDetailsService: ContactDetailsService,
    private val professionalService: ProfessionalService,
    private val customerService: CustomerService
) {

    private val logger = LoggerFactory.getLogger(ContactController::class.java)

    /*list all the contacts, using page,limit and filtering:
    -email: search the value in the email field
    -address: search the value in the address field
    -number: search the value in the phone_number field
    -keyword: search the keyword in all fields of the contact
    the response will be the list of the contacts that matches the filters
     */
    @GetMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun listAll(@RequestParam(defaultValue = "0") page: Int,
                @RequestParam(defaultValue = "20") limit : Int,
                @RequestParam(defaultValue ="") email: String,
                @RequestParam(defaultValue ="") address: String,
                @RequestParam(defaultValue ="") number: String,
                @RequestParam(defaultValue ="") keyword: String): List<ContactDTO> {
        val offset = page * limit
        return contactService.listPaginated(offset, limit, email,address,number,keyword)
    }

    @PostMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun createContact(@RequestBody dto: CreateContactDTO) : ContactDTO {
        if (dto.name == "" || dto.surname == "")
            throw NoContentException("Provide a valid contact")
        val createdContact = contactService.createContact(dto.name,dto.surname,"unknown",dto.ssnCode)
        dto.emails?.forEach { email ->
            contactDetailsService.createEmail(email, createdContact)
        }
        dto.addresses?.forEach { address ->
            contactDetailsService.createAddress(address, createdContact)
        }
        dto.phoneNumbers?.forEach { number ->
            contactDetailsService.createPhoneNumber(number, createdContact)
        }
        logger.info("Contact with ID:${createdContact.getId()}, name:${createdContact.name}, surname:${createdContact.surname} has been created")
        return createdContact.toDto()
    }

    @GetMapping("/{contactId}")
    fun getDetailsById(@PathVariable contactId: Long): ResponseEntity<Any> {
        val contact = contactService.findById(contactId)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_contact" to contact.getId(),
                "name" to contact.name,
                "surname" to contact.surname,
                "category" to contact.category,
                "ssn_code" to contact.ssnCode,
                "emails" to contact.emails.map { it.mail },
                "addresses" to contact.addresses.map { it.address },
                "phone_numbers" to contact.phoneNumbers.map { it.number }
        ))
    }

    @PostMapping("/{contactId}/email")
    fun addContactEmail(@RequestBody e: String,@PathVariable contactId: Long) : ResponseEntity<Any>{
        if (e == "")
            throw NoContentException("Provide a valid email")
        val contact = contactService.findById(contactId)
        val email = contactDetailsService.createEmail(e, contact)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_mail" to email.getId(),
                "email" to email.mail,
                "id_contact" to contact.getId(),
                "name" to contact.name,
                "surname" to contact.surname
        ))
    }

    @PostMapping("/{contactId}/address")
    fun addContactAddress(@RequestBody a: String,@PathVariable contactId: Long) : ResponseEntity<Any>{
        if (a == "")
            throw NoContentException("Provide a valid address")
        val contact = contactService.findById(contactId)
        val address = contactDetailsService.createAddress(a, contact)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_address" to address.getId(),
                "address" to address.address,
                "id_contact" to contact.getId(),
                "name" to contact.name,
                "surname" to contact.surname
        ))
    }

    @PostMapping("/{contactId}/phoneNumber")
    fun addContactPhoneNumber(@RequestBody pn: String,@PathVariable contactId: Long) : ResponseEntity<Any>{
        if (pn == "")
            throw NoContentException("Provide a valid phone number")
        val contact = contactService.findById(contactId)
        val phoneNumber = contactDetailsService.createPhoneNumber(pn, contact)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_number" to phoneNumber.getId(),
                "number" to phoneNumber.number,
                "id_contact" to contact.getId(),
                "name" to contact.name,
                "surname" to contact.surname
        ))
    }

    //the second contact will be merged into the first one and the second will be deleted after
    @PostMapping("/{firstContactId}/{secondContactId}")
    fun mergeContacts(@PathVariable firstContactId: Long,@PathVariable secondContactId: Long) : ResponseEntity<Any>{
        if(firstContactId==secondContactId){
            throw MergeContactException ("Attention! you are trying to merge the same contact")
        }
        val firstContact = contactService.findById(firstContactId)
        val secondContact = contactService.findById(secondContactId)

        secondContact.emails.forEach { email ->
            if(!firstContact.emails.contains(email)) {
                contactDetailsService.createEmail(email.mail, firstContact)
            }
        }
        secondContact.phoneNumbers.forEach { phoneNumber ->
            if(!firstContact.phoneNumbers.contains(phoneNumber)) {
            contactDetailsService.createPhoneNumber(phoneNumber.number, firstContact)
            }
        }

        contactService.deleteContact(secondContact)

        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
            "Merged_contact_ID" to firstContact.getId(),
            "name" to firstContact.name,
            "surname" to firstContact.surname,
            "category" to firstContact.category,
            "ssn_code" to firstContact.ssnCode,
            "emails" to firstContact.emails.map { it.mail },
            "addresses" to firstContact.addresses.map { it.address },
            "phone_numbers" to firstContact.phoneNumbers.map { it.number }
        ))
    }


    @PutMapping("/{contactId}/email/{emailId}")
    fun updateContactEmail(@PathVariable contactId: Long, @PathVariable emailId: Long,@RequestBody newEmail: String) : ResponseEntity<Any>{
        if (newEmail == "")
            throw NoContentException("Provide a valid phone number")
        val contact = contactService.findById(contactId)
        val oldEmail = contactDetailsService.findEmailById(emailId)
        val oldE = oldEmail.mail
        if(oldEmail.contacts.contains(contact)) {
            val updatedEmail = contactDetailsService.updateEmail(contact, oldEmail, newEmail)
            logger.info("${oldEmail.getId()} : ${oldEmail.mail} --> ${updatedEmail.getId()}: ${updatedEmail.mail} uploaded successfully")
            return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                    "id_old" to oldEmail.getId(),
                    "old_email" to oldE,
                    "id_new" to updatedEmail.getId(),
                    "new_email" to updatedEmail.mail
            ))
        }else{
            throw NoAssociationFoundException("The Email you are trying to update is not associated with the contact with ID: $contactId")
        }
    }

    @PutMapping("/{contactId}/address/{addressId}")
    fun updateContactAddress(@PathVariable contactId: Long, @PathVariable addressId: Long,@RequestBody newAddress: String) : ResponseEntity<Any>{
        if (newAddress == "")
            throw NoContentException("Provide a valid phone number")
        val contact = contactService.findById(contactId)
        val oldAddress = contactDetailsService.findAddressById(addressId)
        val oldA = oldAddress.address
        if(oldAddress.contacts.contains(contact)) {
            val updatedAddress = contactDetailsService.updateAddress(contact, oldAddress, newAddress)
            logger.info("${oldAddress.getId()} : ${oldAddress.address} --> '${updatedAddress.getId()}': ${updatedAddress.address} uploaded successfully")
            return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                    "id_old" to oldAddress.getId(),
                    "old_address" to oldA,
                    "id_new" to updatedAddress.getId(),
                    "new_address" to updatedAddress.address
            ))
        }else{
            throw NoAssociationFoundException("The Address you are trying to update is not associated with the contact with ID: $contactId")
        }
    }

    @PutMapping("/{contactId}/phoneNumber/{phoneNumberId}")
    fun updateContactPhoneNumber(@PathVariable contactId: Long, @PathVariable phoneNumberId: Long,@RequestBody newPhoneNumber: String) : ResponseEntity<Any>{
        if (newPhoneNumber == "")
            throw NoContentException("Provide a valid phone number")
        val contact = contactService.findById(contactId)
        val oldPhoneNumber = contactDetailsService.findPhoneNumberById(phoneNumberId)
        val oldPN = oldPhoneNumber.number
        if(oldPhoneNumber.contacts.contains(contact)) {
            val updatedPhoneNumber = contactDetailsService.updatePhoneNumber(contact, oldPhoneNumber, newPhoneNumber)
            logger.info("${oldPhoneNumber.getId()} : ${oldPhoneNumber.number} --> '${updatedPhoneNumber.getId()}': ${updatedPhoneNumber.number} uploaded successfully")
            return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                    "id_old" to oldPhoneNumber.getId(),
                    "old_number" to oldPN,
                    "id_new" to updatedPhoneNumber.getId(),
                    "new_number" to updatedPhoneNumber.number
            ))
        }else{
            throw NoAssociationFoundException("The Phone Number you are trying to update is not associated with the contact with ID: $contactId")
        }
    }

    @DeleteMapping("/{contactId}")
    fun deleteContact(@PathVariable contactId: Long): ResponseEntity<Any> {

        val contact = contactService.findById(contactId)

        if (contact.category.lowercase() == "professional"){
            professionalService.deleteProfessional(contact.professional!!)
        }
        if (contact.category.lowercase() == "customer"){
            customerService.deleteCustomer(contact.customer!!)
        }
        //creating copy to avoid ConcurrentModificationException
        val emailsCopy = ArrayList(contact.emails)
        val addressesCopy = ArrayList(contact.addresses)
        val phoneNumbersCopy = ArrayList(contact.phoneNumbers)

        //iteration in all copies
        emailsCopy.forEach { email ->
            contactDetailsService.deleteEmail(email, contact)
        }
        addressesCopy.forEach { address ->
            contactDetailsService.deleteAddress(address, contact)
        }
        phoneNumbersCopy.forEach { number ->
            contactDetailsService.deletePhoneNumber(number, contact)
        }

        //delete contact
        contactService.deleteContact(contact)
        logger.info("Contact with ID '${contact.getId()}' has been deleted.")
        return ResponseEntity.ok().body(mapOf(
                "id" to contact.getId(),
                "name" to contact.name,
                "surname" to contact.surname
        ))
    }

    @DeleteMapping("/{contactId}/email/{emailId}")
    fun deleteContactEmail(@PathVariable contactId: Long,@PathVariable emailId: Long): ResponseEntity<Any> {

        val contact = contactService.findById(contactId)
        val email = contactDetailsService.findEmailById(emailId)

        if(email.contacts.contains(contact)){
            contactDetailsService.deleteEmail(email,contact)
            logger.info("Email with ID '$emailId' has been deleted.")
            return ResponseEntity.ok().body(mapOf(
                "id_mail" to email.getId(),
                "email" to email.mail,
            ))

        }else {
            throw NoAssociationFoundException("The Email you are trying to delete is not associated with the contact with ID: $contactId")
        }
    }


    @DeleteMapping("/{contactId}/address/{addressId}")
    fun deleteContactAddress(@PathVariable contactId: Long,@PathVariable addressId: Long): ResponseEntity<Any> {

        val contact = contactService.findById(contactId)
        val address = contactDetailsService.findAddressById(addressId)

        if(address.contacts.contains(contact)){
            contactDetailsService.deleteAddress(address,contact)
            logger.info("Address with ID '$addressId' has been deleted.")
            return ResponseEntity.ok().body(mapOf(
                "id_mail" to address.getId(),
                "address" to address.address,
            ))

        }else {
            throw NoAssociationFoundException("The Address you are trying to delete is not associated with the contact with ID: $contactId")
        }



    }


    @DeleteMapping("/{contactId}/phoneNumber/{phoneNumberId}")
    fun deleteContactPhoneNumber(@PathVariable contactId: Long,@PathVariable phoneNumberId: Long): ResponseEntity<Any> {

        val contact = contactService.findById(contactId)
        val phoneNumber = contactDetailsService.findPhoneNumberById(phoneNumberId)

        if(phoneNumber.contacts.contains(contact)){
            contactDetailsService.deletePhoneNumber(phoneNumber,contact)
            logger.info("Phone number with ID '$phoneNumberId' has been deleted.")
            return ResponseEntity.ok().body(mapOf(
                "id_mail" to phoneNumber.getId(),
                "phone_number" to phoneNumber.number,
            ))

        }else {
            throw NoAssociationFoundException("The Phone number you are trying to delete is not associated with the contact with ID: $contactId")
        }
    }

    @PutMapping("/{contactId}/name")
    fun updateContactName(@PathVariable contactId: Long,@RequestBody newName: String) : ResponseEntity<Any>{
        if (newName == "")
            throw NoContentException("Provide a valid phone number")
        val contact = contactService.findById(contactId)
        val oldN = contact.name
        val updatedContact = contactService.updateName(contact, newName)
        logger.info("contact ID:${contact.getId()} changed name from $oldN to ${updatedContact.name}")
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                    "id" to contact.getId(),
                    "old_name" to oldN,
                    "new_name" to updatedContact.name
            ))
    }

    @PutMapping("/{contactId}/surname")
    fun updateContactSurname(@PathVariable contactId: Long,@RequestBody newSurame: String) : ResponseEntity<Any>{
        if (newSurame == "")
            throw NoContentException("Provide a valid surname")
        val contact = contactService.findById(contactId)
        val oldS = contact.surname
        val updatedContact = contactService.updateSurname(contact, newSurame)
        logger.info("contact ID:${contact.getId()} changed surname from $oldS to ${updatedContact.surname}")
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id" to contact.getId(),
                "old_surname" to oldS,
                "new_surname" to updatedContact.surname
        ))
    }

    @PutMapping("/{contactId}/category")
    fun updateContactCategory(@PathVariable contactId: Long,@RequestBody newCategory: String) : ResponseEntity<Any>{
        if (newCategory == "")
            throw NoContentException("Provide a valid category")
        val contact = contactService.findById(contactId)
        val oldC = contact.category
        val updatedContact = contactService.updateCategory(contact, newCategory)
        logger.info("contact ID:${contact.getId()} changed category from $oldC to ${updatedContact.category}")
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id" to contact.getId(),
                "old_category" to oldC,
                "new_category" to updatedContact.category
        ))
    }

    @PutMapping("/{contactId}/ssn")
    fun updateContactSsn(@PathVariable contactId: Long,@RequestBody newSsn: String) : ResponseEntity<Any>{
        val contact = contactService.findById(contactId)
        val oldS = contact.ssnCode
        val updatedContact = contactService.updateSsn(contact, newSsn)
        logger.info("contact ID:${contact.getId()} changed ssn code from $oldS to ${updatedContact.ssnCode}")
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id" to contact.getId(),
                "old_ssn_code" to oldS,
                "new_ssn_code" to updatedContact.ssnCode
        ))
    }

    @PutMapping("/{contactId}")
    @ResponseStatus(HttpStatus.OK)
    fun updateContact(@PathVariable contactId: Long,@RequestBody dto: CreateContactDTO) : ResponseEntity<Any> {
        if (dto.name == "" || dto.surname == "")
            throw NoContentException("Provide a valid contact")
        val contact = contactService.findById(contactId)
        val updatedContact = contactService.updateContact(contact, dto)
        val existingEmails = updatedContact.emails.map { it.mail }.toSet()
        val incomingEmails = dto.emails?.toSet() ?: emptySet()

        val toDelete = existingEmails.subtract(incomingEmails)
        updatedContact.emails.filter { it.mail in toDelete }.forEach { email ->
            contactDetailsService.deleteEmail(email, updatedContact)
        }
        val toAdd = incomingEmails.subtract(existingEmails)
        toAdd.forEach { email ->
            contactDetailsService.createEmail(email, updatedContact)
        }

        val existingAddresses = updatedContact.addresses.map { it.address }.toSet()
        val incomingAddresses = dto.addresses?.toSet() ?: emptySet()

        val addressesToDelete = existingAddresses.subtract(incomingAddresses)
        updatedContact.addresses.filter { it.address in addressesToDelete }.forEach { addr ->
            contactDetailsService.deleteAddress(addr, updatedContact)
        }

        val addressesToAdd = incomingAddresses.subtract(existingAddresses)
        addressesToAdd.forEach { addr ->
            contactDetailsService.createAddress(addr, updatedContact)
        }

        val existingPN = updatedContact.phoneNumbers.map { it.number }.toSet()
        val incomingPN = dto.phoneNumbers?.toSet() ?: emptySet()

        val pnToDelete = existingPN.subtract(incomingPN)
        updatedContact.phoneNumbers.filter { it.number in pnToDelete }.forEach { pn ->
            contactDetailsService.deletePhoneNumber(pn, updatedContact)
        }

        val pnToAdd = incomingPN.subtract(existingPN)
        pnToAdd.forEach { pn ->
            contactDetailsService.createPhoneNumber(pn, updatedContact)
        }
        logger.info("Contact with ID:${updatedContact.getId()}, name:${updatedContact.name}, surname:${updatedContact.surname} has been updated")
        return ResponseEntity.status(HttpStatus.OK).body(updatedContact.toDto())
    }
}