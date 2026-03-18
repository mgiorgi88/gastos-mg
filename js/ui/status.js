export function setStatusMessage(statusEl, msg, tone = "info") {
  if (statusEl) statusEl.textContent = msg;
  if (statusEl) {
    statusEl.classList.remove("status-info", "status-success", "status-error");
    statusEl.classList.add(`status-${tone}`);
  }
  try {
    console.log("[GastosMG]", msg);
  } catch {
    // Ignore console issues.
  }
}

export function setButtonLoadingState(button, isLoading, loadingText = "Procesando...") {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent || "";
    button.disabled = true;
    button.classList.add("is-loading");
    button.textContent = loadingText;
    return;
  }
  button.classList.remove("is-loading");
  if (button.dataset.originalText) button.textContent = button.dataset.originalText;
}

export function setFieldVisualState(input, hintEl, state = "idle", message = "") {
  if (!input) return;
  input.classList.remove("input-valid", "input-invalid");
  if (hintEl) {
    hintEl.hidden = !message;
    hintEl.textContent = message;
    hintEl.classList.remove("hint-error", "hint-ok");
  }
  if (state === "valid") {
    input.classList.add("input-valid");
    if (hintEl && message) hintEl.classList.add("hint-ok");
    return;
  }
  if (state === "invalid") {
    input.classList.add("input-invalid");
    if (hintEl && message) hintEl.classList.add("hint-error");
  }
}

export function isValidEmailValue(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function showSyncBadgeState(syncBadgeEl, message, tone = "ok", autoHideMs = 0, currentTimer = null) {
  if (!syncBadgeEl) return currentTimer;
  syncBadgeEl.textContent = message;
  syncBadgeEl.hidden = false;
  syncBadgeEl.classList.remove("local", "syncing", "pending", "ok", "error", "show");
  syncBadgeEl.classList.add(tone, "show");
  if (currentTimer) clearTimeout(currentTimer);
  if (autoHideMs <= 0) return null;
  return setTimeout(() => {
    syncBadgeEl.classList.remove("show", "local", "syncing", "pending", "ok", "error");
    syncBadgeEl.hidden = true;
  }, autoHideMs);
}

export function hideSyncBadgeState(syncBadgeEl, currentTimer = null) {
  if (!syncBadgeEl) return null;
  if (currentTimer) clearTimeout(currentTimer);
  syncBadgeEl.classList.remove("show", "local", "syncing", "pending", "ok", "error");
  syncBadgeEl.hidden = true;
  return null;
}

export function showToastMessage(toastEl, message, currentTimer = null, displayMs = 1500) {
  if (!toastEl) return currentTimer;
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastEl.classList.add("show");
  if (currentTimer) clearTimeout(currentTimer);
  return setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => {
      toastEl.hidden = true;
    }, 190);
  }, displayMs);
}
