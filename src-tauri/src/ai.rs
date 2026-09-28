use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiRequest {
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub base_url: String,
    pub system: String,
    pub prompt: String,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    pub json_mode: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AskMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AskRequest {
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub base_url: String,
    pub system: String,
    pub note: String,
    pub question: String,
    #[serde(default)]
    pub history: Vec<AskMessage>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofreadRequest {
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub base_url: String,
    pub text: String,
    pub tone: String,
    pub fix_grammar: bool,
    pub fix_punctuation: bool,
    pub remove_filler: bool,
    pub suggest_style: bool,
    pub language: String,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Change {
    pub original: String,
    pub replacement: String,
    pub kind: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofreadResult {
    pub corrected: String,
    pub summary: String,
    pub score: u8,
    pub changes: Vec<Change>,
}

fn client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .user_agent("Anotely/0.1")
        .build()
        .unwrap_or_default()
}

fn trim_base(base: &str, fallback: &str) -> String {
    let b = base.trim().trim_end_matches('/');
    if b.is_empty() {
        fallback.to_string()
    } else {
        b.to_string()
    }
}

fn err_from(status: reqwest::StatusCode, body: &str) -> String {
    let snippet: String = body.chars().take(600).collect();
    match status.as_u16() {
        401 => format!("Authentication failed. Check your API key. ({snippet})"),
        403 => format!("Access denied for this model or key. ({snippet})"),
        404 => format!("Model or endpoint not found. ({snippet})"),
        429 => format!("Rate limit reached — slow down or switch model. ({snippet})"),
        _ => format!("AI request failed ({}): {snippet}", status.as_u16()),
    }
}

/// Single-shot chat completion across every supported provider.
pub async fn complete(req: AiRequest) -> Result<String, String> {
    let http = client();
    let temperature = req.temperature.unwrap_or(0.3);
    let max_tokens = req.max_tokens.unwrap_or(4096);
    let provider = req.provider.to_lowercase();

    let (url, body) = match provider.as_str() {
        "anthropic" | "claude" => {
            let payload = serde_json::json!({
                "model": req.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "system": req.system,
                "messages": [{ "role": "user", "content": req.prompt }],
            });
            (
                "https://api.anthropic.com/v1/messages".to_string(),
                serde_json::to_value(payload).map_err(|e| e.to_string())?,
            )
        }
        "gemini" | "google" => {
            let payload = serde_json::json!({
                "systemInstruction": { "parts": [{ "text": req.system }] },
                "contents": [{ "role": "user", "parts": [{ "text": req.prompt }] }],
                "generationConfig": { "temperature": temperature, "maxOutputTokens": max_tokens },
            });
            let key = urlencoding(&req.api_key);
            (
                format!("https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}", req.model, key),
                serde_json::to_value(payload).map_err(|e| e.to_string())?,
            )
        }
        "ollama" => {
            let base = trim_base(&req.base_url, "http://localhost:11434");
            let payload = serde_json::json!({
                "model": req.model,
                "stream": false,
                "messages": [
                    { "role": "system", "content": req.system },
                    { "role": "user", "content": req.prompt },
                ],
                "options": { "temperature": temperature, "num_predict": max_tokens },
            });
            (format!("{base}/api/chat"), serde_json::to_value(payload).map_err(|e| e.to_string())?)
        }
        "groq" => openai_like(
            &req,
            "https://api.groq.com/openai/v1/chat/completions",
            temperature,
            max_tokens,
        )?,
        "openrouter" => openai_like(
            &req,
            "https://openrouter.ai/api/v1/chat/completions",
            temperature,
            max_tokens,
        )?,
        "openai" | "custom" | _ => {
            let base = trim_base(&req.base_url, "https://api.openai.com/v1");
            let url = if provider == "openai" && req.base_url.trim().is_empty() {
                "https://api.openai.com/v1/chat/completions".to_string()
            } else {
                format!("{base}/chat/completions")
            };
            openai_like(&req, &url, temperature, max_tokens)?
        }
    };

    let mut builder = http.post(&url).json(&body);
    match provider.as_str() {
        "anthropic" | "claude" => {
            builder = builder
                .header("x-api-key", &req.api_key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json");
        }
        "ollama" => {
            builder = builder.header("content-type", "application/json");
        }
        _ => {
            builder = builder
                .header("Authorization", format!("Bearer {}", req.api_key))
                .header("content-type", "application/json");
        }
    }

    let res = builder.send().await.map_err(|e| e.to_string())?;
    let status = res.status();
    let text = res.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(err_from(status, &text));
    }
    extract_text(&provider, &text)
}

fn openai_like(
    req: &AiRequest,
    url: &str,
    temperature: f32,
    max_tokens: u32,
) -> Result<(String, serde_json::Value), String> {
    let mut payload = serde_json::json!({
        "model": req.model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": [
            { "role": "system", "content": req.system },
            { "role": "user", "content": req.prompt },
        ],
    });
    if req.json_mode.unwrap_or(false) {
        payload["response_format"] = serde_json::json!({ "type": "json_object" });
    }
    Ok((
        url.to_string(),
        serde_json::to_value(payload).map_err(|e| e.to_string())?,
    ))
}

fn urlencoding(input: &str) -> String {
    input
        .chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            ' ' => "%20".into(),
            other => other
                .to_string()
                .bytes()
                .map(|b| format!("%{b:02X}"))
                .collect::<String>(),
        })
        .collect()
}

