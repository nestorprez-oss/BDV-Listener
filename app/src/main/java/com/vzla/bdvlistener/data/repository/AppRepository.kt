package com.vzla.bdvlistener.data.repository

import com.vzla.bdvlistener.data.db.AppDatabase
import com.vzla.bdvlistener.data.db.ConfigEntity
import com.vzla.bdvlistener.data.db.LogEntity
import com.vzla.bdvlistener.data.network.ApiClient
import com.vzla.bdvlistener.data.network.WebhookPayload
import kotlinx.coroutines.flow.Flow

class AppRepository(private val db: AppDatabase) {

    private val apiClient = ApiClient()
    private val configDao = db.configDao()
    private val logDao = db.logDao()

    suspend fun getConfig(): ConfigEntity? = configDao.getConfig()

    fun observeConfig(): Flow<ConfigEntity?> = configDao.observeConfig()

    suspend fun saveConfig(config: ConfigEntity) {
        configDao.upsertConfig(config)
    }

    fun observeLogs(): Flow<List<LogEntity>> = logDao.observeAll()

    suspend fun insertLog(log: LogEntity): Long = logDao.insert(log)

    suspend fun updateLog(log: LogEntity) = logDao.update(log)

    suspend fun processNotification(
        packageName: String,
        monto: String,
        referencia: String,
        rawText: String,
        config: ConfigEntity
    ): Boolean {
        val log = LogEntity(
            monto = monto,
            referencia = referencia,
            timestamp = System.currentTimeMillis(),
            packageName = packageName,
            rawText = rawText,
            status = "PENDING"
        )
        val logId = insertLog(log)
        val logWithId = log.copy(id = logId)

        val payload = WebhookPayload(
            monto = monto,
            referencia = referencia,
            timestamp = logWithId.timestamp,
            packageName = packageName,
            rawText = rawText
        )

        val result = apiClient.postToBackend(
            url = config.backendUrl,
            payload = payload,
            authToken = config.authToken.takeIf { it.isNotBlank() }
        )

        return if (result.isSuccess) {
            updateLog(logWithId.copy(status = "SENT"))
            true
        } else {
            updateLog(
                logWithId.copy(
                    status = "FAILED",
                    errorMsg = result.exceptionOrNull()?.message
                )
            )
            false
        }
    }

    suspend fun retryPendingAndFailed(): Int {
        val pendingLogs = logDao.getPendingAndFailed()
        val config = configDao.getConfig() ?: return 0

        var successCount = 0
        for (log in pendingLogs) {
            val payload = WebhookPayload(
                monto = log.monto,
                referencia = log.referencia,
                timestamp = log.timestamp,
                packageName = log.packageName,
                rawText = log.rawText
            )

            val result = apiClient.postToBackend(
                url = config.backendUrl,
                payload = payload,
                authToken = config.authToken.takeIf { it.isNotBlank() }
            )

            if (result.isSuccess) {
                updateLog(log.copy(status = "SENT"))
                successCount++
            } else {
                updateLog(
                    log.copy(
                        status = "FAILED",
                        errorMsg = result.exceptionOrNull()?.message
                    )
                )
            }
        }
        return successCount
    }
}
