export function createFormUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  form,
  cargarMonthSummaryBtnEl,
  cargarSummaryMonthLabelEl,
  cargarSummaryIngresosEl,
  cargarSummaryGastosEl,
  cargarSummaryBalanceEl,
  cargarSummaryBalanceCardEl,
  fechaEl,
  montoEl,
  detalleEl,
  tipoEl,
  categoriaEl,
  budgetCategoryEl,
  yoyCategoryEl,
  arsConvertBoxEl,
  arsAmountEl,
  arsRateEl,
  spreadPctEl,
  arsResultEl,
  btnSubmitTx,
  btnCancelEdit,
  txFormModeEl,
  getTxData,
  getSelectedCurrency,
  getArsRate,
  setArsRate,
  saveArsRate,
  saveSpreadPct,
  parseDecimalInputValue,
  setStatus,
  money,
  onEditingChange,
  setActiveTab,
  monthLabel,
  CURRENT_MONTH
}) {
  function updateLoadMonthlySummaryUI(summary) {
    if (!cargarSummaryIngresosEl || !cargarSummaryGastosEl || !cargarSummaryBalanceEl) return;
    const { ingresos = 0, gastos = 0, balanceValue = 0 } = summary || {};
    if (cargarSummaryMonthLabelEl) cargarSummaryMonthLabelEl.textContent = monthLabel(CURRENT_MONTH);
    cargarSummaryIngresosEl.textContent = money(ingresos);
    cargarSummaryGastosEl.textContent = money(gastos);
    cargarSummaryBalanceEl.textContent = money(balanceValue);
    if (cargarSummaryBalanceCardEl) {
      cargarSummaryBalanceCardEl.classList.remove("is-positive", "is-negative", "is-neutral");
      cargarSummaryBalanceCardEl.classList.add(balanceValue > 0 ? "is-positive" : balanceValue < 0 ? "is-negative" : "is-neutral");
    }
  }

  function bindLoadSummaryCard() {
    cargarMonthSummaryBtnEl?.addEventListener("click", () => {
      if (typeof setActiveTab === "function") setActiveTab("resumen");
    });
  }

  function updateCategoryOptions(tipo, selected = "") {
    const categorias = CATEGORIAS[tipo] || [];
    categoriaEl.innerHTML = categorias
      .map((categoria) => `<option value="${categoria}">${CATEGORY_ICONS[categoria] || "\u2022"} ${categoria}</option>`)
      .join("");
    categoriaEl.value = categorias.includes(selected) ? selected : (categorias[0] || "");
  }

  function setupBudgetCategoryOptions() {
    if (!budgetCategoryEl) return;
    budgetCategoryEl.innerHTML = CATEGORIAS.Gasto
      .map((c) => `<option value="${c}">${CATEGORY_ICONS[c] || "\u2022"} ${c}</option>`)
      .join("");
  }

  function setupYoyCategoryOptions() {
    if (!yoyCategoryEl) return;
    const previous = yoyCategoryEl.value;
    yoyCategoryEl.innerHTML = [
      '<option value="__ALL__">Todas las categorias</option>',
      ...CATEGORIAS.Gasto.map((c) => `<option value="${c}">${CATEGORY_ICONS[c] || "\u2022"} ${c}</option>`)
    ].join("");
    if (previous === "__ALL__" || (previous && CATEGORIAS.Gasto.includes(previous))) {
      yoyCategoryEl.value = previous;
    } else {
      yoyCategoryEl.value = "__ALL__";
    }
  }

  function setEditingState(tx = null, mode = "new") {
    const isEdit = mode === "edit" && tx;
    const isRepeat = mode === "repeat";
    onEditingChange(isEdit ? String(tx.id) : null);
    if (btnSubmitTx) btnSubmitTx.textContent = isEdit ? "Guardar cambios" : isRepeat ? "Guardar copia" : "Guardar";
    if (btnCancelEdit) btnCancelEdit.hidden = !(isEdit || isRepeat);
    if (txFormModeEl) {
      txFormModeEl.hidden = !(isEdit || isRepeat);
      txFormModeEl.textContent = isEdit ? "Editando movimiento" : "Nueva carga basada en un movimiento anterior";
    }
  }

  function focusTransactionForm() {
    if (typeof setActiveTab === "function") setActiveTab("cargar");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      if (detalleEl && detalleEl.value) {
        detalleEl.focus();
        const end = detalleEl.value.length;
        if (typeof detalleEl.setSelectionRange === "function") detalleEl.setSelectionRange(end, end);
        return;
      }
      if (montoEl) {
        montoEl.focus();
        if (typeof montoEl.select === "function") montoEl.select();
      }
    });
  }

  function updateArsResultPreview() {
    if (!arsResultEl || !arsAmountEl || !arsRateEl) return;
    const ars = parseDecimalInputValue(arsAmountEl.value || 0);
    const rate = parseDecimalInputValue(arsRateEl.value || 0);
    if (!(ars > 0) || !(rate > 0)) {
      arsResultEl.value = "";
      return;
    }
    const converted = getSelectedCurrency() === "ARS" ? ars : ars / rate;
    arsResultEl.value = money(converted);
  }

  async function fetchArsRateForSelectedCurrency() {
    if (!arsRateEl) return;

    if (getSelectedCurrency() === "ARS") {
      arsRateEl.value = "1";
      saveArsRate(1);
      updateArsResultPreview();
      return;
    }

    try {
      const resp = await fetch("https://open.er-api.com/v6/latest/ARS", { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const perArs = Number(data?.rates?.[getSelectedCurrency()] || 0);
      if (!(perArs > 0)) throw new Error("sin cotizacion");
      const arsPerUnit = 1 / perArs;
      saveArsRate(arsPerUnit);
      arsRateEl.value = arsPerUnit.toFixed(4);
      updateArsResultPreview();
    } catch {
      if (getArsRate() > 0) {
        arsRateEl.value = Number(getArsRate()).toFixed(4);
        updateArsResultPreview();
        setStatus("No se pudo actualizar la cotizacion online. Se usa la ultima guardada.");
      } else {
        setStatus("No se pudo obtener tipo de cambio online.");
      }
    }
  }

  function updateArsConvertVisibility() {
    if (!arsConvertBoxEl) return;
    const show =
      tipoEl.value === "Ingreso" &&
      categoriaEl.value === "Alquiler Depto Argentina" &&
      getSelectedCurrency() === "USD";
    arsConvertBoxEl.hidden = !show;
    arsConvertBoxEl.style.display = show ? "grid" : "none";
    if (!show) {
      if (arsAmountEl) arsAmountEl.value = "";
      if (arsResultEl) arsResultEl.value = "";
    }
    if (show) {
      fetchArsRateForSelectedCurrency();
      updateArsResultPreview();
    }
  }

  function convertArsToSelectedCurrency() {
    const ars = parseDecimalInputValue(arsAmountEl?.value || 0);
    const rate = parseDecimalInputValue(arsRateEl?.value || getArsRate() || 0);
    const spread = parseDecimalInputValue(spreadPctEl?.value || 0);
    if (!(ars > 0) || !(rate > 0)) {
      setStatus("No se pudo convertir: falta ARS o tipo de cambio.");
      return null;
    }
    saveArsRate(rate);
    if (spread >= 0) saveSpreadPct(spread);
    if (getSelectedCurrency() === "ARS") return ars;
    const gross = ars / rate;
    const net = gross * (1 - (spread / 100));
    return net > 0 ? net : 0;
  }

  function startEditTransaction(id) {
    const tx = getTxData().find((x) => String(x.id) === String(id));
    if (!tx) {
      setStatus("No se encontro el movimiento para editar.");
      return;
    }

    if (fechaEl) fechaEl.value = String(tx.fecha).slice(0, 10);
    tipoEl.value = tx.tipo === "Ingreso" ? "Ingreso" : "Gasto";
    updateCategoryOptions(tipoEl.value, tx.categoria);
    if (montoEl) montoEl.value = Number(tx.monto).toFixed(2);
    if (detalleEl) detalleEl.value = tx.detalle || "";
    updateArsConvertVisibility();
    setEditingState(tx, "edit");
    focusTransactionForm();
    setStatus(`Editando: ${tx.categoria} del ${tx.fecha}.`);
  }

  function startDuplicateDraftTransaction(id) {
    const tx = getTxData().find((x) => String(x.id) === String(id));
    if (!tx) {
      setStatus("No se encontro el movimiento para reutilizar.");
      return;
    }

    if (fechaEl) fechaEl.valueAsDate = new Date();
    tipoEl.value = tx.tipo === "Ingreso" ? "Ingreso" : "Gasto";
    updateCategoryOptions(tipoEl.value, tx.categoria);
    if (montoEl) montoEl.value = Number(tx.monto).toFixed(2);
    if (detalleEl) detalleEl.value = tx.detalle || "";
    updateArsConvertVisibility();
    setEditingState(null, "repeat");
    focusTransactionForm();
    setStatus(`Carga preparada con base en ${tx.categoria}. Ajustala y guarda cuando quieras.`);
  }

  function startPrefilledTransactionDraft(tx, options = {}) {
    const {
      focusField = "detail",
      modeLabel = "Nueva carga sugerida",
      statusMessage = "Revisa los datos y guarda cuando quieras."
    } = options;

    if (fechaEl) fechaEl.valueAsDate = new Date();
    tipoEl.value = tx.tipo === "Ingreso" ? "Ingreso" : "Gasto";
    updateCategoryOptions(tipoEl.value, tx.categoria);
    if (montoEl) montoEl.value = Number(tx.monto || 0).toFixed(2);
    if (detalleEl) detalleEl.value = tx.detalle || "";
    updateArsConvertVisibility();
    setEditingState(null, "repeat");
    if (txFormModeEl) txFormModeEl.textContent = modeLabel;
    if (typeof setActiveTab === "function") setActiveTab("cargar");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      if (focusField === "amount" && montoEl) {
        montoEl.focus();
        if (typeof montoEl.select === "function") montoEl.select();
        return;
      }
      if (detalleEl) {
        detalleEl.focus();
        const end = detalleEl.value.length;
        if (typeof detalleEl.setSelectionRange === "function") detalleEl.setSelectionRange(end, end);
      }
    });
    setStatus(statusMessage);
  }

  function resetTransactionForm() {
    form.reset();
    if (fechaEl) fechaEl.valueAsDate = new Date();
    tipoEl.value = "Gasto";
    updateCategoryOptions("Gasto");
    updateArsConvertVisibility();
    setEditingState(null, "new");
  }

  function animatePrimarySave(target = btnSubmitTx) {
    if (!target) return;
    target.classList.remove("saving");
    void target.offsetWidth;
    target.classList.add("saving");
    setTimeout(() => target.classList.remove("saving"), 260);
  }

  function flashSavedFeedback(label = "Guardado", target = btnSubmitTx) {
    if (!target) return;
    const originalText = target.dataset.originalText || target.textContent || "";
    target.dataset.originalText = originalText;
    target.textContent = label;
    setTimeout(() => {
      target.textContent = target.dataset.originalText || originalText;
    }, 1100);
  }

  bindLoadSummaryCard();

  return {
    animatePrimarySave,
    convertArsToSelectedCurrency,
    fetchArsRateForSelectedCurrency,
    flashSavedFeedback,
    resetTransactionForm,
    setEditingState,
    setupBudgetCategoryOptions,
    setupYoyCategoryOptions,
    startPrefilledTransactionDraft,
    startDuplicateDraftTransaction,
    startEditTransaction,
    updateLoadMonthlySummaryUI,
    updateArsConvertVisibility,
    updateArsResultPreview,
    updateCategoryOptions
  };
}
