export function createTransactionsService({
  getCurrentUser,
  getTxData,
  setTxData,
  loadTx,
  saveTx,
  getRefresh,
  requireCloudSession,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  getLocalTransactionStore
}) {
  async function loadCloudData() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setTxData(getLocalTransactionStore());
      getRefresh()?.();
      return;
    }

    const encodedUserId = encodeURIComponent(currentUser.id);
    const resp = await sbAuthFetch(
      `/rest/v1/movimientos?select=id,fecha,tipo,categoria,monto,detalle&user_id=eq.${encodedUserId}&order=fecha.desc,created_at.desc`,
      { method: "GET" }
    );

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`Error cargando nube: ${msg}`, "error");
      setTxData(loadTx());
      getRefresh()?.();
      return;
    }

    const data = await resp.json().catch(() => []);
    setTxData((data || []).map((r) => ({
      id: r.id,
      fecha: String(r.fecha).slice(0, 10),
      tipo: r.tipo,
      categoria: r.categoria,
      monto: Number(r.monto),
      detalle: r.detalle || ""
    })));
    saveTx(getTxData());
    getRefresh()?.();
  }

  async function seedCloudIfEmpty() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const encodedUserId = encodeURIComponent(currentUser.id);
    const checkResp = await sbAuthFetch(
      `/rest/v1/movimientos?select=id&user_id=eq.${encodedUserId}&limit=1`,
      { method: "GET" }
    );
    if (!checkResp.ok) return;

    const existing = await checkResp.json().catch(() => []);
    if (Array.isArray(existing) && existing.length > 0) return;

    const localData = getLocalTransactionStore();
    const payload = localData
      .filter((x) => x.fecha && x.tipo && x.categoria && Number(x.monto) > 0)
      .map((x) => ({
        user_id: currentUser.id,
        fecha: String(x.fecha).slice(0, 10),
        tipo: x.tipo,
        categoria: x.categoria,
        monto: Number(x.monto),
        detalle: x.detalle || ""
      }));

    if (payload.length === 0) return;

    const resp = await sbAuthFetch("/rest/v1/movimientos", {
      method: "POST",
      body: payload
    });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`No se pudo migrar historico: ${msg}`, "error");
    }
  }

  async function addTransaction(tx) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (!requireCloudSession("guardar movimientos")) return;
      const all = loadTx();
      all.push(tx);
      saveTx(all);
      setTxData(all);
      getRefresh()?.();
      return;
    }

    const resp = await sbAuthFetch("/rest/v1/movimientos", {
      method: "POST",
      body: {
        user_id: currentUser.id,
        fecha: tx.fecha,
        tipo: tx.tipo,
        categoria: tx.categoria,
        monto: tx.monto,
        detalle: tx.detalle
      }
    });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`Error guardando en nube: ${msg}`, "error");
      return;
    }

    await loadCloudData();
  }

  async function updateTransaction(id, tx) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (!requireCloudSession("editar movimientos")) return false;
      const next = loadTx().map((x) => (String(x.id) === String(id) ? { ...x, ...tx, id: x.id } : x));
      saveTx(next);
      setTxData(next);
      getRefresh()?.();
      return true;
    }

    const encodedId = encodeURIComponent(id);
    const resp = await sbAuthFetch(`/rest/v1/movimientos?id=eq.${encodedId}`, {
      method: "PATCH",
      body: {
        fecha: tx.fecha,
        tipo: tx.tipo,
        categoria: tx.categoria,
        monto: tx.monto,
        detalle: tx.detalle
      }
    });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`Error actualizando en nube: ${msg}`, "error");
      return false;
    }

    await loadCloudData();
    return true;
  }

  async function deleteTransaction(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (!requireCloudSession("eliminar movimientos")) return;
      const next = loadTx().filter((x) => String(x.id) !== String(id));
      saveTx(next);
      setTxData(next);
      getRefresh()?.();
      return;
    }

    const encodedId = encodeURIComponent(id);
    const resp = await sbAuthFetch(`/rest/v1/movimientos?id=eq.${encodedId}`, {
      method: "DELETE"
    });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`Error eliminando en nube: ${msg}`, "error");
      return;
    }

    await loadCloudData();
  }

  async function clearAllTransactions() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (!requireCloudSession("borrar tus datos")) return false;
      saveTx([]);
      setTxData([]);
      getRefresh()?.();
      return true;
    }

    const encodedUserId = encodeURIComponent(currentUser.id);
    const resp = await sbAuthFetch(`/rest/v1/movimientos?user_id=eq.${encodedUserId}`, {
      method: "DELETE"
    });

    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      setStatus(`No se pudieron borrar datos: ${msg}`, "error");
      return false;
    }

    await loadCloudData();
    return true;
  }

  async function duplicateTransaction(id) {
    const base = getTxData().find((x) => String(x.id) === String(id));
    if (!base) {
      setStatus("No se encontro el movimiento para duplicar.", "error");
      return false;
    }

    const today = new Date().toISOString().slice(0, 10);
    await addTransaction({
      id: crypto.randomUUID(),
      fecha: today,
      tipo: base.tipo,
      monto: Number(base.monto),
      categoria: base.categoria,
      detalle: base.detalle || ""
    });
    setStatus(`Movimiento duplicado en fecha ${today}.`, "success");
    return true;
  }

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    duplicateTransaction,
    loadCloudData,
    seedCloudIfEmpty
  };
}
