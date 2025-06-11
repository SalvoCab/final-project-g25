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
    var professional: Professional? // candidato selezionato
) : EntityBase<Long>() {

    @ManyToMany
    @JoinTable(
        name = "joboffer_skill",
        joinColumns = [JoinColumn(name = "joboffer_id")],
        inverseJoinColumns = [JoinColumn(name = "skill_id")]
    )
    val skills: MutableSet<Skill> = mutableSetOf()

    @OneToMany(mappedBy = "jobOffer", cascade = [CascadeType.ALL], orphanRemoval = true)
    val candidateAssociations: MutableSet<JobOfferCandidate> = mutableSetOf()

    fun addCandidate(p: Professional, status: String? = null, note: String? = null) {
        val association = JobOfferCandidate(
            jobOffer = this,
            professional = p,
            status = status,
            note = note
        )
        candidateAssociations.add(association)
    }

    fun removeCandidate(p: Professional) {
        candidateAssociations.removeIf { it.professional == p }
    }

    fun addSkill(s: Skill) {
        skills.add(s)
        s.jobOffers.add(this)
    }

    fun removeSkill(s: Skill) {
        skills.remove(s)
        s.jobOffers.remove(this)
    }


    fun goToSelectionPhase(note: String) {
        this.state = "Selection Phase"
        this.notes = note
    }

    fun goToAbortedOne(note: String) {
        this.state = "AbortedOne"
        this.notes = note
    }
    fun goToAbortedTwo(note: String) {
        this.state = "AbortedTwo"
        this.notes = note
    }
    fun goToAbortedThree(note: String) {
        this.state = "AbortedThree"
        this.notes = note
    }

    fun goToCandidateProposal(note: String) {
        this.state = "Candidate Proposal"
        this.notes = note
    }

    fun goToConsolidated(note: String) {
        this.state = "Consolidated"
        this.notes = note
    }

    fun goToDone(note: String) {
        this.state = "Done"
        this.notes = note
    }
}
