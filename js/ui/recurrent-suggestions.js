export function createRecurrentSuggestionsUi({
  recurrentSuggestionsCardEl,
  recurrentSuggestionsTitleEl,
  btnRecurrentToggleEl,
  recurrentSuggestionsListEl,
  getCurrentUser,
  getRecurrentes,
  getTxData,
  getOmittedIds,
  omitForMonth,
  currentMonthKey,
  money,
  startPrefilledTransactionDraft,
  showToast
}) {
  let expanded = false;

  function buildSuggestions(now = new Date()) {
    if (!getCurrentUser()) return [];
    const monthKey = currentMonthKey(now);
    const day = now.getDate();
    const omittedIds = new Set(getOmittedIds(monthKey));
    const txRows = Array.isArray(getTxData()) ? getTxData() : [];
    const recurrentes = Array.isArray(getRecurrentes()) ? getRecurrentes() : [];

    return recurrentes
      .filter((item) => item.activo !== false)
      .filter((item) => Number(item.anchor_day || 0) <= day)
      .filter((item) => !omittedIds.has(String(item.id)))
      .filter((item) => {
        const sameMonthRows = txRows.filter((row) => String(row.fecha || "").slice(0, 7) === monthKey);
        return !sameMonthRows.some((row) => {
          if (row.tipo !== item.tipo || row.categoria !== item.categoria) return false;
          if (String(item.detalle || "").trim()) {
            return String(row.detalle || "").trim() === String(item.detalle || "").trim();
          }
          return Number(row.monto || 0) === Number(item.monto || 0);
        });
      })
      .sort((a, b) => {
        const dayDiff = Number(a.anchor_day || 0) - Number(b.anchor_day || 0);
        if (dayDiff !== 0) return dayDiff;
        return String(a.categoria || "").localeCompare(String(b.categoria || ""));
      });
  }

  function registerSuggestion(item) {
    startPrefilledTransactionDraft(
      {
        tipo: item.tipo,
        categoria: item.categoria,
        monto: item.monto,
        detalle: item.detalle || ""
      },
      {
        modeLabel: "Sugerencia recurrente lista para registrar",
        statusMessage: `Sugerencia preparada: ${item.categoria}. Ajustala y guarda cuando quieras.`
      }
    );
  }

  function renderSuggestions() {
    if (!recurrentSuggestionsCardEl || !recurrentSuggestionsTitleEl || !recurrentSuggestionsListEl || !btnRecurrentToggleEl) return;
    const suggestions = buildSuggestions();
    recurrentSuggestionsCardEl.hidden = suggestions.length === 0;
    if (suggestions.length === 0) {
      recurrentSuggestionsListEl.hidden = true;
      expanded = false;
      btnRecurrentToggleEl.textContent = "Ver sugerencias";
      return;
    }

    recurrentSuggestionsTitleEl.textContent = `Tenés ${suggestions.length} recurrente${suggestions.length === 1 ? "" : "s"} para registrar este mes`;
    recurrentSuggestionsListEl.hidden = !expanded;
    btnRecurrentToggleEl.textContent = expanded ? "Ocultar sugerencias" : "Ver sugerencias";

    recurrentSuggestionsListEl.innerHTML = suggestions
      .map((item) => `
        <article class="recurrent-suggestion-item">
          <div>
            <strong>${item.categoria}</strong>
            <p>${item.tipo} · ${money(Number(item.monto || 0))} · día ${item.anchor_day}${item.detalle ? ` · ${item.detalle}` : ""}</p>
          </div>
          <div class="auth-actions recurrent-actions">
            <button type="button" class="btn-primary" data-suggestion-action="register" data-id="${item.id}">Registrar</button>
            <button type="button" class="btn-tertiary" data-suggestion-action="omit" data-id="${item.id}">Omitir este mes</button>
          </div>
        </article>
      `)
      .join("");
  }

  function bindEvents() {
    btnRecurrentToggleEl?.addEventListener("click", () => {
      expanded = !expanded;
      renderSuggestions();
    });

    recurrentSuggestionsListEl?.addEventListener("click", (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest("[data-suggestion-action][data-id]") : null;
      if (!button) return;
      const id = String(button.getAttribute("data-id") || "");
      const action = String(button.getAttribute("data-suggestion-action") || "");
      const item = buildSuggestions().find((entry) => entry.id === id);
      if (!item) return;

      if (action === "register") {
        registerSuggestion(item);
        return;
      }

      if (action === "omit") {
        omitForMonth(id);
        showToast("Recurrente omitido este mes");
        renderSuggestions();
      }
    });
  }

  return {
    bindEvents,
    renderSuggestions
  };
}
