package com.vzla.bdvlistener

import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.vzla.bdvlistener.data.db.LogEntity
import com.vzla.bdvlistener.data.repository.AppRepository
import com.vzla.bdvlistener.databinding.ActivityMainBinding
import com.vzla.bdvlistener.viewmodel.MainViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    private lateinit var repository: AppRepository

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            Toast.makeText(this, R.string.status_permission_granted, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val app = application as BDVListenerApp
        repository = app.repository
        viewModel = ViewModelProvider(this)[MainViewModel::class.java]

        setupObservers()
        setupClickListeners()
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshStatus()
    }

    private fun setupObservers() {
        viewModel.permissionGranted.observe(this) { granted ->
            binding.tvPermissionStatus.apply {
                text = if (granted) getString(R.string.status_permission_granted)
                else getString(R.string.status_permission_denied)
                setTextColor(
                    getColor(
                        if (granted) R.color.success_color
                        else R.color.error_color
                    )
                )
            }
            binding.btnGrantPermission.isEnabled = !granted
        }

        viewModel.listenerStatus.observe(this) { connected ->
            binding.tvListenerStatus.apply {
                text = if (connected) getString(R.string.status_listener_active)
                else getString(R.string.status_listener_inactive)
                setTextColor(
                    getColor(
                        if (connected) R.color.success_color
                        else R.color.error_color
                    )
                )
            }
        }

        viewModel.config.observe(this) { config ->
            binding.tvConfigStatus.apply {
                val configured = config != null &&
                    config.packageName.isNotBlank() &&
                    config.backendUrl.isNotBlank()
                text = if (configured) getString(R.string.status_config_ok)
                else getString(R.string.status_config_missing)
                setTextColor(
                    getColor(
                        if (configured) R.color.success_color
                        else R.color.error_color
                    )
                )
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnGrantPermission.setOnClickListener {
            viewModel.openNotificationAccessSettings()
        }

        binding.btnConfig.setOnClickListener {
            startActivity(android.content.Intent(this, ConfigActivity::class.java))
        }

        binding.btnHistory.setOnClickListener {
            startActivity(android.content.Intent(this, HistoryActivity::class.java))
        }

        binding.btnTestNotification.setOnClickListener {
            simulateNotification()
        }
    }

    private fun simulateNotification() {
        CoroutineScope(Dispatchers.IO).launch {
            val config = repository.getConfig()
            if (config == null || config.packageName.isBlank()) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "Configura el package del banco primero",
                        Toast.LENGTH_SHORT
                    ).show()
                }
                return@launch
            }

            val rawText = getString(R.string.hint_test_text)
            val simulatedText = getString(R.string.simulated_notification, rawText)

            val result = com.vzla.bdvlistener.util.RegexExtractor.extract(
                rawText, config.regexMonto, config.regexRef
            )

            val log = LogEntity(
                monto = result.monto ?: "",
                referencia = result.referencia ?: "",
                timestamp = System.currentTimeMillis(),
                packageName = config.packageName,
                rawText = simulatedText,
                status = "PENDING"
            )

            val logId = repository.insertLog(log)
            val logWithId = log.copy(id = logId)

            val success = repository.processNotification(
                packageName = config.packageName,
                monto = result.monto ?: "",
                referencia = result.referencia ?: "",
                rawText = simulatedText,
                config = config
            )

            withContext(Dispatchers.Main) {
                val msg = if (success) {
                    val monto = result.monto ?: "sin monto"
                    val ref = result.referencia ?: "sin ref"
                    "Simulación exitosa: $monto, $ref"
                } else {
                    "Fallo al enviar al backend. Revisa la URL."
                }
                Toast.makeText(this@MainActivity, msg, Toast.LENGTH_LONG).show()
            }
        }
    }
}
