package com.example.customer_relationship_management.entities

import jakarta.persistence.*

@Entity
class JobOffer (
        var description: String,
        var state: String,
        var notes: String?,
        var duration: Int,
        var value: Double?,
        @ManyToOne
        var customer: Customer?,
        @ManyToOne
        var professional: Professional?
): EntityBase<Long>() {
    @ManyToMany
    @JoinTable(name="joboffer_skill",
            joinColumns = [JoinColumn(name="joboffer_id")],
            inverseJoinColumns = [JoinColumn(name="skill_id")]
    )
    val skills: MutableSet<Skill> = mutableSetOf()

    fun addSkill(s: Skill) {
        skills.add(s)
        s.jobOffers.add(this)
    }

    fun removeSkill(s: Skill) {
        skills.remove(s)
        s.jobOffers.remove(this)
    }

    fun goToSelectionPhase(note:String) {
        this.state="Selection Phase"
        this.notes=note
    }

    fun goToAborted(note:String) {
        this.state="Aborted"
        this.notes=note
    }

    fun goToCandidateProposal(note:String) {
        this.state="Candidate Proposal"
        this.notes=note
    }

    fun goToConsolidated(note:String) {
        this.state="Consolidated"
        this.notes=note
    }

    fun goToDone(note:String) {
        this.state="Done"
        this.notes=note
    }
}