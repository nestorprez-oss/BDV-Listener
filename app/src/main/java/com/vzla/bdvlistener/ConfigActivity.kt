package com.vzla.bdvlistener

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.vzla.bdvlistener.databinding.ActivityConfigBinding
import com.vzla.bdvlistener.viewmodel.ConfigViewModel
import kotlinx.coroutines.launch

class ConfigActivity : AppCompatActivity() {

    private lateinit var binding: ActivityConfigBinding
    private lateinit var viewModel: ConfigViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityConfigBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[ConfigViewModel::class.java]

        loadExistingConfig()
        setupClickListeners()
    }

    private fun loadExistingConfig() {
        lifecycleScope.launch {
            val config = viewModel.loadConfig()
            if (config != null) {
                binding.etPackageName.setText(config.packageName)
                binding.etBackendUrl.setText(config.backendUrl)
                binding.etAuthToken.setText(config.authToken)
                if (config.regexMonto.isNotBlank()) {
                    binding.etRegexMonto.setText(config.regexMonto)
                }
                if (config.regexRef.isNotBlank()) {
                    binding.etRegexRef.setText(config.regexRef)
                }
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnSave.setOnClickListener {
            saveConfig()
        }

        binding.btnTestRegex.setOnClickListener {
            testRegex()
        }
    }

    private fun saveConfig() {
        val packageName = binding.etPackageName.text?.toString()?.trim() ?: ""
        val backendUrl = binding.etBackendUrl.text?.toString()?.trim() ?: ""
        val authToken = binding.etAuthToken.text?.toString()?.trim() ?: ""
        val regexMonto = binding.etRegexMonto.text?.toString()?.trim() ?: ""
        val regexRef = binding.etRegexRef.text?.toString()?.trim() ?: ""

        if (packageName.isBlank()) {
            Toast.makeText(this, R.string.error_empty_package, Toast.LENGTH_SHORT).show()
            return
        }

        if (backendUrl.isBlank()) {
            Toast.makeText(this, R.string.error_empty_url, Toast.LENGTH_SHORT).show()
            return
        }

        viewModel.saveConfig(packageName, backendUrl, authToken, regexMonto, regexRef)

        Toast.makeText(this, "Configuración guardada", Toast.LENGTH_SHORT).show()
        finish()
    }

    private fun testRegex() {
        val testText = binding.etTestText.text?.toString()?.trim() ?: ""
        val regexMonto = binding.etRegexMonto.text?.toString()?.trim() ?: ""
        val regexRef = binding.etRegexRef.text?.toString()?.trim() ?: ""

        if (testText.isBlank() || regexMonto.isBlank() || regexRef.isBlank()) {
            Toast.makeText(
                this,
                "Ingresa texto de prueba y ambos regex",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        val result = viewModel.testRegex(testText, regexMonto, regexRef)

        binding.tvTestResult.visibility = View.VISIBLE
        val resultText = buildString {
            appendLine(getString(R.string.test_result_monto, result.monto ?: "---"))
            appendLine(getString(R.string.test_result_ref, result.referencia ?: "---"))
            if (result.monto == null && result.referencia == null) {
                appendLine()
                append(getString(R.string.test_result_none))
            }
        }
        binding.tvTestResult.text = resultText
    }
}
