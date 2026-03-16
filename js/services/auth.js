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
  updateEntryGate,
  isLocalDevelopment,
  fetchCurrentUserState,
  getAuthSession
}) {
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
      const msg = getPayloadErrorMessage(data, resp);
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
      const msg = getPayloadErrorMessage(data, resp);
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

    const resp = await sbFetch("/auth/v1/recover", {
      method: "POST",
      body: { email },
      auth: false
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      const msg = getPayloadErrorMessage(data, resp);
      setStatus(`Error al enviar recuperación: ${msg}`, "error");
      return;
    }

    setStatus("Si el email existe, Supabase envió un correo de recuperación.", "success");
  }

  async function logout() {
    if (getAuthSession()?.access_token) {
      await sbAuthFetch("/auth/v1/logout", { method: "POST" }).catch(() => {});
    }
    clearSession();
    setCurrentUser(null);
    setTxData(getLocalTransactionStore());
    setAuthButtons();
    updateEntryGate();
    refresh();
    setStatus(isLocalDevelopment() ? "Sesión cerrada. Modo local activo." : "Sesión cerrada.", "info");
  }

  async function initAuth() {
    if (!getAuthSession()?.access_token) {
      setCurrentUser(null);
      setStatus(isLocalDevelopment() ? "Sin sesión. Puedes iniciar sesión para guardar en la nube." : "Inicia sesión para usar la app.", "info");
      setAuthButtons();
      setTxData(getLocalTransactionStore());
      refresh();
      return;
    }

    const authState = await fetchCurrentUserState();
    if (!authState.ok) {
      const savedUser = getAuthSession()?.user || null;
      if (savedUser && (authState.status === 401 || authState.status === 403 || authState.status >= 500 || authState.status === 504 || authState.status === 599)) {
        setCurrentUser(savedUser);
        setAuthButtons();
        setStatus("Sesion restaurada. La nube se reintentara al reconectar.", "info");
        setTxData(getLocalTransactionStore());
        refresh();
        return;
      }

      clearSession();
      setCurrentUser(null);
      setStatus("Sesión expirada. Inicia sesión nuevamente.", "error");
      setAuthButtons();
      setTxData(getLocalTransactionStore());
      refresh();
      return;
    }

    setCurrentUser(authState.user);
    setAuthButtons();
    setStatus(`Conectado como ${authState.user.email}`, "success");
    await seedCloudIfEmpty();
    await loadCloudData();
  }

  return {
    signup,
    login,
    recoverPassword,
    logout,
    initAuth
  };
}
