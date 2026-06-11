package com.vzla.bdvlistener.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notification_log")
data class LogEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val monto: String = "",
    val referencia: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val packageName: String = "",
    val rawText: String = "",
    val status: String = "PENDING",
    val errorMsg: String? = null
)
