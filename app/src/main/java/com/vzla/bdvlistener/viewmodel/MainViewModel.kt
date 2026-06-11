package com.vzla.bdvlistener.viewmodel

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.provider.Settings
import android.text.TextUtils
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.vzla.bdvlistener.BDVListenerApp
import com.vzla.bdvlistener.data.db.ConfigEntity
import com.vzla.bdvlistener.service.BankNotifListener
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = (application as BDVListenerApp).repository
    private val prefs: SharedPreferences =
        application.getSharedPreferences(BankNotifListener.PREFS_NAME, Context.MODE_PRIVATE)

    private val _listenerStatus = MutableLiveData<Boolean>(BankNotifListener.isConnected)
    val listenerStatus: LiveData<Boolean> = _listenerStatus

    private val _config = MutableLiveData<ConfigEntity?>()
    val config: LiveData<ConfigEntity?> = _config

    private val _permissionGranted = MutableLiveData<Boolean>(false)
    val permissionGranted: LiveData<Boolean> = _permissionGranted

    init {
        loadConfig()
        checkPermission()
    }

    fun refreshStatus() {
        _listenerStatus.value = BankNotifListener.isConnected
        loadConfig()
        checkPermission()
    }

    private fun loadConfig() {
        viewModelScope.launch {
            val cfg = repository.getConfig()
            _config.value = cfg
        }
    }

    fun checkPermission() {
        val context = getApplication<Application>()
        val cn = ComponentName(context, BankNotifListener::class.java)
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        )
        _permissionGranted.value = flat?.contains(cn.flattenToString()) ?: false
    }

    fun isNotificationListenerEnabled(): Boolean {
        val context = getApplication<Application>()
        val cn = ComponentName(context, BankNotifListener::class.java)
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        )
        return flat?.contains(cn.flattenToString()) ?: false
    }

    fun openNotificationAccessSettings() {
        val context = getApplication<Application>()
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    fun isConfigured(): Boolean {
        val cfg = _config.value ?: return false
        return cfg.packageName.isNotBlank() && cfg.backendUrl.isNotBlank()
    }
}
