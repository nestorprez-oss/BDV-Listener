package com.vzla.bdvlistener.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "config")
data class ConfigEntity(
    @PrimaryKey
    val id: Int = 1,
    val packageName: String = "",
    val backendUrl: String = "",
    val authToken: String = "",
    val regexMonto: String = "(?:Bs\\.?\\s*)?(?<monto>\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2}))",
    val regexRef: String = "(?:numero de operacion|Ref:)\\s*(?<ref>\\d{10,12})",
    val listenerEnabled: Boolean = true
)
