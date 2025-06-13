package com.example.analytics.entities

import jakarta.persistence.Entity
import jakarta.persistence.Id

@Entity
class CustomerAnalytics (
    @Id
    val id: Long? = 0,
    var name:String = "",
    var surname:String = "",
    var notes:String? = "",
)
{

}