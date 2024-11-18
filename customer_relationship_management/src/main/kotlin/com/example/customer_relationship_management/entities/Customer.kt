package com.example.customer_relationship_management.entities

import jakarta.persistence.*

@Entity
class Customer (

        var notes: String?,
        @OneToOne
        @JoinColumn(name = "contact_id")
        val contact: Contact
): EntityBase<Long>() {
        @OneToMany(mappedBy = "customer",cascade = [CascadeType.ALL])
        val offers = mutableSetOf<JobOffer>()
        fun addJob(job: JobOffer) {
                job.customer = this
                offers.add(job)
        }
        fun removeJob(job: JobOffer) {
                job.customer = null
                offers.remove(job)
        }
}