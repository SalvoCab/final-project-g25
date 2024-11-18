package com.example.customer_relationship_management.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@RestControllerAdvice
class ProblemDetailsHandler: ResponseEntityExceptionHandler() {
    @ExceptionHandler(SkillNotFoundException::class)
    fun handleSkillNotFound(e: SkillNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(SkillAlreadyExistsException::class)
    fun handleSkillAlreadyExistsFound(e: SkillAlreadyExistsException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.message!!)

    @ExceptionHandler(MergeContactException::class)
    fun handleMergeContactException(e: MergeContactException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.message!!)

    @ExceptionHandler(ContactNotFoundException::class)
    fun handleContactNotFound(e: ContactNotFoundException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(MessageNotFoundException::class)
    fun handleMessageNotFound(e: MessageNotFoundException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(DuplicateMailException::class)
    fun handleDuplicateMail(e: DuplicateMailException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.message!!)

    @ExceptionHandler(EmailNotFoundException::class)
    fun handleEmailNotFound(e: EmailNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(AddressNotFoundException::class)
    fun handleAddressNotFound(e: AddressNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(PhoneNumberNotFoundException::class)
    fun handlePhoneNumberNotFound(e: PhoneNumberNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(NoAssociationFoundException::class)
    fun handleNoAssociationFound(e: NoAssociationFoundException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.message!!)

    @ExceptionHandler(InvalidStateException::class)
    fun handleInvalidState(e: InvalidStateException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.message!!)

    @ExceptionHandler(InvalidPriorityException::class)
    fun handleInvalidPriority(e: InvalidPriorityException) =
        ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.message!!)

    @ExceptionHandler(AssociationAlreadyExistException::class)
    fun handleAssociationAlreadyExist(e: AssociationAlreadyExistException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.message!!)

    @ExceptionHandler(NoContentException::class)
    fun handleNoContent(e: NoContentException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.message!!)

    @ExceptionHandler(CustomerNotFoundException::class)
    fun handleCustomerNotFound(e: CustomerNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(ProfessionalNotFoundException::class)
    fun handleProfessionalNotFound(e: ProfessionalNotFoundException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message!!)

    @ExceptionHandler(InvalidDeletionException::class)
    fun handleInvalidDeletion(e: InvalidDeletionException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, e.message!!)

}
class ContactNotFoundException(message: String) : Exception(message)

class MergeContactException(message: String) : Exception(message)

class SkillNotFoundException(message: String) : Exception(message)

class SkillAlreadyExistsException(message: String) : Exception(message)

class MessageNotFoundException(message: String) : Exception(message)

class DuplicateMailException(message: String) : Exception(message)

class EmailNotFoundException(message: String) : Exception(message)

class AddressNotFoundException(message: String) : Exception(message)

class PhoneNumberNotFoundException(message: String) : Exception(message)

class NoAssociationFoundException(message: String) : Exception(message)

class AssociationAlreadyExistException(message: String) : Exception(message)

class NoContentException(message: String) : Exception(message)

class InvalidStateException(message: String) : Exception(message)

class InvalidPriorityException(message: String) : Exception(message)

class CustomerNotFoundException(message: String) : Exception(message)

class ProfessionalNotFoundException(message: String) : Exception(message)

class InvalidDeletionException(message: String) : Exception(message)