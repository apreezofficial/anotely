use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::{AppHandle, Manager};

static NOTES_PATH: OnceLock<PathBuf> = OnceLock::new();

pub type Folder = String; // "notes" | "archive" | "trash"

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub folder: Folder,
    pub pinned: bool,
    pub starred: bool,
    pub color: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    /// Snippet of the last AI proofread, shown as a subtle badge.
    pub last_proofread_at: Option<i64>,
    pub word_count: i64,
    pub char_count: i64,
}

impl Default for Note {
    fn default() -> Self {
        let now = chrono::Utc::now().timestamp_millis();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title: String::new(),
            content: String::new(),
            tags: Vec::new(),
            folder: "notes".into(),
            pinned: false,
            starred: false,
            color: None,
            created_at: now,
            updated_at: now,
            last_proofread_at: None,
            word_count: 0,
            char_count: 0,
        }
    }
}

impl Note {
    fn recount(&mut self) {
        self.word_count = self.content.split_whitespace().count() as i64;
        self.char_count = self.content.chars().count() as i64;
        if self.title.trim().is_empty() {
            self.title = derive_title(&self.content);
        }
    }
}

fn derive_title(content: &str) -> String {
    let first = content
        .lines()
        .find(|l| !l.trim().is_empty())
        .unwrap_or("")
        .trim();
    let mut title: String = first.chars().take(64).collect();
    if first.chars().count() > 64 {
        title.push('…');
    }
    title
}

#[derive(Default, Serialize, Deserialize)]
struct Database {
    #[serde(default)]
    notes: Vec<Note>,
}

pub struct NotesState {
    db: Mutex<Database>,
    loaded: AtomicBool,
}

impl Default for NotesState {
    fn default() -> Self {
        Self {
            db: Mutex::new(Database::default()),
            loaded: AtomicBool::new(false),
        }
    }
}

fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

fn persist(db: &Database) -> Result<(), String> {
    let Some(path) = NOTES_PATH.get() else {
        return Ok(());
    };
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("json.tmp");
    let json = serde_json::to_string_pretty(db).map_err(|e| e.to_string())?;
    std::fs::write(&tmp, json).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}

impl NotesState {
    fn ensure_loaded(&self) {
        if self.loaded.load(Ordering::Relaxed) {
            return;
        }
        if let Some(path) = NOTES_PATH.get() {
            if let Ok(raw) = std::fs::read_to_string(path) {
                if let Ok(parsed) = serde_json::from_str::<Database>(&raw) {
                    *self.db.lock() = parsed;
                }
            }
        }
        self.loaded.store(true, Ordering::Relaxed);
    }

    fn sorted(db: &Database) -> Vec<Note> {
        let mut notes = db.notes.clone();
        notes.sort_by(|a, b| {
            b.pinned
                .cmp(&a.pinned)
                .then(b.updated_at.cmp(&a.updated_at))
        });
        notes
    }

    pub fn list(&self) -> Vec<Note> {
        self.ensure_loaded();
        Self::sorted(&self.db.lock())
    }

    pub fn get(&self, id: &str) -> Option<Note> {
        self.ensure_loaded();
        self.db.lock().notes.iter().find(|n| n.id == id).cloned()
    }

    pub fn upsert(&self, mut note: Note) -> Result<Note, String> {
        self.ensure_loaded();
        if note.id.trim().is_empty() {
            note.id = uuid::Uuid::new_v4().to_string();
        }
        let mut db = self.db.lock();
        let ts = now_ms();
        match db.notes.iter_mut().find(|n| n.id == note.id) {
            Some(existing) => {
                note.created_at = existing.created_at;
                note.recount();
                note.updated_at = ts;
                *existing = note.clone();
            }
            None => {
                note.recount();
                note.created_at = ts;
                note.updated_at = ts;
                db.notes.push(note.clone());
            }
        }
        persist(&db)?;
        Ok(note)
    }

    pub fn trash(&self, id: &str) -> Result<Vec<Note>, String> {
        self.ensure_loaded();
        let mut db = self.db.lock();
        if let Some(note) = db.notes.iter_mut().find(|n| n.id == id) {
            note.folder = "trash".into();
            note.updated_at = now_ms();
        }
        persist(&db)?;
        Ok(Self::sorted(&db))
    }

    pub fn restore(&self, id: &str) -> Result<Vec<Note>, String> {
        self.ensure_loaded();
        let mut db = self.db.lock();
        if let Some(note) = db.notes.iter_mut().find(|n| n.id == id) {
            note.folder = "notes".into();
            note.updated_at = now_ms();
        }
        persist(&db)?;
        Ok(Self::sorted(&db))
    }

    pub fn purge(&self, id: &str) -> Result<Vec<Note>, String> {
        self.ensure_loaded();
        let mut db = self.db.lock();
        db.notes.retain(|n| n.id != id);
        persist(&db)?;
        Ok(Self::sorted(&db))
    }

    pub fn empty_trash(&self) -> Result<Vec<Note>, String> {
        self.ensure_loaded();
        let mut db = self.db.lock();
        db.notes.retain(|n| n.folder != "trash");
        persist(&db)?;
        Ok(Self::sorted(&db))
    }
}

pub fn init(app: &AppHandle) -> Result<(), String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("no app data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let _ = NOTES_PATH.set(dir.join("notes.json"));
    Ok(())
}
