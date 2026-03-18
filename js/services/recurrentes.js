export function createRecurrentesService({
  getCurrentUser,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  setFeatureStatus,
  showToast,
  setFeatureAvailability,
  loadRecurrentesCache,
  saveRecurrentesCache,
  clearRecurrentesCache,
  loadRecurrentOmissions,
  saveRecurrentOmissions
}) {
  function sortRecurrentes(items) {
    return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
      const dayDiff = Number(a.anchor_day || 0) - Number(b.anchor_day || 0);
      if (dayDiff !== 0) return dayDiff;
      return String(a.categoria || "").localeCompare(String(b.categoria || ""));
    });
  }

  function recurrentSignature(item) {
    return [
      item.tipo === "Ingreso" ? "Ingreso" : "Gasto",
      String(item.categoria || "").trim(),
      Number(item.monto || 0).toFixed(2),
      String(item.detalle || "").trim(),
      Number(item.anchor_day || 0),
      item.activo !== false ? "1" : "0"
    ].join("|");
  }

  function dedupeRecurrentes(items) {
    const map = new Map();
    for (const rawItem of Array.isArray(items) ? items : []) {
      const item = normalizeRecurrent(rawItem);
      const signature = recurrentSignature(item);
      const existing = map.get(signature);
      if (!existing) {
        map.set(signature, item);
        continue;
      }
      const existingTs = Date.parse(existing.updated_at || existing.created_at || 0) || 0;
      const currentTs = Date.parse(item.updated_at || item.created_at || 0) || 0;
      if (currentTs >= existingTs) {
        map.set(signature, item);
      }
    }
    return [...map.values()];
  }

  function persistLocalRows(items) {
    const normalized = sortRecurrentes(dedupeRecurrentes(items));
    saveRecurrentesCache(normalized);
    return normalized;
  }

  function buildLocalRow(payload, currentUser, editingId = null, previous = null) {
    const nowIso = new Date().toISOString();
    return normalizeRecurrent({
      id: editingId || previous?.id || crypto.randomUUID(),
      user_id: currentUser?.id || previous?.user_id || "",
      tipo: payload.tipo,
      categoria: payload.categoria,
      monto: Number(payload.monto),
      detalle: payload.detalle || "",
      frecuencia: "monthly",
      anchor_day: Number(payload.anchor_day),
      activo: payload.activo !== false,
      created_at: previous?.created_at || nowIso,
      updated_at: nowIso
    });
  }

  function upsertLocalFallback(payload, currentUser, editingId = null) {
    const current = Array.isArray(loadRecurrentesCache()) ? loadRecurrentesCache() : [];
    const previous = editingId ? current.find((item) => item.id === editingId) : null;
    const nextRow = buildLocalRow(payload, currentUser, editingId, previous);
    if (!editingId) {
      const duplicate = current.find((item) => recurrentSignature(item) === recurrentSignature(nextRow));
      if (duplicate) {
        return { rows: persistLocalRows(current), duplicate: true };
      }
    }
    const next = editingId
      ? current.map((item) => (item.id === editingId ? nextRow : item))
      : [...current, nextRow];
    return { rows: persistLocalRows(next), duplicate: false };
  }

  function deleteLocalFallback(id) {
    const current = Array.isArray(loadRecurrentesCache()) ? loadRecurrentesCache() : [];
    return persistLocalRows(current.filter((item) => item.id !== id));
  }

  function toggleLocalFallback(id, nextActive) {
    const current = Array.isArray(loadRecurrentesCache()) ? loadRecurrentesCache() : [];
    return persistLocalRows(current.map((item) => (
      item.id === id
        ? { ...item, activo: Boolean(nextActive), updated_at: new Date().toISOString() }
        : item
    )));
  }

  async function withDeadline(factory, ms = 6000) {
    let timer = null;
    try {
      return await Promise.race([
        factory(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("timeout")), ms);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function syncRowsFromCloud() {
    const rows = await loadRecurrentes();
    if (Array.isArray(rows) && rows.length >= 0) {
      saveRecurrentesCache(rows);
    }
    return rows;
  }

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
      setFeatureAvailability?.(false);
      clearRecurrentesCache();
      return [];
    }

    const encodedUserId = encodeURIComponent(currentUser.id);
    let resp;
    try {
      resp = await withDeadline(() => sbAuthFetch(
        `/rest/v1/recurrentes?select=id,user_id,tipo,categoria,monto,detalle,frecuencia,anchor_day,activo,created_at,updated_at&user_id=eq.${encodedUserId}&order=anchor_day.asc,categoria.asc`,
        { method: "GET", trackSync: false }
      ));
    } catch {
      showToast("Usando movimientos programados de este dispositivo");
      return sortRecurrentes(loadRecurrentesCache());
    }

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      if (isMissingTableMessage(msg)) {
        setFeatureAvailability?.(false);
        clearRecurrentesCache();
        return [];
      }
      setFeatureAvailability?.(true);
      showToast("No se pudieron cargar los movimientos programados");
      setFeatureStatus?.(`Error cargando movimientos programados: ${msg}`, "error");
      setStatus(`Error cargando movimientos programados: ${msg}`, "error");
      return loadRecurrentesCache();
    }

    const data = await resp.json().catch(() => []);
    const normalized = dedupeRecurrentes(data || []);
    setFeatureAvailability?.(true);
    saveRecurrentesCache(normalized);
    return normalized;
  }

  async function saveRecurrent(payload, editingId = null) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Inicia sesión para guardar movimientos programados");
      setFeatureStatus?.("Necesitas iniciar sesión para guardar movimientos programados.", "error");
      setStatus("Necesitas iniciar sesion para guardar movimientos programados.", "error");
      return { ok: false };
    }

    const localResult = upsertLocalFallback(payload, currentUser, editingId);
    const localRows = localResult.rows;

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

    if (localResult.duplicate && !editingId) {
      showToast("Ese movimiento programado ya existía");
      setFeatureStatus?.("Ese movimiento programado ya estaba guardado.", "ok");
      setStatus("Ese movimiento programado ya estaba guardado.", "success");
      return { ok: true, rows: localRows };
    }

    showToast(editingId ? "Movimiento programado actualizado" : "Movimiento programado guardado");
    setFeatureStatus?.(editingId ? "Movimiento programado actualizado." : "Movimiento programado guardado.", "ok");
    setStatus(editingId ? "Movimiento programado actualizado." : "Movimiento programado guardado.", "success");

    void (async () => {
      try {
        const resp = editingId
          ? await withDeadline(() => sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(editingId)}`, { method: "PATCH", body, trackSync: false }))
          : await withDeadline(() => sbAuthFetch("/rest/v1/recurrentes", { method: "POST", body, trackSync: false }));

        if (!resp.ok) {
          const msg = await getResponseErrorMessage(resp);
          if (isMissingTableMessage(msg)) {
            setFeatureAvailability?.(true);
            return;
          }
      setFeatureStatus?.(`Guardado local. La nube no respondió: ${msg}`, "error");
          return;
        }

        await syncRowsFromCloud();
      } catch {
        setFeatureStatus?.("Guardado en este dispositivo. La nube se reintentará después.", "ok");
      }
    })();

    return { ok: true, rows: localRows };
  }

  async function deleteRecurrent(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Inicia sesión para borrar movimientos programados");
      setFeatureStatus?.("Necesitas iniciar sesión para borrar movimientos programados.", "error");
      setStatus("Necesitas iniciar sesion para borrar movimientos programados.", "error");
      return { ok: false };
    }

    const localRows = deleteLocalFallback(id);
    showToast("Movimiento programado eliminado");
    setFeatureStatus?.("Movimiento programado eliminado.", "ok");
    setStatus("Movimiento programado eliminado.", "success");

    void (async () => {
      try {
        const resp = await withDeadline(() => sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", trackSync: false }));
        if (!resp.ok) {
          const msg = await getResponseErrorMessage(resp);
          if (!isMissingTableMessage(msg)) {
            setFeatureStatus?.(`Eliminado local. La nube no respondió: ${msg}`, "error");
          }
          return;
        }
        await syncRowsFromCloud();
      } catch {
        setFeatureStatus?.("Eliminado en este dispositivo. La nube se reintentará después.", "ok");
      }
    })();

    return { ok: true, rows: localRows };
  }

  async function toggleRecurrent(id, nextActive) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Inicia sesión para actualizar movimientos programados");
      setFeatureStatus?.("Necesitas iniciar sesión para actualizar movimientos programados.", "error");
      setStatus("Necesitas iniciar sesion para actualizar movimientos programados.", "error");
      return { ok: false };
    }

    const localRows = toggleLocalFallback(id, nextActive);
    showToast(nextActive ? "Movimiento programado activado" : "Movimiento programado pausado");
    setFeatureStatus?.(nextActive ? "Movimiento programado activado." : "Movimiento programado pausado.", "ok");

    void (async () => {
      try {
        const resp = await withDeadline(() => sbAuthFetch(`/rest/v1/recurrentes?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: { activo: Boolean(nextActive) },
          trackSync: false
        }));
        if (!resp.ok) {
          const msg = await getResponseErrorMessage(resp);
          if (!isMissingTableMessage(msg)) {
            setFeatureStatus?.(`Cambio local. La nube no respondió: ${msg}`, "error");
          }
          return;
        }
        await syncRowsFromCloud();
      } catch {
        setFeatureStatus?.("Cambio guardado en este dispositivo. La nube se reintentará después.", "ok");
      }
    })();

    return { ok: true, rows: localRows };
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
