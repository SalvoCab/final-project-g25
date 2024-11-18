package com.example.customer_relationship_management.entities

import jakarta.persistence.Entity
import jakarta.persistence.ManyToMany

@Entity
class Skill (
        var skill:String
): EntityBase<Long>(){
    @ManyToMany(mappedBy = "skills")
    val jobOffers: MutableSet<JobOffer> = mutableSetOf()

    fun addJobOffer(jo:JobOffer) {
        jobOffers.add(jo)
        jo.skills.add(this)
    }

    fun removeJobOffer(jo:JobOffer) {
        jobOffers.remove(jo)
        jo.skills.remove(this)
    }

    @ManyToMany(mappedBy = "skills")
    val professionals: MutableSet<Professional> = mutableSetOf()

    fun addProfessional(p:Professional) {
        professionals.add(p)
        p.skills.add(this)
    }

    fun removeProfessional(p:Professional) {
        professionals.remove(p)
        p.skills.remove(this)
    }
}