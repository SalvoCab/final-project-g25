package com.example.customer_relationship_management.services

import com.example.customer_relationship_management.entities.Address
import com.example.customer_relationship_management.entities.Contact
import com.example.customer_relationship_management.entities.Email
import com.example.customer_relationship_management.entities.PhoneNumber

interface ContactDetailsService {

    fun createEmail(email:String, c: Contact): Email

    fun findByMail(email:String):Email?

    fun createAddress(address:String, c: Contact): Address

    fun findByAddress(address:String): Address?

    fun createPhoneNumber(number: String, c: Contact): PhoneNumber

    fun findByPhoneNumber(number :String): PhoneNumber?

    fun findEmailById(id:Long):Email

    fun findAddressById(id:Long):Address

    fun findPhoneNumberById(id:Long):PhoneNumber

    fun updateEmail(contact: Contact,old:Email,newEmail:String):Email

    fun updateAddress(contact: Contact,old:Address,newAddress:String):Address

    fun updatePhoneNumber(contact: Contact,old:PhoneNumber,newPhoneNumber:String):PhoneNumber

    fun deleteEmail(e:Email, c: Contact) : Email

    fun deleteAddress(a: Address, c: Contact) : Address

    fun deletePhoneNumber(pn: PhoneNumber, c: Contact) : PhoneNumber
}