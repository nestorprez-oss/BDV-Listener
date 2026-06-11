package com.vzla.bdvlistener.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.vzla.bdvlistener.BDVListenerApp
import com.vzla.bdvlistener.data.db.LogEntity
import com.vzla.bdvlistener.data.repository.AppRepository

class HistoryViewModel(application: Application) : AndroidViewModel(application) {

    val logs = (application as BDVListenerApp).repository
        .observeLogs()
        .asLiveData(viewModelScope.coroutineContext)
}
