package com.example.customer_relationship_management.controllers


import com.example.customer_relationship_management.dtos.*
import com.example.customer_relationship_management.services.SkillService
import com.example.customer_relationship_management.services.SortDirection
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/skills")
class SkillController (private val skillService: SkillService) {

    private val logger = LoggerFactory.getLogger(SkillController::class.java)

    @GetMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun listPaginated(@RequestParam(defaultValue = "0") page: Int,
                @RequestParam(defaultValue = "20") limit : Int,
                @RequestParam(defaultValue ="") keyword: String,
                @RequestParam(defaultValue = "0") sortDirection: Int): List<SkillDTO> {

        val offset = page * limit
        var direction = SortDirection.ASC
        if(sortDirection == 1){
            direction = SortDirection.DESC
        }
        return skillService.listPaginated(offset, limit,keyword,direction)
    }

    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    fun listAll(): List<SkillDTO> {
        return skillService.listAll()
    }

    @PostMapping("/","")
    @ResponseStatus(HttpStatus.OK)
    fun createSkill(@RequestBody skill:String) : SkillDTO {
        if (skill == "")
            throw NoContentException("Provide a valid skill name")
        val found = skillService.findBySkill(skill)
        if(found.isNotEmpty()) {
            throw SkillAlreadyExistsException("The skill with name $skill already exist.")
        }else {

            val createdSkill = skillService.createSkill(skill)

            logger.info("The skill :${createdSkill.skill} has been created")
            return createdSkill.toDto()
        }
    }

    @PutMapping("/{skillId}")
    fun updateSkill(@PathVariable skillId: Long,@RequestBody skill: String) : ResponseEntity<Any> {
        if (skill == "")
            throw NoContentException("Provide a valid skill name")
        val found = skillService.findBySkill(skill)

        if(found.isNotEmpty()) {
            throw SkillAlreadyExistsException("The skill with name $skill already exist.")
        }else{
            val oldskill = skillService.findById(skillId)
            val OldName= oldskill.skill
            skillService.updateSkill(oldskill,skill)
            logger.info("skill with ID : ${oldskill.getId()} and name: $OldName --> has been updated to $skill successfully")
            return ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id_skill" to oldskill.getId(),
                "old_name" to OldName,
                "new_name" to skill))

        }
    }

    @DeleteMapping("/{skillId}")
    fun deleteSkill(@PathVariable skillId: Long): ResponseEntity<Any> {

        val skill = skillService.findById(skillId)

        //delete skill
        val deletedSkill = skillService.deleteSkill(skill)
        logger.info("Skill with ID '${skill.getId()}' has been deleted.")
        return ResponseEntity.ok().body(deletedSkill)
    }




}