package com.example.communication_manager.routes

import com.example.communication_manager.entities.CMEmail
import org.apache.camel.EndpointInject
import org.apache.camel.builder.RouteBuilder
import org.springframework.stereotype.Component
import jakarta.mail.Session
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import org.apache.camel.Exchange
import org.apache.camel.Processor
import org.apache.camel.component.google.mail.GoogleMailEndpoint

@Component
class EmailRouteBuilder : RouteBuilder() {

    @EndpointInject("google-mail:messages/get")
    lateinit var ep: GoogleMailEndpoint

    @EndpointInject("google-mail:messages/send")
    lateinit var sendEp: GoogleMailEndpoint

    override fun configure() {

        from("direct:sendEmail")
            .process {
                val email = it.getIn().headers
                val message = com.google.api.services.gmail.model.Message().apply {
                    raw = createEmail(email.get("to").toString(), "me", email.get("subject").toString(), it.getIn().body.toString())
                }
                sendEp.client.users().messages().send("me", message).execute()
            }

        from("google-mail-stream:0?markAsRead=true&scopes=https://mail.google.com")
                .process {
                    val id = it.getIn().getHeader("CamelGoogleMailId").toString()
                    val message = ep.client.users().messages().get("me", id).execute()
                    val headers = message.payload.headers
                    val subject = headers.find{it.name.equals("subject",true)}?.get("value")?.toString() ?: ""
                    val from = headers.find{it.name.equals("from",true)}?.get("value")?.toString() ?: ""
                    val date = headers.find { it.name.equals("date", true) }?.value ?: ""
                    val to = headers.find { it.name.equals("to", true) }?.value ?: ""
                    val cc = headers.find { it.name.equals("cc", true) }?.value ?: ""
                    val bcc = headers.find { it.name.equals("bcc", true) }?.value ?: ""
                    val messageId = headers.find { it.name.equals("message-id", true) }?.value ?: ""
                    val email = CMEmail(from, subject,message.snippet,date,to,cc,bcc,messageId)
                    it.getIn().setBody(email)

                }
                .multicast()
                .parallelProcessing()
                .to("bean:CMEmailRepository?method=save", "direct:createMessage")

        from("direct:createMessage")
                .process(Processor { exchange ->
                    val email = exchange.getIn().getBody(CMEmail::class.java)
                    val regex = "<(.*?)>".toRegex()
                    val mail = regex.find(email.emailFrom)?.groups?.get(1)?.value
                    val body = mapOf(
                            "sender" to mail,
                            "subject" to email.subject,
                            "body" to email.message,
                            "channel" to "email",
                            "priority" to 1
                    )
                    exchange.getIn().setBody(body)
                })
                .marshal().json()
                .setHeader(Exchange.HTTP_METHOD, constant("POST"))
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://localhost:8050/messages/")
    }

    private fun createEmail(to: String, from: String, subject: String, bodyText: String): String {
        val props = System.getProperties()
        val session = Session.getDefaultInstance(props, null)

        val email = MimeMessage(session)
        email.setFrom(InternetAddress(from))
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, InternetAddress(to))
        email.subject = subject

        val body = jakarta.mail.internet.MimeBodyPart()
        body.setText(bodyText)

        val multipart = jakarta.mail.internet.MimeMultipart()
        multipart.addBodyPart(body)

        email.setContent(multipart)

        val buffer = java.io.ByteArrayOutputStream()
        email.writeTo(buffer)
        return java.util.Base64.getUrlEncoder().encodeToString(buffer.toByteArray())
    }

}