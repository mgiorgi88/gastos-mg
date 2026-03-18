function formatScheduleSummary(item) {
  const frequencyLabels = {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    yearly: "Anual"
  };

  const parts = [
    frequencyLabels[item.frecuencia] || "Mensual",
    `desde ${item.start_date || "-"}`,
    item.end_date ? `hasta ${item.end_date}` : null,
    item.repeat_count ? `${item.repeat_count} rep.` : null,
    item.auto_generate !== false ? "Auto" : "Manual",
    item.activo ? "Activo" : "Pausado"
  ].filter(Boolean);

  return parts.join(" · ");
}

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
  recurrentFrequencyEl,
  recurrentStartDateEl,
  recurrentEndDateEl,
  recurrentRepeatCountEl,
  recurrentActiveEl,
  recurrentAutoGenerateEl,
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
  removeGeneratedTransactionsForSchedule,
  refreshSuggestions
}) {
  let editingId = null;

  function bindNativeDatePicker(inputEl) {
    if (!(inputEl instanceof HTMLInputElement) || inputEl.type !== "date") return;
    const openPicker = () => {
      if (typeof inputEl.showPicker === "function") {
        try {
          inputEl.showPicker();
          return;
        } catch {
          // Fall back to focus below.
        }
      }
      inputEl.focus();
    };

    inputEl.addEventListener("click", openPicker);
    inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    });
  }

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
    if (recurrentManagerEl) recurrentManagerEl.hidden = !logged || !enabled;
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
    const today = new Date().toISOString().slice(0, 10);
    if (recurrentTypeEl) recurrentTypeEl.value = "Gasto";
    updateCategoryOptions();
    if (recurrentAmountEl) recurrentAmountEl.value = "";
    if (recurrentDetailEl) recurrentDetailEl.value = "";
    if (recurrentFrequencyEl) recurrentFrequencyEl.value = "monthly";
    if (recurrentStartDateEl) recurrentStartDateEl.value = today;
    if (recurrentEndDateEl) recurrentEndDateEl.value = "";
    if (recurrentRepeatCountEl) recurrentRepeatCountEl.value = "";
    if (recurrentActiveEl) recurrentActiveEl.checked = true;
    if (recurrentAutoGenerateEl) recurrentAutoGenerateEl.checked = true;
    if (btnRecurrentSaveEl) btnRecurrentSaveEl.textContent = "Guardar movimiento programado";
    if (btnRecurrentCancelEl) btnRecurrentCancelEl.hidden = true;
    setStatus("Programa un gasto o ingreso con frecuencia, fecha de inicio y opcionalmente fin o cantidad de repeticiones.");
  }

  function fillForm(item) {
    editingId = item.id;
    if (recurrentTypeEl) recurrentTypeEl.value = item.tipo;
    updateCategoryOptions();
    if (recurrentCategoryEl) recurrentCategoryEl.value = item.categoria;
    if (recurrentAmountEl) recurrentAmountEl.value = Number(item.monto || 0).toFixed(2);
    if (recurrentDetailEl) recurrentDetailEl.value = item.detalle || "";
    if (recurrentFrequencyEl) recurrentFrequencyEl.value = item.frecuencia || "monthly";
    if (recurrentStartDateEl) recurrentStartDateEl.value = item.start_date || "";
    if (recurrentEndDateEl) recurrentEndDateEl.value = item.end_date || "";
    if (recurrentRepeatCountEl) recurrentRepeatCountEl.value = item.repeat_count ? String(item.repeat_count) : "";
    if (recurrentActiveEl) recurrentActiveEl.checked = item.activo !== false;
    if (recurrentAutoGenerateEl) recurrentAutoGenerateEl.checked = item.auto_generate !== false;
    if (btnRecurrentSaveEl) btnRecurrentSaveEl.textContent = "Guardar cambios";
    if (btnRecurrentCancelEl) btnRecurrentCancelEl.hidden = false;
    setStatus(`Editando movimiento programado: ${item.categoria}.`);
  }

  function getPayloadFromForm() {
    const monto = parseDecimalInputValue(recurrentAmountEl?.value || 0);
    const startDate = String(recurrentStartDateEl?.value || "").trim();
    const endDate = String(recurrentEndDateEl?.value || "").trim();
    const repeatCountRaw = String(recurrentRepeatCountEl?.value || "").trim();
    const repeatCount = repeatCountRaw ? Number(repeatCountRaw) : null;

    if (!(monto > 0)) {
      setStatus("Ingresa un monto válido para el movimiento programado.", "error");
      showToast?.("Ingresa un monto válido");
      recurrentAmountEl?.focus();
      return null;
    }
    if (!startDate) {
      setStatus("Elige una fecha de inicio para el movimiento programado.", "error");
      showToast?.("Elige una fecha de inicio");
      recurrentStartDateEl?.focus();
      return null;
    }
    if (endDate && endDate < startDate) {
      setStatus("La fecha fin no puede ser anterior al inicio.", "error");
      showToast?.("Revisa la fecha fin");
      recurrentEndDateEl?.focus();
      return null;
    }
    if (repeatCountRaw && (!Number.isInteger(repeatCount) || repeatCount <= 0)) {
      setStatus("La cantidad de repeticiones debe ser un número entero mayor que 0.", "error");
      showToast?.("Revisa la cantidad de repeticiones");
      recurrentRepeatCountEl?.focus();
      return null;
    }

    return {
      tipo: recurrentTypeEl?.value || "Gasto",
      categoria: recurrentCategoryEl?.value || "",
      monto,
      detalle: recurrentDetailEl?.value?.trim() || "",
      frecuencia: recurrentFrequencyEl?.value || "monthly",
      start_date: startDate,
      end_date: endDate || null,
      repeat_count: repeatCount,
      activo: recurrentActiveEl?.checked !== false,
      auto_generate: recurrentAutoGenerateEl?.checked !== false
    };
  }

  function renderList() {
    if (!recurrentListEl) return;
    const items = Array.isArray(getRecurrentes()) ? getRecurrentes() : [];
    if (items.length === 0) {
      recurrentListEl.innerHTML = '<li class="muted">Aún no tienes movimientos programados creados.</li>';
      return;
    }

    recurrentListEl.innerHTML = items
      .map((item) => `
        <li class="budget-item recurrent-item">
          <div class="recurrent-item-head">
            <span>${CATEGORY_ICONS[item.categoria] || "•"} ${item.categoria}</span>
            <strong class="${item.tipo === "Ingreso" ? "saldo-pos" : "saldo-neg"}">${item.tipo} · ${Number(item.monto).toFixed(2)}</strong>
          </div>
          <small>${formatScheduleSummary(item)}${item.detalle ? ` · ${item.detalle}` : ""}</small>
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
    const wasEditing = Boolean(editingId);
    const previousItem = wasEditing ? (getRecurrentes() || []).find((item) => item.id === editingId) || null : null;
    setButtonLoadingState?.(btnRecurrentSaveEl, true, wasEditing ? "Guardando cambios..." : "Guardando...");
    setStatus(wasEditing ? "Guardando cambios..." : "Guardando movimiento programado...");
    try {
      const result = await saveRecurrent(payload, editingId);
      if (!result.ok) return;
      setRecurrentes(result.rows || []);
      if (previousItem?.auto_generate !== false) {
        await removeGeneratedTransactionsForSchedule?.(previousItem);
      }
      await refreshSuggestions?.();
      renderList();
      resetForm();
      setStatus(wasEditing ? "Movimiento programado actualizado." : "Movimiento programado guardado.", "ok");
    } catch (error) {
      const message = error?.message || "Error inesperado al guardar el movimiento programado.";
      setStatus(message, "error");
      showToast?.("No se pudo completar el guardado");
    } finally {
      setButtonLoadingState?.(btnRecurrentSaveEl, false);
    }
  }

  function bindEvents() {
    recurrentTypeEl?.addEventListener("change", updateCategoryOptions);
    bindNativeDatePicker(recurrentStartDateEl);
    bindNativeDatePicker(recurrentEndDateEl);
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
        refreshSuggestions?.();
        if (editingId === id) {
          const updated = (result.rows || []).find((item) => item.id === id);
          if (updated) fillForm(updated);
        }
        return;
      }
      if (action === "delete") {
        const confirmed = window.confirm("¿Eliminar este movimiento programado y quitar los movimientos futuros que generó?");
        if (!confirmed) return;
        const removedCount = await removeGeneratedTransactionsForSchedule?.(current);
        const result = await deleteRecurrent(id);
        if (!result.ok) return;
        setRecurrentes(result.rows || []);
        renderList();
        refreshSuggestions?.();
        if (removedCount > 0) {
          showToast?.(removedCount === 1 ? "Se quitó 1 movimiento futuro generado" : `Se quitaron ${removedCount} movimientos futuros generados`);
        }
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
