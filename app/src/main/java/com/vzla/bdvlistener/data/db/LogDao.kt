package com.vzla.bdvlistener.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface LogDao {

    @Insert
    suspend fun insert(log: LogEntity): Long

    @Update
    suspend fun update(log: LogEntity)

    @Query("SELECT * FROM notification_log ORDER BY timestamp DESC")
    fun observeAll(): Flow<List<LogEntity>>

    @Query("SELECT * FROM notification_log WHERE status IN ('PENDING', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getPendingAndFailed(): List<LogEntity>

    @Query("DELETE FROM notification_log WHERE timestamp < :before")
    suspend fun deleteOlderThan(before: Long)
}
