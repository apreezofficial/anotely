pub mod ai;
pub mod config;
pub mod stt;
pub mod store;

use config::Settings;
use store::NotesState as Notes;
use tauri::Manager;

#[tauri::command]
fn ping() -> &'static str {
    "pong"
}

#[tauri::command]
async fn load_settings(state: tauri::State<'_, config::ConfigState>) -> Result<Settings, String> {
    Ok(state.get())
}

#[tauri::command]
async fn save_settings(
    state: tauri::State<'_, config::ConfigState>,
    settings: Settings,
) -> Result<Settings, String> {
    state.set(settings)
}

#[tauri::command]
fn data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn list_notes(state: tauri::State<'_, Notes>) -> Result<Vec<store::Note>, String> {
    Ok(state.list())
}

#[tauri::command]
async fn get_note(state: tauri::State<'_, Notes>, id: String) -> Result<Option<store::Note>, String> {
    Ok(state.get(&id))
}

#[tauri::command]
async fn upsert_note(state: tauri::State<'_, Notes>, note: store::Note) -> Result<store::Note, String> {
    state.upsert(note)
}

#[tauri::command]
async fn delete_note(state: tauri::State<'_, Notes>, id: String) -> Result<Vec<store::Note>, String> {
    state.trash(&id)
}

#[tauri::command]
async fn restore_note(state: tauri::State<'_, Notes>, id: String) -> Result<Vec<store::Note>, String> {
    state.restore(&id)
}

#[tauri::command]
async fn purge_note(state: tauri::State<'_, Notes>, id: String) -> Result<Vec<store::Note>, String> {
    state.purge(&id)
}

#[tauri::command]
async fn empty_trash(state: tauri::State<'_, Notes>) -> Result<Vec<store::Note>, String> {
    state.empty_trash()
}

#[tauri::command]
async fn ai_complete(req: ai::AiRequest) -> Result<String, String> {
    ai::complete(req).await
}

#[tauri::command]
async fn ai_proofread(req: ai::ProofreadRequest) -> Result<ai::ProofreadResult, String> {
    ai::proofread(req).await
}

#[tauri::command]
async fn ai_ask(req: ai::AskRequest) -> Result<String, String> {
    ai::ask(req).await
}

#[tauri::command]
async fn stt_transcribe(req: stt::TranscribeRequest) -> Result<stt::TranscribeResult, String> {
    stt::transcribe(req).await
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let handle = app.handle().clone();
            config::init(&handle)?;
            store::init(&handle)?;
            Ok(())
        })
        .manage(config::ConfigState::default())
        .manage(store::NotesState::default())
        .invoke_handler(tauri::generate_handler![
            ping,
            data_dir,
            load_settings,
            save_settings,
            list_notes,
            get_note,
            upsert_note,
            delete_note,
            restore_note,
            purge_note,
            empty_trash,
            ai_complete,
            ai_proofread,
            ai_ask,
            stt_transcribe,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Anotely");
}
