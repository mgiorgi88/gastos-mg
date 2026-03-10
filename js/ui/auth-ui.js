import {
  isValidEmailValue,
  setButtonLoadingState,
  setFieldVisualState
} from "./status.js";

export function createAuthUi({
  authCardEl,
  accountMiniEl,
  accountMiniEmailEl,
  cloudIndicatorEl,
  btnSignup,
  btnLogin,
  btnRecover,
  btnLogout,
  btnLogoutMini,
  btnGateSignin,
  btnGateSignup,
  emailEl,
  emailHintEl,
  passwordEl,
  passwordHintEl,
  entryGateEl,
  getCurrentUser,
  getCurrentTab,
  getAuthActionInFlight,
  setAuthActionInFlight,
  resetSyncError,
  refreshSyncIndicator,
  setStatus
}) {
  function setFieldState(input, hintEl, state = "idle", message = "") {
    setFieldVisualState(input, hintEl, state, message);
  }

  function validateEmailField({ required = false } = {}) {
    const value = emailEl?.value?.trim() || "";
    if (!value) {
      setFieldState(emailEl, emailHintEl, required ? "invalid" : "idle", required ? "Introduce un email valido." : "");
      return !required;
    }
    if (!isValidEmailValue(value)) {
      setFieldState(emailEl, emailHintEl, "invalid", "Revisa el formato del email.");
      return false;
    }
    setFieldState(emailEl, emailHintEl, "valid", "Email correcto.");
    return true;
  }

  function validatePasswordField({ required = false, minLength = 0 } = {}) {
    const value = passwordEl?.value || "";
    if (!value) {
      setFieldState(passwordEl, passwordHintEl, required ? "invalid" : "idle", required ? "Introduce tu contrase\u00f1a." : "");
      return !required;
    }
    if (minLength > 0 && value.length < minLength) {
      setFieldState(passwordEl, passwordHintEl, "invalid", `Usa al menos ${minLength} caracteres.`);
      return false;
    }
    setFieldState(passwordEl, passwordHintEl, "valid", minLength > 0 ? "Longitud correcta." : "Contrase\u00f1a lista.");
    return true;
  }

  function setAuthButtons() {
    const currentUser = getCurrentUser();
    const logged = Boolean(currentUser);
    const activeTab = getCurrentTab();
    if (authCardEl) authCardEl.hidden = logged || activeTab !== "opciones";
    if (accountMiniEl) accountMiniEl.hidden = !logged || activeTab !== "opciones";
    if (accountMiniEmailEl) accountMiniEmailEl.textContent = logged ? currentUser.email : "";
    if (cloudIndicatorEl) {
      cloudIndicatorEl.textContent = logged ? "Nube: Conectado" : "Nube: Local";
      cloudIndicatorEl.classList.toggle("ok", logged);
    }
    if (btnSignup) btnSignup.disabled = logged || getAuthActionInFlight();
    if (btnLogin) btnLogin.disabled = logged || getAuthActionInFlight();
    if (btnRecover) btnRecover.disabled = logged || getAuthActionInFlight();
    if (btnLogout) {
      btnLogout.disabled = !logged;
      btnLogout.hidden = !logged;
    }
    if (emailEl) emailEl.disabled = logged;
    if (passwordEl) passwordEl.disabled = logged;
    if (btnLogoutMini) btnLogoutMini.disabled = !logged;
    if (!logged) resetSyncError();
    refreshSyncIndicator();
    updateEntryGate();
  }

  function updateEntryGate() {
    if (!entryGateEl) return;
    entryGateEl.hidden = Boolean(getCurrentUser());
  }

  function setAuthActionBusy(activeButton = null, loadingText = "Procesando...") {
    const busy = Boolean(activeButton);
    setAuthActionInFlight(busy);
    const authButtons = [btnLogin, btnSignup, btnRecover];
    authButtons.forEach((btn) => {
      if (!btn) return;
      const isActive = btn === activeButton;
      btn.disabled = busy || btn.disabled;
      setButtonLoadingState(btn, isActive, loadingText);
      if (!isActive && busy) btn.disabled = true;
    });
    if (btnGateSignin) btnGateSignin.disabled = busy;
    if (btnGateSignup) btnGateSignup.disabled = busy;
  }

  function clearAuthActionBusy() {
    setAuthActionInFlight(false);
    [btnLogin, btnSignup, btnRecover].forEach((btn) => {
      if (!btn) return;
      setButtonLoadingState(btn, false);
    });
    if (btnGateSignin) btnGateSignin.disabled = false;
    if (btnGateSignup) btnGateSignup.disabled = false;
    setAuthButtons();
  }

  async function runAsyncAction(action, onErrorMessage) {
    try {
      await action();
    } catch (err) {
      setStatus(onErrorMessage(err), "error");
    }
  }

  return {
    clearAuthActionBusy,
    runAsyncAction,
    setAuthActionBusy,
    setAuthButtons,
    updateEntryGate,
    validateEmailField,
    validatePasswordField
  };
}
