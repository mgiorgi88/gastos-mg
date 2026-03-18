import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/constants.js";

const NETWORK_TIMEOUT_MS = 12000;
const NETWORK_RETRY_ATTEMPTS = 2;

export function createSupabaseService({
  getAuthSession,
  getCurrentUser,
  saveSession,
  clearSession,
  beginSyncOperation,
  endSyncOperation
}) {
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchWithTimeout(url, init, timeoutMs = NETWORK_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function buildErrorResponse(message, status = 599) {
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  async function getResponseErrorMessage(resp) {
    try {
      const data = await resp.clone().json();
      if (data?.msg) return data.msg;
      if (data?.message) return data.message;
      if (data?.error_description) return data.error_description;
      if (data?.error) return data.error;
      return resp.statusText || `HTTP ${resp.status}`;
    } catch {
      return resp.statusText || `HTTP ${resp.status}`;
    }
  }

  function getPayloadErrorMessage(data, resp) {
    return data?.msg || data?.message || data?.error_description || data?.error || resp.statusText || `HTTP ${resp.status}`;
  }

  async function sbFetch(path, options = {}) {
    const { method = "GET", body, auth = false, retry = true, timeoutMs = NETWORK_TIMEOUT_MS, headers: extraHeaders = {} } = options;
    const upperMethod = String(method || "GET").toUpperCase();
    const canRetry = retry && (upperMethod === "GET" || upperMethod === "HEAD");
    const attempts = canRetry ? NETWORK_RETRY_ATTEMPTS : 1;
    const trackSync = options.trackSync ?? Boolean(getCurrentUser());
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...extraHeaders
    };
    const authSession = getAuthSession();

    if (auth && authSession?.access_token) {
      headers.Authorization = `Bearer ${authSession.access_token}`;
    }

    let closed = false;
    const closeSync = (ok) => {
      if (closed || !trackSync) return;
      closed = true;
      endSyncOperation(ok);
    };
    if (trackSync) beginSyncOperation();

    for (let i = 1; i <= attempts; i += 1) {
      try {
        const resp = await fetchWithTimeout(`${SUPABASE_URL}${path}`, {
          method: upperMethod,
          headers,
          body: body ? JSON.stringify(body) : undefined
        }, timeoutMs);

        if (canRetry && (resp.status >= 500 || resp.status === 429) && i < attempts) {
          await wait(260 * i);
          continue;
        }
        closeSync(resp.ok);
        return resp;
      } catch (err) {
        if (i < attempts) {
          await wait(260 * i);
          continue;
        }
        if (err?.name === "AbortError") {
          closeSync(false);
          return buildErrorResponse("Tiempo de espera agotado al conectar con la nube.", 504);
        }
        closeSync(false);
        return buildErrorResponse("No se pudo conectar con la nube. Revisa internet.", 599);
      }
    }

    closeSync(false);
    return buildErrorResponse("Error de red inesperado.", 599);
  }

  async function refreshAuthToken() {
    const authSession = getAuthSession();
    if (!authSession?.refresh_token) {
      return { ok: false, transient: false };
    }

    const resp = await sbFetch("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: authSession.refresh_token },
      auth: false
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data?.access_token) {
      const isTransient = resp.status >= 500 || resp.status === 429 || resp.status === 504 || resp.status === 599;
      return { ok: false, transient: isTransient };
    }

    saveSession(data);
    return { ok: true, transient: false };
  }

  async function sbAuthFetch(path, options = {}, retry = true) {
    let resp = await sbFetch(path, { ...options, auth: true });
    if (resp.status !== 401 || !retry) return resp;

    const refreshState = await refreshAuthToken();
    if (!refreshState.ok) {
      if (refreshState.transient) {
        return buildErrorResponse("No se pudo revalidar la sesion. Se reintentara automaticamente.", 599);
      }
      return resp;
    }

    resp = await sbFetch(path, { ...options, auth: true });
    return resp;
  }

  async function fetchCurrentUser() {
    if (!getAuthSession()?.access_token) return null;

    const resp = await sbAuthFetch("/auth/v1/user", { method: "GET" });
    if (!resp.ok) return null;

    return resp.json();
  }

  async function fetchCurrentUserState() {
    if (!getAuthSession()?.access_token) {
      return { ok: false, status: 401, user: null };
    }

    const resp = await sbAuthFetch("/auth/v1/user", { method: "GET" });
    if (!resp.ok) {
      return { ok: false, status: resp.status, user: null };
    }

    const user = await resp.json().catch(() => null);
    return { ok: Boolean(user), status: resp.status, user };
  }

  return {
    getResponseErrorMessage,
    getPayloadErrorMessage,
    sbFetch,
    sbAuthFetch,
    fetchCurrentUser,
    fetchCurrentUserState
  };
}
