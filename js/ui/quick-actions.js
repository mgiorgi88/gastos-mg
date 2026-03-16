export function createQuickActionsUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  QUICK_CATEGORY_DEFAULTS,
  quickButtons,
  quickCategorySelects,
  btnQuickConfigSave,
  quickConfigStatusEl,
  quickAmountEl,
  quickDetailEl,
  loadQuickCategoriesRaw,
  saveQuickCategories,
  getQuickCategories,
  setStatus,
  showToast,
  addTransaction,
  animatePrimarySave,
  flashSavedFeedback,
  money,
  parseDecimalInputValue,
  getTxData
}) {
  const quickDetailSuggestionsEl = document.getElementById("quick-detail-suggestions");
  const quickDetailSuggestionWrapEl = document.getElementById("quick-detail-suggestion-wrap");
  const quickDetailSuggestionListEl = document.getElementById("quick-detail-suggestion-list");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function getRecentQuickDetails() {
    if (typeof getTxData !== "function") return [];
    const rows = Array.isArray(getTxData()) ? getTxData() : [];
    const seen = new Set();
    const details = [];

    rows
      .filter((row) => row && row.tipo === "Gasto")
      .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
      .forEach((row) => {
        const detail = String(row.detalle || "").trim();
        const key = detail.toLocaleLowerCase();
        if (!detail || seen.has(key)) return;
        seen.add(key);
        details.push(detail);
      });

    return details.slice(0, 8);
  }

  function fillQuickDetail(detail) {
    if (!quickDetailEl) return;
    quickDetailEl.value = detail;
    quickDetailEl.dispatchEvent(new Event("input", { bubbles: true }));
    quickDetailEl.focus();
    const end = quickDetailEl.value.length;
    if (typeof quickDetailEl.setSelectionRange === "function") {
      quickDetailEl.setSelectionRange(end, end);
    }
  }

  function renderQuickDetailSuggestions() {
    if (!quickDetailSuggestionsEl || !quickDetailSuggestionWrapEl || !quickDetailSuggestionListEl) return;

    const suggestions = getRecentQuickDetails();
    const typed = String(quickDetailEl?.value || "").trim().toLocaleLowerCase();
    const visibleSuggestions = typed
      ? suggestions.filter((detail) => detail.toLocaleLowerCase().includes(typed) && detail.toLocaleLowerCase() !== typed)
      : suggestions;

    quickDetailSuggestionsEl.innerHTML = suggestions
      .map((detail) => `<option value="${escapeHtml(detail)}"></option>`)
      .join("");

    quickDetailSuggestionListEl.innerHTML = visibleSuggestions
      .slice(0, 5)
      .map(
        (detail) =>
          `<button type="button" class="quick-detail-chip" data-detail="${escapeHtml(detail)}">${escapeHtml(detail)}</button>`
      )
      .join("");

    quickDetailSuggestionWrapEl.hidden = visibleSuggestions.length === 0;
  }

  function sanitizeQuickCategories(value) {
    const valid = CATEGORIAS.Gasto;
    if (!Array.isArray(value)) return [...QUICK_CATEGORY_DEFAULTS];
    const filtered = value.filter((x) => valid.includes(x));
    const unique = [];
    filtered.forEach((x) => {
      if (!unique.includes(x)) unique.push(x);
    });
    QUICK_CATEGORY_DEFAULTS.forEach((x) => {
      if (!unique.includes(x) && valid.includes(x)) unique.push(x);
    });
    valid.forEach((x) => {
      if (!unique.includes(x)) unique.push(x);
    });
    return unique.slice(0, 4);
  }

  function loadQuickCategories() {
    return sanitizeQuickCategories(loadQuickCategoriesRaw());
  }

  function renderQuickButtons() {
    const quickCategories = getQuickCategories();
    quickButtons.forEach((btn, idx) => {
      if (!btn) return;
      const cat = quickCategories[idx] || QUICK_CATEGORY_DEFAULTS[idx] || "Supermercado";
      const icon = CATEGORY_ICONS[cat] || "\u2022";
      btn.dataset.category = cat;
      btn.innerHTML = `${icon} ${cat}`;
      btn.title = `Carga rapida: ${cat}`;
    });
  }

  function setQuickConfigStatus(message, tone = "neutral") {
    if (!quickConfigStatusEl) return;
    quickConfigStatusEl.textContent = message;
    quickConfigStatusEl.classList.remove("quick-config-status-error", "quick-config-status-ok");
    if (tone === "error") quickConfigStatusEl.classList.add("quick-config-status-error");
    if (tone === "ok") quickConfigStatusEl.classList.add("quick-config-status-ok");
  }

  function getQuickCategoriesFromUi() {
    return quickCategorySelects
      .map((x) => (x ? String(x.value || "") : ""))
      .filter(Boolean);
  }

  function refreshQuickConfigValidation() {
    const picked = getQuickCategoriesFromUi();
    const duplicated = new Set(picked).size !== picked.length;
    if (btnQuickConfigSave) btnQuickConfigSave.disabled = duplicated || picked.length !== 4;
    if (duplicated) {
      setQuickConfigStatus("No repitas categorias en botones rapidos.", "error");
      return;
    }
    setQuickConfigStatus("Configura 4 categorias distintas para los botones rapidos.", "neutral");
  }

  function syncQuickCategorySelectOptions() {
    const selected = quickCategorySelects.map((x) => (x ? String(x.value || "") : ""));
    quickCategorySelects.forEach((selectEl, idx) => {
      if (!selectEl) return;
      const current = selected[idx];
      const selectedByOthers = new Set(selected.filter((val, i) => i !== idx && val));
      const options = CATEGORIAS.Gasto
        .filter((cat) => cat === current || !selectedByOthers.has(cat))
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
      selectEl.innerHTML = options;
      if (current && CATEGORIAS.Gasto.includes(current)) {
        selectEl.value = current;
      } else if (selectEl.options.length > 0) {
        selectEl.selectedIndex = 0;
      }
    });
  }

  function setupQuickCategoryOptions() {
    const quickCategories = getQuickCategories();
    quickCategorySelects.forEach((selectEl, idx) => {
      if (!selectEl) return;
      selectEl.value = quickCategories[idx] || QUICK_CATEGORY_DEFAULTS[idx] || CATEGORIAS.Gasto[0];
    });
    syncQuickCategorySelectOptions();
    refreshQuickConfigValidation();
  }

  function saveQuickCategoriesFromUi() {
    const picked = getQuickCategoriesFromUi();
    if (picked.length !== 4) {
      setQuickConfigStatus("Debes elegir 4 categorias para botones rapidos.", "error");
      showToast("Faltan categorias");
      setStatus("Debes elegir 4 categorias para botones rapidos.");
      return;
    }
    if (new Set(picked).size !== 4) {
      setQuickConfigStatus("No repitas categorias en botones rapidos.", "error");
      showToast("No repitas categorias");
      setStatus("No repitas categorias en botones rapidos.");
      return;
    }
    saveQuickCategories(picked);
    setupQuickCategoryOptions();
    renderQuickButtons();
    setQuickConfigStatus("Botones rapidos guardados.", "ok");
    showToast("Botones rapidos actualizados");
    setStatus("Botones de carga rapida actualizados.");
  }

  function resetQuickCategories() {
    saveQuickCategories([...QUICK_CATEGORY_DEFAULTS]);
    setupQuickCategoryOptions();
    renderQuickButtons();
    setQuickConfigStatus("Botones rapidos restablecidos.", "ok");
    showToast("Botones rapidos restablecidos");
    setStatus("Botones de carga rapida restablecidos.");
  }

  async function quickAddExpense(category, sourceBtn = null) {
    const amount = parseDecimalInputValue(quickAmountEl.value);
    if (!(amount > 0)) {
      setStatus("Debes ingresar un importe valido para carga rapida.");
      if (quickAmountEl) quickAmountEl.focus();
      return;
    }

    const detail = quickDetailEl.value.trim();
    const today = new Date().toISOString().slice(0, 10);

    await addTransaction({
      id: crypto.randomUUID(),
      fecha: today,
      tipo: "Gasto",
      monto: amount,
      categoria: category,
      detalle: detail
    });
    quickAmountEl.value = "";
    quickDetailEl.value = "";
    quickAmountEl.dispatchEvent(new Event("input", { bubbles: true }));
    renderQuickDetailSuggestions();
    animatePrimarySave(sourceBtn);
    flashSavedFeedback("Guardado");
    setStatus(`Carga rapida guardada: ${category} ${money(amount)}.`);
    showToast(`Guardado: ${category}`);
  }

  if (quickDetailEl) {
    quickDetailEl.addEventListener("input", renderQuickDetailSuggestions);
  }

  if (quickDetailSuggestionListEl) {
    quickDetailSuggestionListEl.addEventListener("click", (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest(".quick-detail-chip") : null;
      if (!button) return;
      const detail = button.dataset.detail || button.textContent || "";
      fillQuickDetail(String(detail).trim());
    });
  }

  return {
    loadQuickCategories,
    quickAddExpense,
    renderQuickDetailSuggestions,
    refreshQuickConfigValidation,
    renderQuickButtons,
    resetQuickCategories,
    saveQuickCategoriesFromUi,
    setQuickConfigStatus,
    setupQuickCategoryOptions,
    syncQuickCategorySelectOptions
  };
}
