package com.example.customer_relationship_management.entities

import jakarta.persistence.*

@Entity
class Professional (
        var location: String,
        var state: String,
        var dailyRate: Double,
        @OneToOne
        @JoinColumn(name = "contact_id")
        val contact: Contact
): EntityBase<Long>() {
    @OneToMany(mappedBy = "professional",cascade = [CascadeType.ALL])
    val enroles = mutableSetOf<JobOffer>()
    fun addJob(e: JobOffer) {
        e.professional = this
        enroles.add(e)
    }

    fun removeJob(e: JobOffer) {
        e.professional = null
        enroles.remove(e)
    }

    @ManyToMany
    @JoinTable(name="professional_skill",
            joinColumns = [JoinColumn(name="professional_id")],
            inverseJoinColumns = [JoinColumn(name="skill_id")]
    )
    val skills: MutableSet<Skill> = mutableSetOf()

    fun addSkill(s: Skill) {
        skills.add(s)
        s.professionals.add(this)
    }

    fun removeSkill(s: Skill) {
        skills.remove(s)
        s.professionals.remove(this)
    }
}