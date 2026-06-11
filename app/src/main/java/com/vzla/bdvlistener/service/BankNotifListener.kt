package com.vzla.bdvlistener.service

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.vzla.bdvlistener.BDVListenerApp
import com.vzla.bdvlistener.data.db.ConfigEntity
import com.vzla.bdvlistener.util.NotificationHelper
import com.vzla.bdvlistener.util.RegexExtractor
import kotlinx.coroutines.*

class BankNotifListener : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var prefs: SharedPreferences

    companion object {
        const val TAG = "BankNotifListener"
        const val PREFS_NAME = "listener_prefs"
        const val KEY_IS_CONNECTED = "is_connected"
        const val KEY_IS_PROCESSING = "is_processing"

        var isConnected: Boolean = false
            private set

        var isProcessing: Boolean = false
            private set
    }

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        if (NotificationHelper.hasNotificationPermission(this)) {
            try {
                val notification = NotificationHelper.buildForegroundNotification(this)
                startForeground(
                    NotificationHelper.FOREGROUND_NOTIFICATION_ID,
                    notification
                )
            } catch (e: Exception) {
                Log.w(TAG, "Could not start foreground service", e)
            }
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        isConnected = true
        prefs.edit().putBoolean(KEY_IS_CONNECTED, true).apply()
        Log.d(TAG, "Listener connected")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        isConnected = false
        prefs.edit().putBoolean(KEY_IS_CONNECTED, false).apply()
        Log.d(TAG, "Listener disconnected. Requesting rebind...")
        requestRebind(android.content.ComponentName(this, BankNotifListener::class.java))
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        serviceScope.launch {
            if (isProcessing) {
                Log.d(TAG, "Already processing a notification, skipping")
                return@launch
            }

            val app = applicationContext as? BDVListenerApp ?: return@launch
            val config = app.repository.getConfig() ?: return@launch

            if (!config.listenerEnabled) return@launch
            if (config.packageName.isBlank()) return@launch

            val sbnPackageName = sbn.packageName ?: ""
            if (sbnPackageName != config.packageName) return@launch

            isProcessing = true
            try {
                processNotification(sbn, config, app)
            } finally {
                isProcessing = false
            }
        }
    }

    private suspend fun processNotification(
        sbn: StatusBarNotification,
        config: ConfigEntity,
        app: BDVListenerApp
    ) {
        val textsToSearch = mutableListOf<String>()

        sbn.notification?.extras?.let { extras ->
            Log.d(TAG, "=== Notification from ${sbn.packageName} ===")
            Log.d(TAG, "Keys: ${extras.keySet()}")

            for (key in extras.keySet()) {
                val value = extras.get(key)
                val str = when (value) {
                    is String -> value
                    is CharSequence -> value.toString()
                    else -> null
                }
                if (!str.isNullOrBlank()) {
                    Log.d(TAG, "Key [$key] = $str")
                    textsToSearch.add(str)
                }
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            sbn.notification?.tickerText?.toString()?.let {
                if (!textsToSearch.contains(it)) {
                    Log.d(TAG, "tickerText = $it")
                    textsToSearch.add(it)
                }
            }
        }

        if (textsToSearch.isEmpty()) {
            Log.w(TAG, "No text found in notification extras for package ${sbn.packageName}")
            return
        }

        val rawText = textsToSearch.joinToString(" | ")

        Log.d(TAG, "Raw combined text: $rawText")
        Log.d(TAG, "Regex monto: ${config.regexMonto}, regex ref: ${config.regexRef}")

        val result = RegexExtractor.extractFromMultipleTexts(
            texts = textsToSearch,
            regexMonto = config.regexMonto,
            regexRef = config.regexRef
        )

        Log.d(TAG, "Extracted - monto: ${result.monto}, ref: ${result.referencia}")

        val success = app.repository.processNotification(
            packageName = sbn.packageName ?: "",
            monto = result.monto ?: "",
            referencia = result.referencia ?: "",
            rawText = rawText,
            config = config
        )

        Log.d(TAG, if (success) "Notification sent to backend" else "Failed to send notification to backend")
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        isConnected = false
        prefs.edit().putBoolean(KEY_IS_CONNECTED, false).apply()
    }
}
