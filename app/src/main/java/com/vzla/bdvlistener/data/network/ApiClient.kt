package com.vzla.bdvlistener.data.network

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class WebhookPayload(
    @SerializedName("monto")
    val monto: String,
    @SerializedName("referencia")
    val referencia: String,
    @SerializedName("timestamp")
    val timestamp: Long,
    @SerializedName("package_name")
    val packageName: String,
    @SerializedName("raw_text")
    val rawText: String?
)

class ApiClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun postToBackend(
        url: String,
        payload: WebhookPayload,
        authToken: String?
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(payload)
            val body = json.toRequestBody(jsonMediaType)

            val requestBuilder = Request.Builder()
                .url(url)
                .post(body)
                .header("Content-Type", "application/json")

            if (!authToken.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $authToken")
            }

            val response = client.newCall(requestBuilder.build()).execute()

            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(
                    Exception("HTTP ${response.code}: ${response.message}")
                )
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
