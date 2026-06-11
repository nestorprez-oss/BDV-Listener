package com.vzla.bdvlistener

import android.app.Application
import com.vzla.bdvlistener.data.db.AppDatabase
import com.vzla.bdvlistener.data.repository.AppRepository
import com.vzla.bdvlistener.util.NotificationHelper

class BDVListenerApp : Application() {

    lateinit var repository: AppRepository
        private set

    override fun onCreate() {
        super.onCreate()

        val db = AppDatabase.getInstance(this)
        repository = AppRepository(db)

        NotificationHelper.createNotificationChannel(this)
    }
}
