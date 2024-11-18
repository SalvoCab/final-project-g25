package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.controllers.*
import com.example.customer_relationship_management.entities.Address
import com.example.customer_relationship_management.entities.Contact
import com.example.customer_relationship_management.entities.Email
import com.example.customer_relationship_management.entities.PhoneNumber
import com.example.customer_relationship_management.repositories.AddressRepository
import com.example.customer_relationship_management.repositories.EmailRepository
import com.example.customer_relationship_management.repositories.PhoneNumberRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class ContactDetailsServiceImpl(private val emailRepository: EmailRepository,
                                private val addressRepository: AddressRepository,
                                private val phoneNumberRepository: PhoneNumberRepository):ContactDetailsService{

    override fun findByMail(email:String): Email? {
        return emailRepository.findByMail(email)
    }

    override fun createEmail(email: String, c: Contact): Email {
        var searchMail = findByMail(email)
        if (searchMail == null) {
            searchMail = Email(email)
        }
        searchMail.addContact(c)
        return emailRepository.save(searchMail)
    }

    override fun createAddress(address: String, c: Contact): Address {
        var searchAddress = findByAddress(address)
        if (searchAddress == null) {
            searchAddress = Address(address)
        }
        searchAddress.addContact(c)
        return addressRepository.save(searchAddress)
    }

    override fun findByAddress(address: String): Address? {
        return addressRepository.findByAddress(address)
    }

    override fun createPhoneNumber(number: String, c: Contact): PhoneNumber {
        var searchPN = findByPhoneNumber(number)
        if (searchPN == null) {
            searchPN = PhoneNumber(number)
        }
        searchPN.addContact(c)
        return phoneNumberRepository.save(searchPN)
    }

    override fun findByPhoneNumber(number: String): PhoneNumber? {
        return phoneNumberRepository.findByNumber(number)
    }

    override fun findEmailById(id: Long): Email {
        val optionalEmail: Optional<Email> = emailRepository.findById(id)
        if (optionalEmail.isPresent) {
            return optionalEmail.get()
        } else {
            throw EmailNotFoundException("Email not found with ID: $id")
        }
    }

    override fun findAddressById(id: Long): Address {
        val optionalAddress: Optional<Address> = addressRepository.findById(id)
        if (optionalAddress.isPresent) {
            return optionalAddress.get()
        } else {
            throw AddressNotFoundException("Address not found with ID: $id")
        }
    }

    override fun findPhoneNumberById(id: Long): PhoneNumber {
        val optionalPhoneNumber: Optional<PhoneNumber> = phoneNumberRepository.findById(id)
        if (optionalPhoneNumber.isPresent) {
            return optionalPhoneNumber.get()
        } else {
            throw PhoneNumberNotFoundException("Phone number not found with ID: $id")
        }
    }

    override fun deleteEmail(e: Email, c: Contact): Email {
        if(e.contacts.size == 1){
            e.removeContact(c)
            emailRepository.delete(e)

        }else{
            e.removeContact(c)
            emailRepository.save(e)
        }

        return e
    }

    override fun deleteAddress(a:Address, c: Contact): Address {
        if(a.contacts.size == 1){
            a.removeContact(c)
            addressRepository.delete(a)

        }else{
            a.removeContact(c)
            addressRepository.save(a)
        }

        return a
    }

    override fun deletePhoneNumber(pn:PhoneNumber, c: Contact): PhoneNumber {
        if(pn.contacts.size == 1){
            pn.removeContact(c)
            phoneNumberRepository.delete(pn)

        }else{
            pn.removeContact(c)
            phoneNumberRepository.save(pn)
        }

        return pn
    }

    override fun updateEmail(contact: Contact, old: Email, newEmail: String): Email {
        var new = findByMail(newEmail)
        if(new != null && contact.emails.contains(new))
            throw AssociationAlreadyExistException("This contact already has this email $newEmail")
        //it checks if the old email has only one contact associate (that is this contact)
        if(old.contacts.size == 1){
            //it checks if the new email already exists
            if (new == null){//if the new email doesn't exist it will assign the previous email to the new one
                new = old
                new.mail = newEmail
                contact.removeEmail(old)
            }else{//if the new mail exists it removes the old one and will assign the existing email
                contact.removeEmail(old)
                emailRepository.delete(old)
            }
        }else {//the old email is also associated to other contacts
            if (new == null) {//if the new email doesn't exist it will create a new email
                contact.removeEmail(old)
                new = Email(newEmail)
            } else {//if the new mail exists it removes the old one and will assign the existing mail
                contact.removeEmail(old)
            }
        }
        contact.addEmail(new)
        return emailRepository.save(new)
    }

    override fun updateAddress(contact: Contact, old: Address, newAddress: String): Address {
        var new = findByAddress(newAddress)
        if(new != null && contact.addresses.contains(new))
            throw AssociationAlreadyExistException("This contact already has this address $newAddress")
        //it checks if the old address has only one contact associate (that is this contact)
        if(old.contacts.size == 1){
            //it checks if the new email already exists
            if (new == null){//if the new address doesn't exist it will assign the previous address to the new one
                new = old
                new.address = newAddress
                contact.removeAddress(old)
            }else{//if the new address exists it removes the old one and will assign the existing address
                contact.removeAddress(old)
                addressRepository.delete(old)
            }
        }else {//the old address is also associated to other contacts
            if (new == null) {//if the new address doesn't exist it will create a new address
                contact.removeAddress(old)
                new = Address(newAddress)
            } else {//if the new address exists it removes the old one and will assign the existing address
                contact.removeAddress(old)
            }
        }
        contact.addAddress(new)
        return addressRepository.save(new)
    }

    override fun updatePhoneNumber(contact: Contact, old: PhoneNumber, newPhoneNumber: String): PhoneNumber {
        var new = findByPhoneNumber(newPhoneNumber)
        if(new != null && contact.phoneNumbers.contains(new))
            throw AssociationAlreadyExistException("This contact already has this number $newPhoneNumber")
        //it checks if the old number has only one contact associate (that is this contact)
        if(old.contacts.size == 1){
            //it checks if the new number already exists
            if (new == null){//if the new number doesn't exist it will assign the previous number to the new one
                new = old
                new.number = newPhoneNumber
                contact.removePhoneNumber(old)
            }else{//if the new mail number it removes the old one and will assign the existing number
                contact.removePhoneNumber(old)
                phoneNumberRepository.delete(old)
            }
        }else {//the old number is also associated to other contacts
            if (new == null) {//if the new number doesn't exist it will create a new number
                contact.removePhoneNumber(old)
                new = PhoneNumber(newPhoneNumber)
            } else {//if the new number exists it removes the old one and will assign the existing number
                contact.removePhoneNumber(old)
            }
        }
        contact.addPhoneNumber(new)
        return phoneNumberRepository.save(new)
    }


}
