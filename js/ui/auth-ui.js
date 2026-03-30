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
  heroSessionIndicatorEl,
  btnSignup,
  btnLogin,
  btnRecover,
  btnResetPassword,
  btnCancelRecovery,
  btnLogout,
  btnLogoutMini,
  btnGateSignin,
  btnGateSignup,
  emailEl,
  emailHintEl,
  passwordEl,
  passwordHintEl,
  authRecoveryBoxEl,
  authRecoveryNoteEl,
  authRecoveryTitleEl,
  authRecoveryTextEl,
  entryGateEl,
  getCurrentUser,
  getCurrentTab,
  getRecoveryMode,
  getRecoveryFeedback,
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
    const recoveryMode = Boolean(getRecoveryMode?.());
    const value = passwordEl?.value || "";
    if (!value) {
      const requiredMessage = recoveryMode ? "Escribe tu nueva contraseña." : "Introduce tu contraseña.";
      setFieldState(passwordEl, passwordHintEl, required ? "invalid" : "idle", required ? requiredMessage : "");
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
    const recoveryMode = Boolean(getRecoveryMode?.());
    const recoveryFeedback = getRecoveryFeedback?.() || null;
    const showRecoveryBox = recoveryMode || Boolean(recoveryFeedback);
    if (authCardEl) authCardEl.hidden = (!showRecoveryBox && logged) || activeTab !== "opciones";
    if (accountMiniEl) accountMiniEl.hidden = recoveryMode || !logged || activeTab !== "opciones";
    if (accountMiniEmailEl) accountMiniEmailEl.textContent = logged ? currentUser.email : "";
    if (cloudIndicatorEl) {
      cloudIndicatorEl.textContent = logged ? `Cuenta: ${currentUser.email}` : "Cuenta: sin sesion";
      cloudIndicatorEl.classList.toggle("ok", logged);
    }
    if (heroSessionIndicatorEl) {
      heroSessionIndicatorEl.textContent = logged ? `Cuenta conectada: ${currentUser.email}` : "Cuenta: sin sesion";
      heroSessionIndicatorEl.classList.toggle("ok", logged);
    }
    if (btnSignup) {
      btnSignup.disabled = recoveryMode || logged || getAuthActionInFlight();
      btnSignup.hidden = recoveryMode;
    }
    if (btnLogin) {
      btnLogin.disabled = recoveryMode || logged || getAuthActionInFlight();
      btnLogin.hidden = recoveryMode;
    }
    if (btnRecover) {
      btnRecover.disabled = recoveryMode || logged || getAuthActionInFlight();
      btnRecover.hidden = recoveryMode;
    }
    if (btnResetPassword) {
      btnResetPassword.disabled = !recoveryMode || getAuthActionInFlight();
      btnResetPassword.hidden = !recoveryMode;
    }
    if (btnCancelRecovery) {
      btnCancelRecovery.disabled = !recoveryMode || getAuthActionInFlight();
      btnCancelRecovery.hidden = !recoveryMode;
    }
    if (btnLogout) {
      btnLogout.disabled = recoveryMode || !logged;
      btnLogout.hidden = recoveryMode || !logged;
    }
    if (emailEl) emailEl.disabled = recoveryMode || logged;
    if (passwordEl) passwordEl.disabled = false;
    if (passwordEl) passwordEl.placeholder = recoveryMode ? "Escribe tu nueva contraseña" : "Minimo 6 caracteres";
    if (authRecoveryBoxEl) authRecoveryBoxEl.hidden = !showRecoveryBox;
    if (authRecoveryNoteEl) authRecoveryNoteEl.hidden = !recoveryMode;
    if (authRecoveryTitleEl) {
      authRecoveryTitleEl.textContent = recoveryFeedback?.title || "El enlace fue reconocido";
    }
    if (authRecoveryTextEl) {
      authRecoveryTextEl.innerHTML = recoveryFeedback?.body
        || 'Escribe tu nueva contraseña en el campo de abajo y pulsa <strong>Guardar nueva contraseña</strong>.';
    }
    if (btnLogoutMini) btnLogoutMini.disabled = !logged;
    if (recoveryMode && activeTab === "opciones" && passwordEl && document.activeElement !== passwordEl) {
      requestAnimationFrame(() => {
        passwordEl.focus();
        if (typeof passwordEl.select === "function") passwordEl.select();
      });
    }
    if (!logged) resetSyncError();
    refreshSyncIndicator();
    updateEntryGate();
  }

  function updateEntryGate() {
    if (!entryGateEl) return;
    entryGateEl.hidden = true;
  }

  function setAuthActionBusy(activeButton = null, loadingText = "Procesando...") {
    const busy = Boolean(activeButton);
    setAuthActionInFlight(busy);
    const authButtons = [btnLogin, btnSignup, btnRecover, btnResetPassword, btnCancelRecovery];
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
    [btnLogin, btnSignup, btnRecover, btnResetPassword, btnCancelRecovery].forEach((btn) => {
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
