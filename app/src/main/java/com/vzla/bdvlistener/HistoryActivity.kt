package com.vzla.bdvlistener

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.vzla.bdvlistener.data.db.LogEntity
import com.vzla.bdvlistener.databinding.ActivityHistoryBinding
import com.vzla.bdvlistener.databinding.ItemLogEntryBinding
import com.vzla.bdvlistener.viewmodel.HistoryViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class HistoryActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHistoryBinding
    private lateinit var viewModel: HistoryViewModel
    private val adapter = LogAdapter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[HistoryViewModel::class.java]

        binding.rvHistory.apply {
            layoutManager = LinearLayoutManager(this@HistoryActivity)
            adapter = this@HistoryActivity.adapter
        }

        viewModel.logs.observe(this) { logs ->
            adapter.submitList(logs)
            binding.tvEmpty.visibility = if (logs.isEmpty()) View.VISIBLE else View.GONE
            binding.rvHistory.visibility = if (logs.isEmpty()) View.GONE else View.VISIBLE
        }
    }
}

class LogAdapter : RecyclerView.Adapter<LogAdapter.ViewHolder>() {

    private var logs: List<LogEntity> = emptyList()
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

    fun submitList(list: List<LogEntity>) {
        logs = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemLogEntryBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(logs[position])
    }

    override fun getItemCount(): Int = logs.size

    inner class ViewHolder(private val binding: ItemLogEntryBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(log: LogEntity) {
            binding.tvMonto.text = if (log.monto.isNotBlank()) log.monto else "Sin monto"
            binding.tvRef.text = if (log.referencia.isNotBlank()) log.referencia else "Sin referencia"
            binding.tvTimestamp.text = dateFormat.format(Date(log.timestamp))
            binding.tvRaw.text = if (log.rawText.isNotBlank()) log.rawText else "Sin texto crudo"

            binding.tvStatus.apply {
                when (log.status) {
                    "SENT" -> {
                        text = binding.root.context.getString(R.string.label_sent)
                        setTextColor(binding.root.context.getColor(R.color.success_color))
                    }
                    "FAILED" -> {
                        text = binding.root.context.getString(R.string.label_failed)
                        setTextColor(binding.root.context.getColor(R.color.error_color))
                    }
                    "PENDING" -> {
                        text = binding.root.context.getString(R.string.label_pending)
                        setTextColor(binding.root.context.getColor(R.color.warning_color))
                    }
                    else -> {
                        text = log.status
                        setTextColor(binding.root.context.getColor(R.color.on_surface))
                    }
                }
            }
        }
    }
}
