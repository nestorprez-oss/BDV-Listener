package com.vzla.bdvlistener.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ConfigDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertConfig(config: ConfigEntity)

    @Query("SELECT * FROM config WHERE id = 1")
    suspend fun getConfig(): ConfigEntity?

    @Query("SELECT * FROM config WHERE id = 1")
    fun observeConfig(): Flow<ConfigEntity?>
}