fn extract_text(provider: &str, raw: &str) -> Result<String, String> {
    let v: serde_json::Value =
        serde_json::from_str(raw).map_err(|e| format!("Bad AI response: {e}"))?;
    let text = match provider {
        "anthropic" | "claude" => v["content"][0]["text"].as_str().map(|s| s.to_string()),
        "gemini" | "google" => v["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .map(|s| s.to_string()),
        "ollama" => v["message"]["content"].as_str().map(|s| s.to_string()),
        _ => v["choices"][0]["message"]["content"]
            .as_str()
            .map(|s| s.to_string()),
    };
    text.ok_or_else(|| format!("Could not read AI response: {}", &raw.chars().take(400).collect::<String>()))
}

pub async fn ask(req: AskRequest) -> Result<String, String> {
    let mut messages: Vec<AskMessage> = vec![AskMessage {
        role: "user".into(),
        content: format!("Current note:\n\n{}\n", req.note),
    }];
    messages.extend(req.history.clone());
    messages.push(AskMessage {
        role: "user".into(),
        content: req.question.clone(),
    });

    let system = if req.system.trim().is_empty() {
        "You are Anotely's assistant. Answer about the user's note precisely and concisely. Use markdown.".to_string()
    } else {
        req.system
    };

    let history_json = serde_json::to_string(&messages).map_err(|e| e.to_string())?;
    let prompt = format!(
        "Conversation so far (JSON array of {{role, content}}):\n{history_json}\n\nAnswer the final user message."
    );

    complete(AiRequest {
        provider: req.provider,
        api_key: req.api_key,
        model: req.model,
        base_url: req.base_url,
        system,
        prompt,
        temperature: req.temperature,
        max_tokens: req.max_tokens,
        json_mode: Some(false),
    })
    .await
}

pub async fn proofread(req: ProofreadRequest) -> Result<ProofreadResult, String> {
    if req.text.trim().is_empty() {
        return Ok(ProofreadResult {
            corrected: req.text,
            summary: "Nothing to proofread.".into(),
            score: 100,
            changes: vec![],
        });
    }

    let mut rules: Vec<&str> = Vec::new();
    if req.fix_grammar {
        rules.push("Fix grammar, spelling, and word choice");
    }
    if req.fix_punctuation {
        rules.push("Fix punctuation, capitalisation and spacing");
    }
    if req.remove_filler {
        rules.push("Remove filler words and verbal tics (um, uh, like, you know) while keeping meaning");
    }
    if req.suggest_style {
        rules.push("Tighten sentence structure for clarity and flow");
    }
    if rules.is_empty() {
        rules.push("Polish the writing without changing meaning");
    }

    let system = "You are Anotely's proofreading engine. You return ONLY valid JSON, no prose, no markdown fences.";
    let prompt = format!(
        "Proofread the text in <note> tags. Language: {lang}. Tone target: {tone}.\n\nRules:\n- {rules}\n\nReturn JSON with this exact shape:\n{{\n  \"corrected\": \"the full corrected text\",\n  \"summary\": \"one sentence describing what you changed\",\n  \"score\": 0-100,\n  \"changes\": [{{\"original\":\"wrong fragment\",\"replacement\":\"fixed fragment\",\"kind\":\"grammar|punctuation|clarity|spelling|style\",\"reason\":\"why\"}}]\n}}\n\nRules for the JSON: keep it valid, escape newlines as \\n inside strings, limit `changes` to the 12 most important edits.\n\n<note>\n{text}\n</note>",
        lang = if req.language.trim().is_empty() { "auto-detect" } else { &req.language },
        tone = req.tone,
        rules = rules.join("\n- "),
        text = req.text,
    );

    let raw = complete(AiRequest {
        provider: req.provider.clone(),
        api_key: req.api_key,
        model: req.model,
        base_url: req.base_url,
        system: system.into(),
        prompt,
        temperature: req.temperature.or(Some(0.2)),
        max_tokens: req.max_tokens.or(Some(8192)),
        json_mode: Some(true),
    })
    .await?;

    let parsed = parse_json_loose(&raw);
    let corrected = parsed
        .get("corrected")
        .and_then(|v| v.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| raw.trim().to_string());

    let summary = parsed
        .get("summary")
        .and_then(|v| v.as_str())
        .unwrap_or("Polished your text.")
        .to_string();

    let score = parsed
        .get("score")
        .and_then(|v| v.as_u64())
        .unwrap_or(90)
        .min(100) as u8;

    let mut changes: Vec<Change> = parsed
        .get("changes")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|c| {
                    let original = c.get("original")?.as_str()?.trim().to_string();
                    let replacement = c.get("replacement")?.as_str()?.trim().to_string();
                    if original.is_empty() && replacement.is_empty() {
                        return None;
                    }
                    Some(Change {
                        original,
                        replacement,
                        kind: c
                            .get("kind")
                            .and_then(|k| k.as_str())
                            .unwrap_or("grammar")
                            .to_string(),
                        reason: c
                            .get("reason")
                            .and_then(|r| r.as_str())
                            .unwrap_or("Improves clarity")
                            .to_string(),
                    })
                })
                .collect()
        })
        .unwrap_or_default();

    // Models sometimes return prose; guarantee the UI always has real edits to show.
    if changes.is_empty() && corrected != req.text {
        changes = diff_changes(&req.text, &corrected);
    }

    Ok(ProofreadResult {
        corrected,
        summary,
        score,
        changes,
    })
}

