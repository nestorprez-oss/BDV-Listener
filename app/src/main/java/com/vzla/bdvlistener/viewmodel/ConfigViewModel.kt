package com.vzla.bdvlistener.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vzla.bdvlistener.BDVListenerApp
import com.vzla.bdvlistener.data.db.ConfigEntity
import com.vzla.bdvlistener.util.ExtractionResult
import com.vzla.bdvlistener.util.RegexExtractor
import kotlinx.coroutines.launch

class ConfigViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = (application as BDVListenerApp).repository

    suspend fun loadConfig(): ConfigEntity? {
        return repository.getConfig()
    }

    fun saveConfig(
        packageName: String,
        backendUrl: String,
        authToken: String,
        regexMonto: String,
        regexRef: String
    ) {
        viewModelScope.launch {
            val config = ConfigEntity(
                id = 1,
                packageName = packageName,
                backendUrl = backendUrl,
                authToken = authToken,
                regexMonto = regexMonto.ifBlank { ConfigEntity().regexMonto },
                regexRef = regexRef.ifBlank { ConfigEntity().regexRef },
                listenerEnabled = true
            )
            repository.saveConfig(config)
        }
    }

    fun testRegex(
        text: String,
        regexMonto: String,
        regexRef: String
    ): ExtractionResult {
        return RegexExtractor.extract(text, regexMonto, regexRef)
    }
}
