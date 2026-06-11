package com.vzla.bdvlistener.util

data class ExtractionResult(
    val monto: String?,
    val referencia: String?
)

object RegexExtractor {

    fun extract(text: String, regexMonto: String, regexRef: String): ExtractionResult {
        val sanitizedText = text.replace("\\n", " ").replace("\\r", " ").trim()

        val monto = try {
            val montoRegex = Regex(regexMonto, RegexOption.IGNORE_CASE)
            montoRegex.find(sanitizedText)?.let { match ->
                match.groups["monto"]?.value
                    ?: match.groupValues.getOrNull(1)
                    ?: match.value
            }
        } catch (e: Exception) {
            null
        }

        val ref = try {
            val refRegex = Regex(regexRef, RegexOption.IGNORE_CASE)
            refRegex.find(sanitizedText)?.let { match ->
                match.groups["ref"]?.value
                    ?: match.groupValues.getOrNull(1)
                    ?: match.value
            }
        } catch (e: Exception) {
            null
        }

        return ExtractionResult(
            monto = monto?.trim(),
            referencia = ref?.trim()
        )
    }

    fun extractFromMultipleTexts(
        texts: List<String>,
        regexMonto: String,
        regexRef: String
    ): ExtractionResult {
        for (text in texts) {
            if (text.isBlank()) continue
            val result = extract(text, regexMonto, regexRef)
            if (result.monto != null || result.referencia != null) {
                return result
            }
        }
        return ExtractionResult(null, null)
    }
}
