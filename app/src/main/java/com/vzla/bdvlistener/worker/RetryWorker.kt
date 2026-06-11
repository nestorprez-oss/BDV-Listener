package com.vzla.bdvlistener.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.vzla.bdvlistener.BDVListenerApp
import java.util.concurrent.TimeUnit

class RetryWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val TAG = "RetryWorker"
        const val UNIQUE_WORK_NAME = "retry_failed_notifications"

        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<RetryWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    30,
                    TimeUnit.SECONDS
                )
                .build()

            WorkManager.getInstance(context)
                .enqueueUniqueWork(
                    UNIQUE_WORK_NAME,
                    ExistingWorkPolicy.REPLACE,
                    request
                )

            Log.d(TAG, "Retry worker enqueued")
        }
    }

    override suspend fun doWork(): Result {
        Log.d(TAG, "Retry worker started")

        val app = applicationContext as? BDVListenerApp ?: return Result.failure()
        val repository = app.repository

        return try {
            val successCount = repository.retryPendingAndFailed()
            Log.d(TAG, "Retry completed. Successful: $successCount")
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Retry worker failed", e)
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}
