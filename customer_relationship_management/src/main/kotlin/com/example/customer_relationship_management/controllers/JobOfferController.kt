package com.example.customer_relationship_management.controllers

import com.example.customer_relationship_management.dtos.*
import com.example.customer_relationship_management.services.CustomerService
import com.example.customer_relationship_management.services.JobOfferService
import com.example.customer_relationship_management.services.ProfessionalService
import com.example.customer_relationship_management.services.SkillService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/joboffers")
class JobOfferController(private val jobOfferService: JobOfferService, private val customerService: CustomerService,private val professionalService: ProfessionalService, private val skillService: SkillService) {

    private val logger = LoggerFactory.getLogger(JobOfferController::class.java)

    @GetMapping("/", "")
    @ResponseStatus(HttpStatus.OK)
    fun listPaginated(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(defaultValue = "") state: String,
        @RequestParam(defaultValue = "0") customer: Long,
        @RequestParam(defaultValue = "0") professional: Long
    ): List<JobOfferDTO> {
        val offset = page * limit
        return jobOfferService.listPaginated(offset, limit, state, customer, professional)
    }

    @GetMapping("/open/{customerId}")
    @ResponseStatus(HttpStatus.OK)
    fun listOpenPaginated(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @PathVariable customerId: Long
    ): List<JobOfferDTO> {
        customerService.findById(customerId)
        val offset = page * limit
        return jobOfferService.listOpenPaginated(offset, limit,customerId, listOf("aborted","consolidated","done"))
    }

    @GetMapping("/accepted/{professionalId}")
    @ResponseStatus(HttpStatus.OK)
    fun listAcceptedPaginated(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @PathVariable professionalId: Long
    ): List<JobOfferDTO> {
        professionalService.findById(professionalId)
        val offset = page * limit
        return jobOfferService.listAcceptedPaginated(offset, limit,professionalId, listOf("aborted","created","selection phase","candidate proposal"))
    }

    @GetMapping("/aborted/","/aborted")
    @ResponseStatus(HttpStatus.OK)
    fun listAbortedPaginated(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(defaultValue = "0") customer: Long,
        @RequestParam(defaultValue = "0") professional: Long
    ): List<JobOfferDTO> {
        val offset = page * limit
        return jobOfferService.listAbortedPaginated(offset, limit, "aborted", customer, professional)
    }

    @GetMapping("/candidates/one/{jobOfferId}")
    @ResponseStatus(HttpStatus.OK)
    fun listCandidatesFirstPhase(
        @PathVariable jobOfferId: Long
    ): List<JobOfferCandidateDTO> {
        return jobOfferService.listCandidateFirstPhase(jobOfferId)
    }
    @GetMapping("/candidates/two/{jobOfferId}")
    @ResponseStatus(HttpStatus.OK)
    fun listCandidatesSecondPhase(
        @PathVariable jobOfferId: Long
    ): List<JobOfferCandidateDTO> {
        return jobOfferService.listCandidateSecondPhase(jobOfferId)
    }

    @PostMapping("/{customerId}/customer")
    @ResponseStatus(HttpStatus.OK)
    fun createJobOffer(@RequestBody dto: CreateJobOfferDTO,@PathVariable customerId: Long): JobOfferDTO {
        val customer = customerService.findById(customerId)
        if (dto.description == "" || dto.duration <= 0)
            throw NoContentException("Provide a valid description or duration")

        val skills = dto.skills?.map{skill-> skillService.findById(skill)}
        val createdJobOffer = jobOfferService.createJobOffer(
            dto.description,
            "Created",
            dto.notes,
            dto.duration,
            null,
                customer,
            null,
            skills
        )
        logger.info("Job Offer with ID:${createdJobOffer.getId()}, customer:$customerId has been created")
        return createdJobOffer.toDto()
    }

    @PutMapping("/{jobOfferId}")
    @ResponseStatus(HttpStatus.OK)
    fun updateJobOffer(@PathVariable jobOfferId: Long, @RequestBody dto: CreateJobOfferDTO): JobOfferDTO {
        val jobOffer = jobOfferService.findById(jobOfferId)
        val jb = jobOfferService.updateJobOffer(
            dto.description,
            dto.notes,
            dto.duration,
                jobOffer
        )
        logger.info("Job Offer with ID $jobOfferId has been updated.")
        return jb.toDto()
    }

    @PutMapping("/candidate/{candidateId}")
    @ResponseStatus(HttpStatus.OK)
    fun updateCandidate(@PathVariable candidateId: Long, @RequestParam note:String, @RequestParam state: String): JobOfferCandidateDTO {
        val candidate = jobOfferService.findCandidateByID(candidateId)
        candidate.status=state
        candidate.note=note
        val c = jobOfferService.updateCandidate(candidate)

        return c.toDto()
    }

    @DeleteMapping("/{jobOfferId}")
    fun deleteJobOffer(@PathVariable jobOfferId: Long): ResponseEntity<Any> {
        val jobOffer = jobOfferService.findById(jobOfferId)
        val deletedJB = jobOffer.toDto()
        jobOfferService.deleteJobOffer(jobOffer)
        logger.info("Job Offer with ID '${jobOfferId}' has been deleted.")
        return ResponseEntity.status(HttpStatus.OK).body(
                deletedJB
        )
    }

