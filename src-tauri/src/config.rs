use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::{AppHandle, Manager};

static SETTINGS_PATH: OnceLock<PathBuf> = OnceLock::new();

/// Everything the user can tune. Serialized to `settings.json` in the app data dir.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Settings {
    pub onboarded: bool,

    // --- AI provider ---
    pub provider: String,
    pub api_key: String,
    pub model: String,
    pub base_url: String,
    pub temperature: f32,
    pub max_tokens: u32,

    // --- Proofreading behaviour ---
    pub auto_proofread: bool,
    pub done_phrase: String,
    pub proof_tone: String,
    pub fix_grammar: bool,
    pub fix_punctuation: bool,
    pub remove_filler: bool,
    pub suggest_style: bool,
    pub proofread_lang: String,

    // --- Speech to text ---
    pub stt_provider: String,
    pub stt_api_key: String,
    pub stt_model: String,
    pub stt_base_url: String,
    pub stt_language: String,
    pub stt_punctuation: bool,
    pub stt_silence_ms: u32,

    // --- Appearance ---
    pub theme: String,
    pub accent: String,
    pub font_size: u32,
    pub compact_list: bool,
    pub reduce_motion: bool,
    pub sidebar_width: u32,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            onboarded: false,
            provider: "anthropic".into(),
            api_key: String::new(),
            model: "claude-sonnet-4-5".into(),
            base_url: String::new(),
            temperature: 0.3,
            max_tokens: 4096,
            auto_proofread: true,
            done_phrase: "anotely done".into(),
            proof_tone: "clear".into(),
            fix_grammar: true,
            fix_punctuation: true,
            remove_filler: true,
            suggest_style: false,
            proofread_lang: "en".into(),
            stt_provider: "web".into(),
            stt_api_key: String::new(),
            stt_model: "whisper-large-v3-turbo".into(),
            stt_base_url: String::new(),
            stt_language: "en".into(),
            stt_punctuation: true,
            stt_silence_ms: 900,
            theme: "dark".into(),
            accent: "violet".into(),
            font_size: 16,
            compact_list: false,
            reduce_motion: false,
            sidebar_width: 288,
        }
    }
}

pub struct ConfigState {
    settings: Mutex<Settings>,
    loaded: AtomicBool,
}

impl Default for ConfigState {
    fn default() -> Self {
        Self {
            settings: Mutex::new(Settings::default()),
            loaded: AtomicBool::new(false),
        }
    }
}

impl ConfigState {
    fn ensure_loaded(&self) {
        if self.loaded.load(Ordering::Relaxed) {
            return;
        }
        if let Some(path) = SETTINGS_PATH.get() {
            if let Ok(raw) = std::fs::read_to_string(path) {
                if let Ok(parsed) = serde_json::from_str::<Settings>(&raw) {
                    *self.settings.lock() = parsed;
                }
            }
        }
        self.loaded.store(true, Ordering::Relaxed);
    }

    pub fn get(&self) -> Settings {
        self.ensure_loaded();
        self.settings.lock().clone()
    }

    pub fn set(&self, incoming: Settings) -> Result<Settings, String> {
        let Some(path) = SETTINGS_PATH.get() else {
            return Err("settings path not initialised".into());
        };
        let merged = merge(incoming, self.get());
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(&merged).map_err(|e| e.to_string())?;
        std::fs::write(path, json).map_err(|e| e.to_string())?;
        *self.settings.lock() = merged.clone();
        Ok(merged)
    }
}

/// Empty strings from the UI must not wipe stored secrets.
fn merge(mut incoming: Settings, current: Settings) -> Settings {
    if incoming.api_key.trim().is_empty() {
        incoming.api_key = current.api_key;
    }
    if incoming.stt_api_key.trim().is_empty() {
        incoming.stt_api_key = current.stt_api_key;
    }
    if incoming.base_url.trim().is_empty() {
        incoming.base_url = current.base_url;
    }
    if incoming.stt_base_url.trim().is_empty() {
        incoming.stt_base_url = current.stt_base_url;
    }
    if incoming.stt_model.trim().is_empty() {
        incoming.stt_model = current.stt_model;
    }
    incoming
}

pub fn init(app: &AppHandle) -> Result<(), String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("no app data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let _ = SETTINGS_PATH.set(dir.join("settings.json"));
    Ok(())
}
