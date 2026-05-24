import {
  savePreferences,
  loadPreferences
} from "../../js/storage.js";

export function initializeTheme({
  getUserColor,
  setUserColor,
  getAIColor,
  setAIColor,
  getBgColor,
  setBgColor
}) {
  const prefs = loadPreferences();

  if (prefs) {
    if (prefs.bgColor) {
      setBgColor(prefs.bgColor);
      document.body.style.backgroundColor = prefs.bgColor;
    }

    if (prefs.userColor) {
      setUserColor(prefs.userColor);
    }

    if (prefs.aiColor) {
      setAIColor(prefs.aiColor);
    }
  }

  function togglePanel() {
    const panel = document.getElementById("panel");

    panel.style.display =
      panel.style.display === "none"
        ? "block"
        : "none";
  }

  function applyColors() {
    const userColor =
      document.getElementById("userColor").value;

    const aiColor =
      document.getElementById("aiColor").value;

    const bgColor =
      document.getElementById("bgColor").value;

    setUserColor(userColor);
    setAIColor(aiColor);
    setBgColor(bgColor);

    document.body.style.background = bgColor;

    document
      .querySelectorAll(".msg.user")
      .forEach(el => {
        el.style.background = userColor;
      });

    document
      .querySelectorAll(".msg.ai")
      .forEach(el => {
        el.style.background = aiColor;
      });

    savePreferences({
      userColor,
      aiColor,
      bgColor
    });
  }

  document
    .getElementById("customizeBtn")
    .addEventListener("click", togglePanel);

  document
    .getElementById("applyBtn")
    .addEventListener("click", applyColors);
}