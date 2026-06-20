import customConsole from "../../js/console.js";
import {
  enableDevMode,
  disableDevMode
} from "../../js/logSystem.js";
import { logEvent }
from "../../Logging/Event_Logging/event_logger.js";
const devBtn = document.getElementById("devToggle");
let devState = false;

/**
 * Update develop mode state across all systems
 * Synchronizes: Main Process + Renderer Process + Console Singleton
 */
async function updateDevelopMode(enabled) {
    const consoleDiv = document.getElementById("bottom-console");
    
    try {
        if (enabled) {
            // Enable develop mode in main process
            await enableDevMode();
            
            // Sync console singleton
            customConsole.setDevelopMode(true);
            // Update UI
            devBtn.classList.remove("dev-off");
            devBtn.classList.add("dev-on");
            if (consoleDiv) {
                consoleDiv.classList.remove("hidden");
            }
            devState = true;
            // Log the mode change (will be captured now)
            logEvent({ type: 'DEV_MODE', data: { status: 'enabled', timestamp: new Date().toISOString() } });
            console.log("[DevMode] ✓ Develop mode ENABLED - All logging active");
        } else {
            // Disable develop mode in main process
            await disableDevMode();
            
            // Sync console singleton
            customConsole.setDevelopMode(false);
            // Update UI
            devBtn.classList.remove("dev-on");
            devBtn.classList.add("dev-off");
if (consoleDiv) {
    consoleDiv.classList.add("hidden");

    const logsContent =
        document.getElementById("logs-content");

    if (logsContent) {
        logsContent.innerHTML = "";
    }
}
            devState = false;
            console.log("[DevMode] ✓ Develop mode DISABLED - Logging paused");
        }
    } catch (err) {
        console.log("[DevMode] Error updating develop mode:", err);
    }
}

devBtn.addEventListener("click", () => {
    updateDevelopMode(!devState);
});

/**
 * Initialize develop mode state on app load
 * Syncs renderer with main process state
 */
export async function initializeDevelopMode() {
    try {
        const mainProcessState = await window.ipc?.getDevelopMode?.();
        customConsole.setDevelopMode(mainProcessState || false);
        console.log(`[Init] Develop mode initialized from main process: ${mainProcessState}`);
    } catch (err) {
        console.error("[Init] Failed to initialize develop mode:", err);
        customConsole.setDevelopMode(false);
    }
}

// Initialize on load
initializeDevelopMode();