/// Tolerant JSON parse: strips code fences and grabs the outermost object.
fn parse_json_loose(raw: &str) -> serde_json::Value {
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(raw.trim()) {
        return v;
    }
    let cleaned: String = raw
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .to_string();
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(cleaned.trim()) {
        return v;
    }
    let start = cleaned.find('{');
    let end = cleaned.rfind('}');
    if let (Some(s), Some(e)) = (start, end) {
        if e > s {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&cleaned[s..=e]) {
                return v;
            }
        }
    }
    serde_json::Value::Object(serde_json::Map::new())
}

/// Word-level LCS diff so the "what changed" list is never empty.
fn diff_changes(before: &str, after: &str) -> Vec<Change> {
    let a: Vec<&str> = before.split_whitespace().collect();
    let b: Vec<&str> = after.split_whitespace().collect();
    if a.len() * b.len() > 4_000_000 {
        return vec![];
    }

    let mut lcs = vec![vec![0usize; b.len() + 1]; a.len() + 1];
    for i in (0..a.len()).rev() {
        for j in (0..b.len()).rev() {
            lcs[i][j] = if a[i] == b[j] {
                lcs[i + 1][j + 1] + 1
            } else {
                lcs[i + 1][j].max(lcs[i][j + 1])
            };
        }
    }

    let mut changes: Vec<Change> = Vec::new();
    let (mut i, mut j) = (0usize, 0usize);
    while i < a.len() && j < b.len() {
        if a[i] == b[j] {
            i += 1;
            j += 1;
        } else if lcs[i + 1][j] >= lcs[i][j + 1] {
            push_change(&mut changes, a[i], "", "removed");
            i += 1;
        } else {
            push_change(&mut changes, "", b[j], "added");
            j += 1;
        }
    }
    while i < a.len() {
        push_change(&mut changes, a[i], "", "removed");
        i += 1;
    }
    while j < b.len() {
        push_change(&mut changes, "", b[j], "added");
        j += 1;
    }

    // Merge adjacent single-word edits into readable phrases.
    let merged = merge_adjacent(changes);
    merged.into_iter().take(12).collect()
}

fn push_change(changes: &mut Vec<Change>, original: &str, replacement: &str, kind: &str) {
    changes.push(Change {
        original: original.to_string(),
        replacement: replacement.to_string(),
        kind: kind.to_string(),
        reason: "Spoken text normalised".into(),
    });
}

fn merge_adjacent(changes: Vec<Change>) -> Vec<Change> {
    let mut out: Vec<Change> = Vec::new();
    for c in changes {
        if let Some(last) = out.last_mut() {
            if last.kind == c.kind {
                if !last.replacement.is_empty() && !c.replacement.is_empty() {
                    last.replacement = format!("{} {}", last.replacement, c.replacement);
                    continue;
                }
                if last.original.is_empty() && c.original.is_empty() {
                    last.replacement = format!("{} {}", last.replacement, c.replacement);
                    continue;
                }
                if !last.original.is_empty() && !c.original.is_empty() {
                    last.original = format!("{} {}", last.original, c.original);
                    continue;
                }
            }
        }
        out.push(c);
    }
    out
}
