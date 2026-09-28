use base64::Engine;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscribeRequest {
    /// "openai" | "groq" | "custom"
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub base_url: String,
    pub language: String,
    pub mime: String,
    pub audio_base64: String,
    /// Client-side hint so the UI can show "listening…" durations.
    #[serde(default)]
    pub hint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscribeResult {
    pub text: String,
    pub provider: String,
    pub model: String,
}

fn extension_for(mime: &str) -> &'static str {
    if mime.contains("wav") {
        "wav"
    } else if mime.contains("ogg") {
        "ogg"
    } else if mime.contains("mp4") || mime.contains("m4a") {
        "m4a"
    } else if mime.contains("aac") {
        "aac"
    } else {
        "webm"
    }
}

fn trim_base(base: &str, fallback: &str) -> String {
    let b = base.trim().trim_end_matches('/');
    if b.is_empty() {
        fallback.to_string()
    } else {
        b.to_string()
    }
}

/// Transcribes a recorded clip with any OpenAI-compatible Whisper endpoint.
pub async fn transcribe(req: TranscribeRequest) -> Result<TranscribeResult, String> {
    let provider = req.provider.to_lowercase();
    if req.audio_base64.trim().is_empty() {
        return Err("No audio captured. Check microphone permissions.".into());
    }

    let url = match provider.as_str() {
        "openai" => "https://api.openai.com/v1/audio/transcriptions".to_string(),
        "groq" => "https://api.groq.com/openai/v1/audio/transcriptions".to_string(),
        _ => {
            let base = trim_base(
                &req.base_url,
                "http://localhost:8000/v1",
            );
            format!("{base}/audio/transcriptions")
        }
    };

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(req.audio_base64.as_bytes())
        .map_err(|e| format!("Could not decode audio: {e}"))?;

    let part = reqwest::multipart::Part::bytes(bytes)
        .file_name(format!("clip.{}", extension_for(&req.mime)))
        .mime_str(&req.mime)
        .map_err(|e| e.to_string())?;

    let mut form = reqwest::multipart::Form::new()
        .part("file", part)
        .text("model", req.model.clone())
        .text("response_format", "json");
    if !req.language.trim().is_empty() && req.language != "auto" {
        form = form.text("language", req.language.trim().to_string());
    }
    if let Some(prompt) = req.hint.split_whitespace().next() {
        if !prompt.is_empty() {
            form = form.text("prompt", format!("{prompt} "));
        }
    }

    let mut builder = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(180))
        .build()
        .map_err(|e| e.to_string())?
        .post(&url)
        .multipart(form);
    if provider != "custom" && !req.api_key.trim().is_empty() {
        builder = builder.bearer_auth(&req.api_key);
    }

    let res = builder.send().await.map_err(|e| e.to_string())?;
    let status = res.status();
    let body = res.text().await.unwrap_or_default();
    if !status.is_success() {
        let snippet: String = body.chars().take(400).collect();
        return Err(format!(
            "Transcription failed ({}): {snippet}",
            status.as_u16()
        ));
    }

    let text = parse_transcription(&body);
    if text.trim().is_empty() {
        return Err("No speech was detected in that clip.".into());
    }

    Ok(TranscribeResult {
        text: text.trim().to_string(),
        provider,
        model: req.model,
    })
}

fn parse_transcription(body: &str) -> String {
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(body) {
        if let Some(t) = v.get("text").and_then(|t| t.as_str()) {
            return t.to_string();
        }
        if let Some(segments) = v.get("segments").and_then(|s| s.as_array()) {
            let joined: Vec<String> = segments
                .iter()
                .filter_map(|s| s.get("text").and_then(|t| t.as_str()))
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
            if !joined.is_empty() {
                return joined.join(" ");
            }
        }
        if let Some(t) = v.get("transcription").and_then(|t| t.as_str()) {
            return t.to_string();
        }
    }
    // Plain-text endpoints (whisper.cpp server) return bare text.
    body.trim().to_string()
}
