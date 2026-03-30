export function createAuthService({
  emailEl,
  passwordEl,
  validateEmailField,
  validatePasswordField,
  setStatus,
  applyRememberPreference,
  saveSession,
  setCurrentUser,
  setAuthButtons,
  seedCloudIfEmpty,
  loadCloudData,
  setActiveTab,
  refresh,
  getPayloadErrorMessage,
  sbFetch,
  sbAuthFetch,
  clearSession,
  getLocalTransactionStore,
  setTxData,
  loadRecurrentesData,
  clearRecurrentesState,
  updateEntryGate,
  isLocalDevelopment,
  setRecoveryMode,
  setRecoveryFeedback,
  refreshAuthToken,
  fetchCurrentUserState,
  getAuthSession,
  markSyncPending
}) {
  function getFriendlyAuthMessage(message, fallback = "No pudimos completar la operación.") {
    const normalized = String(message || "").trim().toLowerCase();
    if (!normalized) return fallback;
    if (normalized.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
    if (normalized.includes("email not confirmed")) return "Tu cuenta todavía no fue confirmada por email.";
    if (normalized.includes("signup is disabled")) return "El registro de nuevas cuentas no está disponible en este momento.";
    if (normalized.includes("user already registered")) return "Ya existe una cuenta con ese email.";
    if (normalized.includes("expired")) return "El enlace expiró. Pide uno nuevo e inténtalo otra vez.";
    if (normalized.includes("weak password")) return "La contraseña elegida es demasiado débil.";
    return message || fallback;
  }

  function getAuthCallbackSession() {
    const hash = String(window.location.hash || "").replace(/^#/, "");
    const search = String(window.location.search || "").replace(/^\?/, "");
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
    const type = hashParams.get("type") || searchParams.get("type");
    if (!accessToken || !refreshToken) return null;
    return {
      type,
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: hashParams.get("token_type") || searchParams.get("token_type") || "bearer",
        expires_in: Number(hashParams.get("expires_in") || searchParams.get("expires_in") || 3600),
        expires_at: Number(hashParams.get("expires_at") || searchParams.get("expires_at") || 0) || undefined
      }
    };
  }

  function getAuthCallbackError() {
    const hash = String(window.location.hash || "").replace(/^#/, "");
    const search = String(window.location.search || "").replace(/^\?/, "");
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    const error = hashParams.get("error") || searchParams.get("error");
    const errorCode = hashParams.get("error_code") || searchParams.get("error_code");
    const description = hashParams.get("error_description") || searchParams.get("error_description");
    if (!error && !errorCode && !description) return null;
    return {
      error,
      errorCode,
      description: description ? description.replace(/\+/g, " ") : ""
    };
  }

  function clearAuthCallbackUrl() {
    const cleanParams = new URLSearchParams(window.location.search);
    ["access_token", "refresh_token", "token_type", "expires_in", "expires_at", "type", "error", "error_code", "error_description", "sb"].forEach((key) => cleanParams.delete(key));
    const nextSearch = cleanParams.toString();
    const cleanUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  async function signup() {
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    const validEmail = validateEmailField({ required: true });
    const validPassword = validatePasswordField({ required: true, minLength: 6 });
    if (!validEmail) {
      setStatus("Revisa el email antes de crear la cuenta.", "error");
      emailEl?.focus();
      return;
    }
    if (!validPassword) {
      setStatus("Completa email y contraseña (mínimo 6 caracteres).", "error");
      passwordEl?.focus();
      return;
    }

    const resp = await sbFetch("/auth/v1/signup", {
      method: "POST",
      body: { email, password },
      auth: false
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = getFriendlyAuthMessage(getPayloadErrorMessage(data, resp), "No pudimos crear la cuenta.");
      setStatus(`Error al crear cuenta: ${msg}`, "error");
      return;
    }

    if (data?.access_token) {
      applyRememberPreference();
      saveSession(data);
      setCurrentUser(data.user || null);
      setAuthButtons();
      setStatus(`Conectado como ${data.user?.email || email}`, "success");
      await seedCloudIfEmpty();
      await loadCloudData();
      await loadRecurrentesData?.();
      setActiveTab("cargar");
      refresh();
    } else {
      setStatus("Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.", "success");
    }
  }

  async function login() {
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    const validEmail = validateEmailField({ required: true });
    const validPassword = validatePasswordField({ required: true });
    if (!validEmail) {
      setStatus("Revisa el email antes de iniciar sesión.", "error");
      emailEl?.focus();
      return;
    }
    if (!validPassword) {
      setStatus("Ingresa email y contraseña.", "error");
      passwordEl?.focus();
      return;
    }

    const resp = await sbFetch("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email, password },
      auth: false
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data?.access_token) {
      const msg = getFriendlyAuthMessage(getPayloadErrorMessage(data, resp), "No pudimos iniciar sesión.");
      setStatus(`Error de inicio de sesión: ${msg}`, "error");
      return;
    }

    applyRememberPreference();
    saveSession(data);
    setCurrentUser(data.user || null);
    setAuthButtons();
    setStatus(`Conectado como ${data.user?.email || email}`, "success");
    await seedCloudIfEmpty();
    await loadCloudData();
    await loadRecurrentesData?.();
    setActiveTab("cargar");
    refresh();
  }

  async function recoverPassword() {
    const email = emailEl.value.trim();
    const validEmail = validateEmailField({ required: true });
    if (!validEmail) {
      setStatus("Escribe tu email para recuperar contraseña.", "error");
      emailEl?.focus();
      return;
    }

    const redirectUrl = new URL(window.location.pathname, window.location.origin);
    redirectUrl.searchParams.set("v", "209-auth");
    const appParam = new URLSearchParams(window.location.search).get("app");
    if (appParam) redirectUrl.searchParams.set("app", appParam);
    const redirectTo = redirectUrl.toString();
    const resp = await sbFetch("/auth/v1/recover", {
      method: "POST",
      body: { email, redirect_to: redirectTo },
      auth: false
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      const msg = getFriendlyAuthMessage(getPayloadErrorMessage(data, resp), "No pudimos enviar el correo de recuperación.");
      setStatus(`Error al enviar recuperación: ${msg}`, "error");
      return;
    }

    setStatus("Si el email existe, te enviamos un correo para recuperar la contraseña.", "success");
  }

  async function updatePassword() {
    const password = passwordEl.value;
    const validPassword = validatePasswordField({ required: true, minLength: 6 });
    if (!validPassword) {
      setStatus("Escribe una nueva contraseña válida de al menos 6 caracteres.", "error");
      passwordEl?.focus();
      return;
    }

    const resp = await sbAuthFetch("/auth/v1/user", {
      method: "PUT",
      body: { password }
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = getFriendlyAuthMessage(getPayloadErrorMessage(data, resp), "No pudimos actualizar la contraseña.");
      setStatus(`No se pudo actualizar la contraseña: ${msg}`, "error");
      return;
    }

    const authState = await fetchCurrentUserState();
    if (authState.ok) {
      setCurrentUser(authState.user);
    }
    setRecoveryMode(false);
    setAuthButtons();
    clearAuthCallbackUrl();
    if (passwordEl) passwordEl.value = "";
    validatePasswordField();
    setStatus("Contraseña actualizada. Ya puedes entrar con tu nueva clave.", "success");
    setActiveTab("opciones");
    refresh();
  }

  async function cancelRecovery() {
    setRecoveryMode(false);
    clearAuthCallbackUrl();
    await logout();
    setStatus("Recuperación cancelada.", "info");
  }

  async function logout() {
    if (getAuthSession()?.access_token) {
      await sbAuthFetch("/auth/v1/logout", { method: "POST" }).catch(() => {});
    }
    clearSession();
    setCurrentUser(null);
    setTxData(getLocalTransactionStore());
    clearRecurrentesState?.();
    setAuthButtons();
    updateEntryGate();
    refresh();
    setStatus(isLocalDevelopment() ? "Sesión cerrada. Modo local activo." : "Sesión cerrada.", "info");
  }

  async function initAuth() {
    const callbackError = getAuthCallbackError();
    if (callbackError) {
      setRecoveryMode(false);
      setRecoveryFeedback({
        title: callbackError.errorCode === "otp_expired" ? "El enlace venció" : "No pudimos usar el enlace",
        body: callbackError.errorCode === "otp_expired"
          ? "Este enlace de recuperación ya venció. Vuelve a pulsar <strong>Recuperar contraseña</strong> para pedir uno nuevo."
          : "El enlace no es válido o ya no puede usarse. Pide un nuevo correo de recuperación e inténtalo otra vez."
      });
      setAuthButtons();
      updateEntryGate();
      setActiveTab("opciones");
      clearAuthCallbackUrl();
      setStatus(getFriendlyAuthMessage(callbackError.description || callbackError.errorCode || callbackError.error, "No pudimos usar el enlace de recuperación."), "error");
      refresh();
      requestAnimationFrame(() => {
        emailEl?.focus();
      });
      return;
    }

    const callbackSession = getAuthCallbackSession();
    if (callbackSession?.type === "recovery") {
      setRecoveryFeedback(null);
      saveSession({
        ...getAuthSession(),
        ...callbackSession.session
      });
      setRecoveryMode(true);
      markSyncPending?.(false);
      const authState = await fetchCurrentUserState();
      if (authState.ok) {
        setCurrentUser(authState.user);
      }
      setAuthButtons();
      updateEntryGate();
      setActiveTab("opciones");
      clearAuthCallbackUrl();
      setStatus("Enlace de recuperación detectado. Escribe tu nueva contraseña y pulsa Guardar nueva contraseña.", "info");
      refresh();
      requestAnimationFrame(() => {
        passwordEl?.focus();
        if (passwordEl && typeof passwordEl.select === "function") passwordEl.select();
      });
      return;
    }

    const savedSession = getAuthSession();
    if (!savedSession?.access_token) {
      setRecoveryFeedback(null);
      markSyncPending?.(false);
      setCurrentUser(null);
      setStatus(isLocalDevelopment() ? "Sin sesión. Puedes iniciar sesión para guardar en la nube." : "Inicia sesión para usar la app.", "info");
      setAuthButtons();
      setTxData(getLocalTransactionStore());
      clearRecurrentesState?.();
      refresh();
      return;
    }

    if (savedSession.refresh_token) {
      const refreshState = await refreshAuthToken();
      if (!refreshState.ok && !refreshState.transient) {
        clearSession();
        markSyncPending?.(false);
        setCurrentUser(null);
        setStatus("SesiÃ³n expirada. Inicia sesiÃ³n nuevamente.", "error");
        setAuthButtons();
        setTxData(getLocalTransactionStore());
        clearRecurrentesState?.();
        refresh();
        return;
      }
    }

    const authState = await fetchCurrentUserState();
    if (!authState.ok) {
      const savedUser = getAuthSession()?.user || null;
      const hasRefreshToken = Boolean(getAuthSession()?.refresh_token);
      const isTransient = authState.status >= 500 || authState.status === 504 || authState.status === 599 || authState.status === 429;
      if (savedUser && hasRefreshToken && isTransient) {
        setCurrentUser(savedUser);
        markSyncPending?.(true);
        setAuthButtons();
        setStatus("Sesion restaurada. La nube se reintentara al reconectar.", "info");
        setTxData(getLocalTransactionStore());
        await loadRecurrentesData?.();
        refresh();
        return;
      }

      clearSession();
      markSyncPending?.(false);
      setCurrentUser(null);
      setStatus("Sesión expirada. Inicia sesión nuevamente.", "error");
      setAuthButtons();
      setTxData(getLocalTransactionStore());
      clearRecurrentesState?.();
      refresh();
      return;
    }

    setCurrentUser(authState.user);
    markSyncPending?.(false);
    setAuthButtons();
    setStatus(`Conectado como ${authState.user.email}`, "success");
    await seedCloudIfEmpty();
    await loadCloudData();
    await loadRecurrentesData?.();
  }

  return {
    signup,
    login,
    recoverPassword,
    updatePassword,
    cancelRecovery,
    logout,
    initAuth
  };
}
