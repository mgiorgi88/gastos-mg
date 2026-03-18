export function createRecurrentesService({
  getCurrentUser,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  showToast,
  loadRecurrentesCache,
  saveRecurrentesCache,
  clearRecurrentesCache,
  loadRecurrentOmissions,
  saveRecurrentOmissions
}) {
  function isMissingTableMessage(message) {
    const text = String(message || "").toLowerCase();
    return text.includes("recurrentes") && (text.includes("does not exist") || text.includes("could not find") || text.includes("relation"));
  }

  function normalizeRecurrent(item) {
    return {
      id: String(item.id),
      user_id: String(item.user_id || ""),
      tipo: item.tipo === "Ingreso" ? "Ingreso" : "Gasto",
      categoria: String(item.categoria || "").trim(),
      monto: Number(item.monto || 0),
      detalle: String(item.detalle || "").trim(),
      frecuencia: "monthly",
      anchor_day: Number(item.anchor_day || 1),
      activo: item.activo !== false,
      created_at: item.created_at || null,
      updated_at: item.updated_at || null
    };
  }

  function currentMonthKey(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getOmittedIds(monthKey = currentMonthKey()) {
    return Array.isArray(loadRecurrentOmissions(monthKey)) ? loadRecurrentOmissions(monthKey) : [];
  }

  function omitForMonth(id, monthKey = currentMonthKey()) {
    const current = new Set(getOmittedIds(monthKey));
    current.add(String(id));
    saveRecurrentOmissions(monthKey, [...current]);
  }

  async function loadRecurrentes() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      clearRecurrentesCache();
      return [];
    }

    const encodedUserId = encodeURIComponent(currentUser.id);
    const resp = await sbAuthFetch(
      `/rest/v1/recurrentes?select=id,user_id,tipo,categoria,monto,detalle,frecuencia,anchor_day,activo,created_at,updated_at&user_id=eq.${encodedUserId}&order=anchor_day.asc,categoria.asc`,
      { method: "GET" }
    );

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      if (isMissingTableMessage(msg)) {
        clearRecurrentesCache();
        return [];
      }
      setStatus(`Error cargando recurrentes: ${msg}`, "error");
      return loadRecurrentesCache();
    }

    const data = await resp.json().catch(() => []);
    const normalized = (data || []).map(normalizeRecurrent);
    saveRecurrentesCache(normalized);
    return normalized;
  }

  async function saveRecurrent(payload, editingId = null) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setStatus("Necesitas iniciar sesion para guardar recurrentes.", "error");
      return { ok: false };
    }

    const body = {
      user_id: currentUser.id,
      tipo: payload.tipo === "Ingreso" ? "Ingreso" : "Gasto",
      categoria: payload.categoria,
      monto: Number(payload.monto),
      detalle: payload.detalle || "",
      frecuencia: "monthly",
      anchor_day: Number(payload.anchor_day),
      activo: payload.activo !== false
    };

    const resp = editingId
      ? await sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(editingId)}`, { method: "PATCH", body })
      : await sbAuthFetch("/rest/v1/recurrentes", { method: "POST", body });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      if (isMissingTableMessage(msg)) {
        setStatus("Activa la tabla de recurrentes en Supabase para usar esta función.", "error");
        return { ok: false };
      }
      setStatus(`No se pudo guardar el recurrente: ${msg}`, "error");
      return { ok: false };
    }

    const rows = await loadRecurrentes();
    showToast(editingId ? "Recurrente actualizado" : "Recurrente guardado");
    setStatus(editingId ? "Recurrente actualizado." : "Recurrente guardado.", "success");
    return { ok: true, rows };
  }

  async function deleteRecurrent(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setStatus("Necesitas iniciar sesion para borrar recurrentes.", "error");
      return { ok: false };
    }

    const resp = await sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      if (isMissingTableMessage(msg)) {
        setStatus("Activa la tabla de recurrentes en Supabase para usar esta función.", "error");
        return { ok: false };
      }
      setStatus(`No se pudo borrar el recurrente: ${msg}`, "error");
      return { ok: false };
    }

    const rows = await loadRecurrentes();
    showToast("Recurrente eliminado");
    setStatus("Recurrente eliminado.", "success");
    return { ok: true, rows };
  }

  async function toggleRecurrent(id, nextActive) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setStatus("Necesitas iniciar sesion para actualizar recurrentes.", "error");
      return { ok: false };
    }

    const resp = await sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { activo: Boolean(nextActive) }
    });
    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      if (isMissingTableMessage(msg)) {
        setStatus("Activa la tabla de recurrentes en Supabase para usar esta función.", "error");
        return { ok: false };
      }
      setStatus(`No se pudo actualizar el recurrente: ${msg}`, "error");
      return { ok: false };
    }

    const rows = await loadRecurrentes();
    showToast(nextActive ? "Recurrente activado" : "Recurrente pausado");
    return { ok: true, rows };
  }

  return {
    currentMonthKey,
    deleteRecurrent,
    getOmittedIds,
    loadRecurrentes,
    omitForMonth,
    saveRecurrent,
    toggleRecurrent
  };
}
