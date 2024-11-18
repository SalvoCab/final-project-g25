package com.example.customer_relationship_management.controllers

import com.example.customer_relationship_management.dtos.CreateProfessionalDTO
import com.example.customer_relationship_management.dtos.ProfessionalDTO
import com.example.customer_relationship_management.dtos.toDto
import com.example.customer_relationship_management.services.ContactDetailsService
import com.example.customer_relationship_management.services.ContactService
import com.example.customer_relationship_management.services.ProfessionalService
import com.example.customer_relationship_management.services.SkillService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/professionals")
class ProfessionalController(private val professionalService: ProfessionalService, private val contactService: ContactService, private val contactDetailsService: ContactDetailsService, private val skillService: SkillService) {
    private val logger = LoggerFactory.getLogger(ProfessionalController::class.java)
    @GetMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun listPaginated(@RequestParam(defaultValue = "0") page: Int,
                      @RequestParam(defaultValue = "20") limit : Int,
                      @RequestParam(defaultValue ="") skills: List<Long>,
                      @RequestParam(defaultValue ="") location: String,
                      @RequestParam(defaultValue ="") state: String): List<ProfessionalDTO> {
        val offset = page * limit
        return professionalService.listPaginated(offset, limit,skills, location, state)
    }

    @PostMapping("/{contactId}")
    @ResponseStatus(HttpStatus.OK)
    fun createProfessional(@RequestBody dto: CreateProfessionalDTO, @PathVariable contactId: Long) : ProfessionalDTO {
        if (dto.location == "" || dto.state == "" || dto.dailyRate.isNaN())
            throw NoContentException("Provide a valid professional")
        val contact = contactService.findById(contactId)
        val skills = dto.skills?.map{skill-> skillService.findById(skill)}

        val createdProfessional = professionalService.createProfessional(dto.location, dto.state,dto.dailyRate, skills, contact)
        logger.info("Professional with ID:${createdProfessional.getId()} associated with a contact ID:${contact.getId()} has been created")
        return createdProfessional.toDto()
    }

    @PutMapping("/{professionalId}")
    @ResponseStatus(HttpStatus.OK)
    fun updateProfessional(@RequestBody dto: CreateProfessionalDTO, @PathVariable professionalId: Long) : ProfessionalDTO {
        if (dto.location == "" || dto.state == "" || dto.dailyRate.isNaN())
            throw NoContentException("Provide a valid professional")
        val professional = professionalService.findById(professionalId)
        val updatedProfessional = professionalService.updateProfessional(dto.location, dto.state,dto.dailyRate, professional)
        logger.info("Professional with ID:${updatedProfessional.getId()} have been updated")
        return updatedProfessional.toDto()
    }

    @GetMapping("/{professionalId}")
    fun getDetailsById(@PathVariable professionalId: Long): ResponseEntity<Any> {
        val professional = professionalService.findById(professionalId)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_professional" to professional.getId(),
                "id_contact" to professional.contact.getId(),
                "name" to professional.contact.name,
                "surname" to professional.contact.surname,
                "location" to professional.location,
                "state" to professional.state,
                "daily_rate" to professional.dailyRate,
                "category" to professional.contact.category,
                "ssn_code" to professional.contact.ssnCode,
                "emails" to professional.contact.emails.map { it.mail },
                "addresses" to professional.contact.addresses.map { it.address },
                "phone_numbers" to professional.contact.phoneNumbers.map { it.number },
                "skills" to professional.skills.map{it.skill}
        ))
    }

    //This API Delete only the Professional, the contact will be still available, and it's category will be set on "unknown"
    @DeleteMapping("/{professionalId}")
    @ResponseStatus(HttpStatus.OK)
    fun deleteProfessional(@PathVariable professionalId: Long): ProfessionalDTO {
        val professional = professionalService.findById(professionalId)
        val professionalDeleted= professional.toDto()
        professionalService.deleteProfessional(professional)
        logger.info("Professional with ID '${professional.getId()}' has been deleted.")
        return professionalDeleted
    }


    //This API Delete the Professional and also the associated contact
    @DeleteMapping("/{professionalId}/contact")
    @ResponseStatus(HttpStatus.OK)
    fun deleteProfessionalContact(@PathVariable professionalId: Long): ProfessionalDTO {
        val professional = professionalService.findById(professionalId)
        val professionalDeleted= professional.toDto()
        professionalService.deleteProfessional(professional)
        //creating copy to avoid ConcurrentModificationException
        val emailsCopy = ArrayList(professional.contact.emails)
        val addressesCopy = ArrayList(professional.contact.addresses)
        val phoneNumbersCopy = ArrayList(professional.contact.phoneNumbers)

        //iteration in all copies
        emailsCopy.forEach { email ->
            contactDetailsService.deleteEmail(email, professional.contact)
        }
        addressesCopy.forEach { address ->
            contactDetailsService.deleteAddress(address, professional.contact)
        }
        phoneNumbersCopy.forEach { number ->
            contactDetailsService.deletePhoneNumber(number, professional.contact)
        }
        contactService.deleteContact(professional.contact)
        logger.info("Professional with ID '${professional.getId()}' and Contact with ID: '${professional.contact.getId()}'have been deleted.")
        return professionalDeleted
    }

    //This API associate an existing skill to a professional if the skill exists,
    //otherwise it creates the skill and then associate it to a professional
    @PostMapping("/{professionalId}/addskill")
    @ResponseStatus(HttpStatus.OK)
    fun addProfessionalSkill(@RequestBody skill: String, @PathVariable professionalId: Long) : ProfessionalDTO {
        val professional = professionalService.findById(professionalId)
        if (skill == "")
            throw NoContentException("Provide a valid skill")
        val s = skillService.findBySkill(skill)
        val newSkill = if (s.isEmpty()){
            skillService.createSkill(skill)
        }else{
            s[0]
        }

        val newProfessional = professionalService.addProfessionalSkill(professional, newSkill)
        logger.info("Professional with ID:${newProfessional.getId()} added skill: $skill")
        return newProfessional.toDto()
    }

    @DeleteMapping("/{professionalId}/skill")
    @ResponseStatus(HttpStatus.OK)
    fun removeProfessionalSkill(@RequestBody skill: String, @PathVariable professionalId: Long) : ProfessionalDTO {
        val professional = professionalService.findById(professionalId)
        val s = skillService.findBySkill(skill)
        if (skill == "" || s.isEmpty())
            throw NoContentException("Provide a valid skill")
        if(!professional.skills.contains(s[0]))
            throw NoAssociationFoundException("This professional (ID:$professionalId) does not have this skill $skill")

        val newProfessional = professionalService.removeProfessionalSkill(professional, s[0])
        logger.info("Professional with ID:${newProfessional.getId()} added skill: $skill")
        return newProfessional.toDto()
    }

    //This API associate an existing skill to a professional
    @PostMapping("/{professionalId}/skill")
    @ResponseStatus(HttpStatus.OK)
    fun associateProfessionalSkill(@RequestBody skill: String, @PathVariable professionalId: Long) : ProfessionalDTO {
        val professional = professionalService.findById(professionalId)
        val s = skillService.findBySkill(skill)
        if (skill == "" || s.isEmpty())
            throw NoContentException("Provide a valid skill")
        val newSkill = s[0]
        val newProfessional = professionalService.addProfessionalSkill(professional, newSkill)
        logger.info("Professional with ID:${newProfessional.getId()} added skill: $skill")
        return newProfessional.toDto()
    }
}