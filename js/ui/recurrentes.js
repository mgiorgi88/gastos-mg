export function createRecurrentesUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  optionsRecurrentCardEl,
  recurrentAuthHintEl,
  recurrentManagerEl,
  recurrentTypeEl,
  recurrentCategoryEl,
  recurrentAmountEl,
  recurrentDetailEl,
  recurrentAnchorDayEl,
  recurrentActiveEl,
  btnRecurrentSaveEl,
  btnRecurrentCancelEl,
  recurrentStatusEl,
  recurrentListEl,
  parseDecimalInputValue,
  setButtonLoadingState,
  showToast,
  getCurrentUser,
  isFeatureAvailable,
  getRecurrentes,
  setRecurrentes,
  saveRecurrent,
  deleteRecurrent,
  toggleRecurrent,
  refreshSuggestions
}) {
  let editingId = null;

  function setStatus(message, tone = "neutral") {
    if (!recurrentStatusEl) return;
    recurrentStatusEl.textContent = message;
    recurrentStatusEl.classList.remove("quick-config-status-error", "quick-config-status-ok");
    if (tone === "error") recurrentStatusEl.classList.add("quick-config-status-error");
    if (tone === "ok") recurrentStatusEl.classList.add("quick-config-status-ok");
  }

  function updateAuthVisibility() {
    const logged = Boolean(getCurrentUser());
    const enabled = isFeatureAvailable?.() !== false;
    if (optionsRecurrentCardEl) optionsRecurrentCardEl.hidden = !logged || !enabled;
    if (recurrentAuthHintEl) recurrentAuthHintEl.hidden = logged;
    if (recurrentManagerEl) recurrentManagerEl.hidden = !logged;
  }

  function updateCategoryOptions() {
    if (!recurrentCategoryEl || !recurrentTypeEl) return;
    const current = recurrentCategoryEl.value;
    const list = CATEGORIAS[recurrentTypeEl.value] || [];
    recurrentCategoryEl.innerHTML = list
      .map((cat) => `<option value="${cat}">${CATEGORY_ICONS[cat] || "•"} ${cat}</option>`)
      .join("");
    recurrentCategoryEl.value = list.includes(current) ? current : (list[0] || "");
  }

  function resetForm() {
    editingId = null;
    if (recurrentTypeEl) recurrentTypeEl.value = "Gasto";
    updateCategoryOptions();
    if (recurrentAmountEl) recurrentAmountEl.value = "";
    if (recurrentDetailEl) recurrentDetailEl.value = "";
    if (recurrentAnchorDayEl) recurrentAnchorDayEl.value = String(Math.min(28, Math.max(1, new Date().getDate())));
    if (recurrentActiveEl) recurrentActiveEl.checked = true;
    if (btnRecurrentSaveEl) btnRecurrentSaveEl.textContent = "Guardar recurrente";
    if (btnRecurrentCancelEl) btnRecurrentCancelEl.hidden = true;
    setStatus("Crea plantillas mensuales que luego podrás registrar desde Cargar.");
  }

  function fillForm(item) {
    editingId = item.id;
    if (recurrentTypeEl) recurrentTypeEl.value = item.tipo;
    updateCategoryOptions();
    if (recurrentCategoryEl) recurrentCategoryEl.value = item.categoria;
    if (recurrentAmountEl) recurrentAmountEl.value = Number(item.monto || 0).toFixed(2);
    if (recurrentDetailEl) recurrentDetailEl.value = item.detalle || "";
    if (recurrentAnchorDayEl) recurrentAnchorDayEl.value = String(item.anchor_day || 1);
    if (recurrentActiveEl) recurrentActiveEl.checked = item.activo !== false;
    if (btnRecurrentSaveEl) btnRecurrentSaveEl.textContent = "Guardar cambios";
    if (btnRecurrentCancelEl) btnRecurrentCancelEl.hidden = false;
    setStatus(`Editando recurrente: ${item.categoria}.`);
  }

  function getPayloadFromForm() {
    const monto = parseDecimalInputValue(recurrentAmountEl?.value || 0);
    const anchorDay = Number(recurrentAnchorDayEl?.value || 0);
    if (!(monto > 0)) {
      setStatus("Ingresa un monto válido para el recurrente.", "error");
      showToast?.("Ingresa un monto válido");
      recurrentAmountEl?.focus();
      return null;
    }
    if (!(anchorDay >= 1 && anchorDay <= 28)) {
      setStatus("El día del mes debe estar entre 1 y 28.", "error");
      showToast?.("Elige un día entre 1 y 28");
      recurrentAnchorDayEl?.focus();
      return null;
    }
    return {
      tipo: recurrentTypeEl?.value || "Gasto",
      categoria: recurrentCategoryEl?.value || "",
      monto,
      detalle: recurrentDetailEl?.value?.trim() || "",
      anchor_day: anchorDay,
      activo: recurrentActiveEl?.checked !== false
    };
  }

  function renderList() {
    if (!recurrentListEl) return;
    const items = Array.isArray(getRecurrentes()) ? getRecurrentes() : [];
    if (items.length === 0) {
      recurrentListEl.innerHTML = '<li class="muted">Aún no tienes recurrentes creados.</li>';
      return;
    }

    recurrentListEl.innerHTML = items
      .map((item) => `
        <li class="budget-item recurrent-item">
          <div class="recurrent-item-head">
            <span>${CATEGORY_ICONS[item.categoria] || "•"} ${item.categoria}</span>
            <strong class="${item.tipo === "Ingreso" ? "saldo-pos" : "saldo-neg"}">${item.tipo} · ${Number(item.monto).toFixed(2)}</strong>
          </div>
          <small>Día ${item.anchor_day} · ${item.detalle || "Sin detalle"} · ${item.activo ? "Activo" : "Pausado"}</small>
          <div class="auth-actions recurrent-actions">
            <button type="button" class="btn-secondary" data-recurrent-action="toggle" data-id="${item.id}" data-next-active="${item.activo ? "0" : "1"}">${item.activo ? "Pausar" : "Activar"}</button>
            <button type="button" class="btn-tertiary" data-recurrent-action="edit" data-id="${item.id}">Editar</button>
            <button type="button" class="danger btn-tertiary" data-recurrent-action="delete" data-id="${item.id}">Eliminar</button>
          </div>
        </li>
      `)
      .join("");
  }

  async function handleSave() {
    const payload = getPayloadFromForm();
    if (!payload) return;
    setButtonLoadingState?.(btnRecurrentSaveEl, true, editingId ? "Guardando cambios..." : "Guardando...");
    setStatus(editingId ? "Guardando cambios..." : "Guardando recurrente...");
    showToast?.(editingId ? "Intentando actualizar recurrente..." : "Intentando guardar recurrente...");
    try {
      console.log("[GastosMG] save recurrent payload", payload, { editingId });
    } catch {
      // Ignore console issues.
    }
    try {
      const result = await saveRecurrent(payload, editingId);
      if (!result.ok) return;
      setRecurrentes(result.rows || []);
      renderList();
      refreshSuggestions();
      resetForm();
      setStatus(editingId ? "Recurrente actualizado." : "Recurrente guardado.", "ok");
    } catch (error) {
      const message = error?.message || "Error inesperado al guardar el recurrente.";
      setStatus(message, "error");
      showToast?.("No se pudo completar el guardado");
      try {
        console.error("[GastosMG] recurrent save failed", error);
      } catch {
        // Ignore console issues.
      }
    } finally {
      setButtonLoadingState?.(btnRecurrentSaveEl, false);
    }
  }

  function bindEvents() {
    recurrentTypeEl?.addEventListener("change", updateCategoryOptions);
    btnRecurrentSaveEl?.addEventListener("click", () => {
      handleSave();
    });
    btnRecurrentCancelEl?.addEventListener("click", () => {
      resetForm();
    });
    recurrentListEl?.addEventListener("click", async (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest("[data-recurrent-action][data-id]") : null;
      if (!button) return;
      const id = String(button.getAttribute("data-id") || "");
      const action = String(button.getAttribute("data-recurrent-action") || "");
      const current = (getRecurrentes() || []).find((item) => item.id === id);
      if (!current) return;

      if (action === "edit") {
        fillForm(current);
        return;
      }
      if (action === "toggle") {
        const nextActive = button.getAttribute("data-next-active") === "1";
        const result = await toggleRecurrent(id, nextActive);
        if (!result.ok) return;
        setRecurrentes(result.rows || []);
        renderList();
        refreshSuggestions();
        if (editingId === id) {
          const updated = (result.rows || []).find((item) => item.id === id);
          if (updated) fillForm(updated);
        }
        return;
      }
      if (action === "delete") {
        const confirmed = window.confirm("¿Eliminar este recurrente?");
        if (!confirmed) return;
        const result = await deleteRecurrent(id);
        if (!result.ok) return;
        setRecurrentes(result.rows || []);
        renderList();
        refreshSuggestions();
        if (editingId === id) resetForm();
      }
    });
  }

  return {
    bindEvents,
    renderList,
    resetForm,
    setStatus,
    updateAuthVisibility,
    updateCategoryOptions
  };
}