    @PostMapping("/next/{jobOfferId}")
    fun updateJobOfferStatus(@PathVariable jobOfferId: Long, @RequestBody dto: UpdateJobOfferStatusDTO): ResponseEntity<Any> {

        val jb = jobOfferService.findById(jobOfferId)
        val professional=if(dto.state.lowercase()=="consolidated" && dto.professionalId != null){
            professionalService.findById(dto.professionalId)
        }else null
        logger.info("Job Offer with ID '${jb.getId()}' has a new state : '${dto.state}'.")
        val updatedJobOffer = jobOfferService.updateJobOfferStatus(dto.state, dto.notes,professional, jb)
        logger.info("Job Offer with ID '${updatedJobOffer.getId()}' has a new state : '${updatedJobOffer.state}'.")

        return ResponseEntity.status(HttpStatus.OK).body(updatedJobOffer.toDto())

    }

    @GetMapping("/{jobOfferId}/value")
    fun getJobOfferValue(@PathVariable jobOfferId: Long): ResponseEntity<Any> {
        val jobOffer = jobOfferService.findById(jobOfferId)
        return ResponseEntity.status(HttpStatus.OK).body(mapOf(
            "job_id" to jobOffer.getId(),
            "value" to jobOffer.value
        ))
    }

    //This API associate an existing skill to a job offer if the skill exists,
    //otherwise it creates the skill and then associate it to a job offer
    @PostMapping("/{jobOfferId}/addskill")
    @ResponseStatus(HttpStatus.OK)
    fun addJobOfferSkill(@RequestBody skill: String, @PathVariable jobOfferId: Long) : JobOfferDTO {
        val jobOffer = jobOfferService.findById(jobOfferId)
        if (skill == "")
            throw NoContentException("Provide a valid skill")
        val s = skillService.findBySkill(skill)
        val newSkill = if (s.isEmpty()){
            skillService.createSkill(skill)
        }else{
            s[0]
        }

        val newJobOffer= jobOfferService.addJobOfferSkill(jobOffer, newSkill)
        logger.info("Professional with ID:${newJobOffer.getId()} added skill: $skill")
        return newJobOffer.toDto()
    }

    @DeleteMapping("/{jobOfferId}/skill")
    @ResponseStatus(HttpStatus.OK)
    fun removeJobOfferSkill(@RequestBody skill: String, @PathVariable jobOfferId: Long) : JobOfferDTO {
        val jobOffer = jobOfferService.findById(jobOfferId)
        val s = skillService.findBySkill(skill)
        if (skill == "" || s.isEmpty())
            throw NoContentException("Provide a valid skill")
        if(!jobOffer.skills.contains(s[0]))
            throw NoAssociationFoundException("This job offer (ID:$jobOfferId) does not have this skill $skill")

        val newJobOffer = jobOfferService.removeJobOfferSkill(jobOffer, s[0])
        logger.info("job offer with ID:${newJobOffer.getId()} added skill: $skill")
        return newJobOffer.toDto()
    }

    //This API associate an existing skill to a professional
    @PostMapping("/{jobOfferId}/skill")
    @ResponseStatus(HttpStatus.OK)
    fun associateJobOfferSkill(@RequestBody skill: String, @PathVariable jobOfferId: Long) : JobOfferDTO {
        val jobOffer = jobOfferService.findById(jobOfferId)
        val s = skillService.findBySkill(skill)
        if (skill == "" || s.isEmpty())
            throw NoContentException("Provide a valid skill")
        val newSkill = s[0]
        val newJobOffer = jobOfferService.addJobOfferSkill(jobOffer, newSkill)
        logger.info("job offer with ID:${newJobOffer.getId()} added skill: $skill")
        return newJobOffer.toDto()
    }
    @PostMapping("/{jobOfferId}/candidates")
    @ResponseStatus(HttpStatus.OK)
    fun addCandidatesToJobOffer(
        @PathVariable jobOfferId: Long,
        @RequestBody candidates: List<JobOfferCandidateRequestDTO>
    ): JobOfferDTO {
        if (candidates.isEmpty()) {
            throw NoContentException("Provide at least one candidate")
        }

        val jobOffer = jobOfferService.findById(jobOfferId)

        candidates.forEach { dto ->
            logger.info("Adding candidate with ID:${dto} to job offer with ID:${jobOfferId}")
            val professional = professionalService.findById(dto.professionalId)
            jobOffer.addCandidate(professional, dto.status, dto.note)
        }

        val updatedJobOffer = jobOfferService.save(jobOffer)

        logger.info("Job Offer with ID: $jobOfferId has new candidates: ${candidates.map { it.professionalId }}")

        return updatedJobOffer.toDto()
    }

    @DeleteMapping("/{jobOfferId}/candidates/{professionalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeCandidateFromJobOffer(
        @PathVariable jobOfferId: Long,
        @PathVariable professionalId: Long
    ) {
        val jobOffer = jobOfferService.findById(jobOfferId)
        val professional = professionalService.findById(professionalId)
        jobOffer.removeCandidate(professional)
        jobOfferService.save(jobOffer)
        logger.info("Removed candidate $professionalId from job offer $jobOfferId")
    }


}