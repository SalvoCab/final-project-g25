package com.example.communication_manager.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@RestControllerAdvice
class ProblemDetailsHandler: ResponseEntityExceptionHandler() {

    @ExceptionHandler(EmailFormatException::class)
    fun handleEmailFormat(e: EmailFormatException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.NOT_ACCEPTABLE, e.message!!)

    @ExceptionHandler(NoContentException::class)
    fun handleNoContent(e: NoContentException) =
            ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.message!!)
}
    class EmailFormatException(message: String) : Exception(message)

    class NoContentException(message: String) : Exception(message)

