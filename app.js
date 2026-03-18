import {
  ACTIVE_TAB_KEY,
  BOOTSTRAP_KEY,
  CATEGORY_ICONS,
  CATEGORIAS,
  CURRENT_MONTH,
  KEY,
  MIGRATION_KEY,
  QUICK_CATEGORY_DEFAULTS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} from "./js/config/constants.js";
import {
  accountMiniEl,
  accountMiniEmailEl,
  analysisPanelEl,
  arsAmountEl,
  arsConvertBoxEl,
  arsRateEl,
  arsResultEl,
  authCardEl,
  authStatusEl,
  balanceEl,
  balanceCardEl,
  balanceSparklineEl,
  balanceTrendEl,
  budgetAmountEl,
  budgetCategoryEl,
  budgetListEl,
  budgetSummaryListEl,
  optionsRecurrentCardEl,
  btnRecurrentCancelEl,
  btnRecurrentSaveEl,
  btnBudgetSave,
  btnCancelEdit,
  btnClearMyData,
  btnConvertArs,
  btnDetailClear,
  btnDownloadTemplate,
  btnEmptyGoCargarEl,
  btnEmptyStartEl,
  btnExportExcel,
  btnGateSignin,
  btnGateSignup,
  btnImportFile,
  btnLogin,
  btnLogout,
  btnLogoutMini,
  btnQuickComp,
  btnQuickConfigReset,
  btnQuickConfigSave,
  btnQuickGas,
  btnQuickSal,
  btnQuickSuper,
  btnRecurrentToggleEl,
  btnRecover,
  btnRefreshRate,
  btnSavingsGoalClear,
  btnSavingsGoalSave,
  btnSignup,
  btnSubmitTx,
  btnSyncRetryEl,
  calGridEl,
  calNextEl,
  calPrevEl,
  calTitleEl,
  cargarEmptyStateEl,
  categoriaEl,
  chartCategoryEl,
  chartCategoryInsightEl,
  chartCategoryLegendEl,
  chartMonthlyEl,
  chartMonthlyInsightEl,
  chartMonthlyLegendEl,
  clearMyDataStatusEl,
  cloudIndicatorEl,
  heroSessionIndicatorEl,
  cmpBalanceEl,
  cmpGastosEl,
  cmpIngresosEl,
  cmpSummaryEl,
  cmpTitleEl,
  currentMonthLabelEl,
  currencyEl,
  dayTitleEl,
  detalleEl,
  detailAvgEl,
  detailCategoryEl,
  detailCountEl,
  detailFromEl,
  detailSearchEl,
  detailToEl,
  detailTotalEl,
  detailTypeEl,
  emailEl,
  emailHintEl,
  entryGateEl,
  fechaEl,
  filtroMes,
  form,
  gastosEl,
  importFileEl,
  importStatusEl,
  ingresosEl,
  lista,
  montoEl,
  movimientosSectionEl,
  passwordEl,
  passwordHintEl,
  quickAmountEl,
  quickButtons,
  quickCat1El,
  quickCat2El,
  quickCat3El,
  quickCat4El,
  quickCategorySelects,
  quickConfigStatusEl,
  quickDetailEl,
  recurrentActiveEl,
  recurrentAmountEl,
  recurrentAutoGenerateEl,
  recurrentAuthHintEl,
  recurrentCategoryEl,
  recurrentDetailEl,
  recurrentEndDateEl,
  recurrentFrequencyEl,
  recurrentListEl,
  recurrentManagerEl,
  recurrentRepeatCountEl,
  recurrentStartDateEl,
  recurrentStatusEl,
  recurrentSuggestionsCardEl,
  recurrentSuggestionsListEl,
  recurrentSuggestionsTitleEl,
  recurrentTypeEl,
  rememberEl,
  resumenContentCards,
  resumenEmptyCardEl,
  savingsGoalAmountEl,
  savingsGoalStatusEl,
  savingsGoalSummaryEl,
  spendingAlertEl,
  spreadPctEl,
  syncBadgeEl,
  syncHelpEl,
  syncIndicatorEl,
  syncCardEl,
  tabBtns,
  tabPanels,
  themeEl,
  tipoEl,
  toastEl,
  topExpensesListEl,
  topExpensesNoteEl,
  trend3mEl,
  txFormModeEl,
  vacio,
  yoyBalanceEl,
  yoyCategoryEl,
  yoyGastosEl,
  yoyIngresosEl,
  yoyMiniChartEl,
  yoyMiniLegendEl,
  yoyPeriodAEl,
  yoyPeriodBEl,
  yoySummaryEl,
  yoyTitleEl
} from "./js/core/dom.js";
import {
  clearRecurrentesCache,
  clearSessionStorage,
  loadArsRate,
  loadBudgets,
  loadCurrency,
  loadQuickCategoriesRaw,
  loadRecurrentOmissions,
  loadRecurrentesCache,
  loadRememberMe,
  loadSavingsGoal,
  loadSessionData,
  loadSpreadPct,
  loadTheme,
  loadTx,
  readJsonStorage,
  readNumericStorage,
  saveArsRateValue,
  saveBudgetsValue,
  saveCurrencyValue,
  saveQuickCategoriesValue,
  saveRecurrentesCache,
  saveRecurrentOmissions,
  saveRememberMe,
  saveSavingsGoalValue,
  saveSessionWithMode,
  saveSpreadPctValue,
  saveThemeValue,
  saveTx,
  writeJsonStorage
} from "./js/services/storage.js";
import {
  hideSyncBadgeState,
  setButtonLoadingState,
  setStatusMessage,
  showSyncBadgeState,
  showToastMessage
} from "./js/ui/status.js";
import { createSupabaseService } from "./js/services/supabase.js";
import { createAuthService } from "./js/services/auth.js";
import { createTransactionsService } from "./js/services/transactions.js";
import { createImportExportService } from "./js/services/import-export.js";
import { createRecurrentesService } from "./js/services/recurrentes.js";
import { createFormUi } from "./js/ui/form-ui.js";
import { createAuthUi } from "./js/ui/auth-ui.js";
import { createQuickActionsUi } from "./js/ui/quick-actions.js";
import { createCalendarUi } from "./js/ui/calendar.js";
import { createChartsUi } from "./js/ui/charts.js";
import { createSummaryUi } from "./js/ui/summary.js";
import { createRecurrentesUi } from "./js/ui/recurrentes.js";
import { createRecurrentSuggestionsUi } from "./js/ui/recurrent-suggestions.js";
import { createRefreshController } from "./js/app/refresh.js";
import { bindAppEvents } from "./js/app/events.js";
import {
  buildMonthOptions,
  formatDateLabel,
  formatMonthTitle,
  getMonth,
  monthLabel,
  toDateKeyLocal
} from "./js/utils/date.js";
import { escapeHtml, formatMoney } from "./js/utils/formatters.js";
import { parseDecimalExpression } from "./js/utils/number-input.js";
import { buildInitialQuickCategories, createAppState } from "./js/core/state.js";

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} fecha ISO date (YYYY-MM-DD)
 * @property {"Ingreso"|"Gasto"} tipo
 * @property {string} categoria
 * @property {number} monto
 * @property {string} [detalle]
 */

const sessionData = loadSessionData();
const quickAmountPlusBtn = document.getElementById("quick-amount-plus");
const montoPlusBtn = document.getElementById("monto-plus");
const quickAmountTotalEl = document.getElementById("quick-amount-total");
const montoTotalEl = document.getElementById("monto-total");
const state = createAppState({
  currentUser: null,
  txData: [],
  hasUserChosenMonth: false,
  sessionPersistMode: sessionData.persistMode,
  authSession: sessionData.session,
  selectedCurrency: loadCurrency(),
  budgets: loadBudgets(),
  arsRate: loadArsRate(),
  spreadPct: loadSpreadPct(),
  selectedTheme: loadTheme(),
  editingTxId: null,
  calendarMonthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDayKey: null,
  showAllFilteredRows: false,
  topExpenseTempFilterActive: false,
  currentDetailRows: [],
  toastTimer: null,
  syncOpsInFlight: 0,
  hadRecentSyncError: false,
  syncPending: false,
  lastSuccessfulSyncAt: null,
  recurrentes: loadRecurrentesCache(),
  recurrentesAvailable: true,
  quickCategories: buildInitialQuickCategories(
    CATEGORIAS.Gasto,
    QUICK_CATEGORY_DEFAULTS,
    loadQuickCategoriesRaw()
  ),
  savingsGoal: loadSavingsGoal(),
  syncBadgeTimer: null,
  authActionInFlight: false,
  appReady: false,
  syncUiReady: false,
  initialDataReady: false,
  panelAnimationsReady: false,
  scheduledGenerationInFlight: false
});

if (fechaEl) fechaEl.valueAsDate = new Date();

function insertTextAtCursor(inputEl, text) {
  if (!(inputEl instanceof HTMLInputElement)) return;
  const currentValue = String(inputEl.value || "");
  const selectionStart = inputEl.selectionStart ?? currentValue.length;
  const selectionEnd = inputEl.selectionEnd ?? currentValue.length;
  inputEl.value = `${currentValue.slice(0, selectionStart)}${text}${currentValue.slice(selectionEnd)}`;
  const nextCursor = selectionStart + text.length;
  inputEl.setSelectionRange(nextCursor, nextCursor);
  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  inputEl.focus();
}

function bindAmountPlusButton(buttonEl, inputEl) {
  if (!(buttonEl instanceof HTMLButtonElement) || !(inputEl instanceof HTMLInputElement)) return;
  let handledByTouch = false;

  buttonEl.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  buttonEl.addEventListener("touchend", (event) => {
    event.preventDefault();
    handledByTouch = true;
    insertTextAtCursor(inputEl, "+");
  }, { passive: false });
  buttonEl.addEventListener("click", (event) => {
    event.preventDefault();
    if (handledByTouch) {
      handledByTouch = false;
      return;
    }
    insertTextAtCursor(inputEl, "+");
  });
}

bindAmountPlusButton(quickAmountPlusBtn, quickAmountEl);
bindAmountPlusButton(montoPlusBtn, montoEl);

function updateAmountPreview(inputEl, outputEl) {
  if (!(inputEl instanceof HTMLInputElement) || !(outputEl instanceof HTMLElement)) return;
  const rawValue = String(inputEl.value || "").trim();

  if (!rawValue) {
    outputEl.hidden = true;
    outputEl.textContent = "";
    outputEl.classList.remove("is-error");
    return;
  }

  const parsedValue = parseDecimalExpression(rawValue);
  outputEl.hidden = false;

  if (Number.isFinite(parsedValue)) {
    outputEl.textContent = `Total: ${money(parsedValue)}`;
    outputEl.classList.remove("is-error");
    return;
  }

  outputEl.textContent = "Revisa la cuenta";
  outputEl.classList.add("is-error");
}

function refreshAmountPreviews() {
  updateAmountPreview(quickAmountEl, quickAmountTotalEl);
  updateAmountPreview(montoEl, montoTotalEl);
}

[quickAmountEl, montoEl].forEach((inputEl) => {
  if (!(inputEl instanceof HTMLInputElement)) return;
  inputEl.addEventListener("input", refreshAmountPreviews);
  inputEl.addEventListener("blur", refreshAmountPreviews);
});

if (form) {
  form.addEventListener("reset", () => {
    requestAnimationFrame(refreshAmountPreviews);
  });
}

if (currencyEl) {
  currencyEl.addEventListener("change", () => {
    requestAnimationFrame(refreshAmountPreviews);
  });
}

function money(value) {
  return formatMoney(value, state.selectedCurrency);
}

refreshAmountPreviews();

function loadActiveTab() {
  return "cargar";
}

function saveActiveTab(tab) {
  void tab;
}

function getCurrentTab() {
  const activeBtn = Array.from(tabBtns).find((btn) => btn.classList.contains("active"));
  const tab = activeBtn?.getAttribute("data-tab") || "cargar";
  return ["cargar", "resumen", "mas", "opciones"].includes(tab) ? tab : "cargar";
}

function setActiveTab(tab) {
  if (tab !== "mas" && state.topExpenseTempFilterActive) {
    state.topExpenseTempFilterActive = false;
    state.showAllFilteredRows = false;
    state.selectedDayKey = null;
    resetDetailFilters();
  }
  saveActiveTab(tab);
  if (tab === "mas" && !state.selectedDayKey) {
    const now = new Date();
    state.selectedDayKey = toDateKeyLocal(now);
    state.calendarMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  tabBtns.forEach((btn) => {
    const active = btn.getAttribute("data-tab") === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  tabPanels.forEach((panel) => {
    const show = panel.getAttribute("data-panel") === tab;
    panel.hidden = !show;
    panel.classList.remove("panel-enter");
    if (show && state.panelAnimationsReady) {
      void panel.offsetWidth;
      panel.classList.add("panel-enter");
    }
  });
  if (authCardEl) {
    const logged = Boolean(state.currentUser);
    authCardEl.hidden = logged || tab !== "opciones";
  }
  if (accountMiniEl) {
    const logged = Boolean(state.currentUser);
    accountMiniEl.hidden = !logged || tab !== "opciones";
  }
}

function setStatus(msg, tone = "info") {
  setStatusMessage(authStatusEl, msg, tone);
}

function showSyncBadge(message, tone = "ok", autoHideMs = 0) {
  if (!state.appReady || !state.syncUiReady) return;
  state.syncBadgeTimer = showSyncBadgeState(syncBadgeEl, message, tone, autoHideMs, state.syncBadgeTimer);
}

function hideSyncBadge() {
  state.syncBadgeTimer = hideSyncBadgeState(syncBadgeEl, state.syncBadgeTimer);
}

function formatLastSyncAge() {
  if (!(state.lastSuccessfulSyncAt > 0)) return "ahora";
  const elapsedMs = Math.max(0, Date.now() - state.lastSuccessfulSyncAt);
  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes <= 0) return "ahora";
  if (minutes === 1) return "hace 1 min";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "hace 1 h";
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "hace 1 d" : `hace ${days} d`;
}

function setSyncPending(value) {
  state.syncPending = Boolean(value);
}

function markSyncSuccess() {
  state.lastSuccessfulSyncAt = Date.now();
  state.syncPending = false;
}

function refreshSyncIndicator() {
  if (!syncIndicatorEl) return;
  if (btnSyncRetryEl) {
    btnSyncRetryEl.hidden = true;
    btnSyncRetryEl.disabled = false;
  }
  if (!state.appReady || !state.syncUiReady) {
    syncIndicatorEl.classList.remove("sync-local", "sync-online", "sync-syncing", "sync-error");
    syncIndicatorEl.textContent = "";
    if (syncHelpEl) syncHelpEl.textContent = "";
    hideSyncBadge();
    return;
  }

  syncIndicatorEl.classList.remove("sync-local", "sync-online", "sync-syncing", "sync-error");
  if (!state.currentUser) {
    syncIndicatorEl.classList.add("sync-local");
    syncIndicatorEl.textContent = "Guardado: inicia sesion para usar la nube";
    if (syncHelpEl) syncHelpEl.textContent = "Estas usando la app sin sesion. Solo veras o guardaras datos locales segun el entorno.";
    showSyncBadge("Sin sesion", "local");
    return;
  }
  if (state.syncOpsInFlight > 0) {
    syncIndicatorEl.classList.add("sync-syncing");
    syncIndicatorEl.textContent = "Sincronizacion: Sincronizando...";
    if (btnSyncRetryEl) btnSyncRetryEl.disabled = true;
    if (syncHelpEl) syncHelpEl.textContent = "La app esta consultando la nube en este momento.";
    showSyncBadge("Sincronizando...", "syncing");
    return;
  }
  if (state.hadRecentSyncError) {
    syncIndicatorEl.classList.add("sync-error");
    syncIndicatorEl.textContent = "Sincronizacion: Error";
    if (btnSyncRetryEl) btnSyncRetryEl.hidden = false;
    if (syncHelpEl) syncHelpEl.textContent = "Hubo un problema al traer tus movimientos de la nube. Puedes reintentar ahora.";
    showSyncBadge("Error de sync", "error");
    return;
  }
  if (state.syncPending) {
    syncIndicatorEl.classList.add("sync-online");
    syncIndicatorEl.textContent = "Sincronizacion: Datos locales";
    if (btnSyncRetryEl) btnSyncRetryEl.hidden = false;
    if (syncHelpEl) syncHelpEl.textContent = "La sesion fue restaurada, pero por ahora estas viendo cache local hasta poder revalidar la nube.";
    showSyncBadge("Datos locales", "pending");
    return;
  }
  syncIndicatorEl.classList.add("sync-online");
  syncIndicatorEl.textContent = "Sincronizacion: OK";
  if (btnSyncRetryEl) btnSyncRetryEl.hidden = false;
  if (syncHelpEl) syncHelpEl.textContent = "Tu cuenta esta conectada y los movimientos mostrados vienen de la nube.";
  showSyncBadge(`Sincronizado · ${formatLastSyncAge()}`, "ok");
}

function beginSyncOperation() {
  state.syncOpsInFlight += 1;
  refreshSyncIndicator();
}

function endSyncOperation(success) {
  state.syncOpsInFlight = Math.max(0, state.syncOpsInFlight - 1);
  if (success && state.syncOpsInFlight === 0) state.hadRecentSyncError = false;
  if (!success) state.hadRecentSyncError = true;
  refreshSyncIndicator();
}

function setImportStatus(msg) {
  if (importStatusEl) importStatusEl.textContent = msg;
  setStatus(msg);
}

function setClearMyDataStatus(msg) {
  if (clearMyDataStatusEl) clearMyDataStatusEl.textContent = msg;
}

function showToast(message) {
  state.toastTimer = showToastMessage(toastEl, message, state.toastTimer);
}

function saveBudgets(data) {
  state.budgets = data;
  saveBudgetsValue(data);
}

function setRecurrentes(data) {
  state.recurrentes = Array.isArray(data) ? data : [];
}

function saveRecurrentesState(data) {
  state.recurrentes = Array.isArray(data) ? data : [];
  saveRecurrentesCache(state.recurrentes);
}

function saveArsRate(v) {
  state.arsRate = v;
  saveArsRateValue(v);
}

function saveSpreadPct(v) {
  state.spreadPct = v;
  saveSpreadPctValue(v);
}

function saveTheme(theme) {
  state.selectedTheme = theme;
  saveThemeValue(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function saveCurrency(currency) {
  state.selectedCurrency = currency;
  saveCurrencyValue(currency);
}

function saveSavingsGoal(value) {
  state.savingsGoal = value > 0 ? value : 0;
  saveSavingsGoalValue(state.savingsGoal);
}

function saveQuickCategories(categories) {
  state.quickCategories = sanitizeQuickCategories(categories);
  saveQuickCategoriesValue(state.quickCategories);
}

function saveSession(session) {
  state.authSession = session;
  saveSessionWithMode(session, state.sessionPersistMode);
}

function clearSession() {
  state.authSession = null;
  clearSessionStorage();
}

function applyRememberPreference() {
  const remember = rememberEl ? Boolean(rememberEl.checked) : true;
  saveRememberMe(remember);
  state.sessionPersistMode = remember ? "local" : "session";
}

function txSignature(tx) {
  return [tx.fecha, tx.tipo, tx.categoria, Number(tx.monto).toFixed(2), tx.detalle || ""].join("|");
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
}

function toIsoDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function addDays(date, amount) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonthsClamped(date, amount) {
  const originalDay = date.getDate();
  const next = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, maxDay));
  return next;
}

function addYearsClamped(date, amount) {
  const originalDay = date.getDate();
  const next = new Date(date.getFullYear() + amount, date.getMonth(), 1, 12, 0, 0, 0);
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, maxDay));
  return next;
}

function advanceScheduledDate(date, frequency) {
  if (frequency === "daily") return addDays(date, 1);
  if (frequency === "weekly") return addDays(date, 7);
  if (frequency === "yearly") return addYearsClamped(date, 1);
  return addMonthsClamped(date, 1);
}

function defaultScheduledHorizon(date, frequency) {
  if (frequency === "daily") return addDays(date, 30);
  if (frequency === "weekly") return addDays(date, 7 * 16);
  if (frequency === "yearly") return addYearsClamped(date, 3);
  return addMonthsClamped(date, 12);
}

function buildScheduledOccurrences(item, now = new Date()) {
  if (!item || item.activo === false || item.auto_generate === false) return [];
  const startDate = parseIsoDate(item.start_date);
  if (!startDate) return [];
  const throughDate = parseIsoDate(item.end_date) || defaultScheduledHorizon(now, item.frecuencia || "monthly");
  if (startDate > throughDate) return [];

  const occurrences = [];
  let pointer = startDate;
  let generatedCount = 0;
  const maxIterations = 400;

  while (pointer <= throughDate && generatedCount < maxIterations) {
    generatedCount += 1;
    if (!item.repeat_count || occurrences.length < item.repeat_count) {
      occurrences.push(toIsoDate(pointer));
    }
    if (item.repeat_count && occurrences.length >= item.repeat_count) break;
    pointer = advanceScheduledDate(pointer, item.frecuencia || "monthly");
  }

  return occurrences;
}

function isLocalDevelopment() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function getLocalTransactionStore() {
  return isLocalDevelopment() ? loadTx() : [];
}

function requireCloudSession(actionLabel = "usar la app") {
  if (state.currentUser || isLocalDevelopment()) return true;
  updateEntryGate();
  setStatus(`No hay una sesion activa. Inicia sesion para ${actionLabel}.`, "error");
  return false;
}

function runCategoryMigration() {
  if (localStorage.getItem(MIGRATION_KEY) === "done") return;

  const current = loadTx();
  if (current.length === 0) {
    localStorage.setItem(MIGRATION_KEY, "done");
    return;
  }

  let changed = false;
  const migrated = current.map((tx) => {
    const detalle = String(tx.detalle || "").toUpperCase();
    const next = { ...tx };

    if (detalle.includes("(ROPA)") && tx.categoria === "Compras") {
      next.categoria = "Ropa";
      changed = true;
    }
    if (detalle.includes("(SEGURO)") && tx.categoria === "Auto") {
      next.categoria = "Seguro";
      changed = true;
    }

    return next;
  });

  if (changed) saveTx(migrated);
  localStorage.setItem(MIGRATION_KEY, "done");
}

async function bootstrapHistorico() {
  if (!isLocalDevelopment()) return;

  if (localStorage.getItem(BOOTSTRAP_KEY) === "done") return;

  try {
    const sources = ["./historico.private.json"];
    let historico = null;
    for (const src of sources) {
      try {
        const resp = await fetch(src, { cache: "no-store" });
        if (!resp.ok) continue;
        const data = await resp.json();
        if (Array.isArray(data)) {
          historico = data;
          break;
        }
      } catch {
        // Try next source.
      }
    }

    if (!Array.isArray(historico) || historico.length === 0) {
      localStorage.setItem(BOOTSTRAP_KEY, "done");
      return;
    }

    const current = loadTx();
    const seen = new Set(current.map(txSignature));
    const merged = [...current];

    historico.forEach((item) => {
      const normalized = {
        id: item.id || crypto.randomUUID(),
        fecha: String(item.fecha || "").slice(0, 10),
        tipo: item.tipo === "Ingreso" ? "Ingreso" : "Gasto",
        categoria: String(item.categoria || "").trim(),
        monto: Number(item.monto || 0),
        detalle: String(item.detalle || "").trim()
      };

      if (!normalized.fecha || !normalized.categoria || normalized.monto <= 0) return;

      const sig = txSignature(normalized);
      if (seen.has(sig)) return;
      seen.add(sig);
      merged.push(normalized);
    });

    saveTx(merged);
    localStorage.setItem(BOOTSTRAP_KEY, "done");
  } catch {
    // Keep app usable even if historico is unavailable.
  }
}

function fmtDelta(curr, prev) {
  const delta = curr - prev;
  const cls = delta > 0 ? "saldo-pos" : delta < 0 ? "saldo-neg" : "saldo-neu";
  const sign = delta > 0 ? "+" : "";
  const pct = prev === 0 ? "n/a" : `${sign}${((delta / prev) * 100).toFixed(1)}%`;
  return { cls, text: `${sign}${money(delta)} (${pct})` };
}

function fmtDeltaExpense(curr, prev) {
  const delta = curr - prev;
  const cls = delta > 0 ? "saldo-neg" : delta < 0 ? "saldo-pos" : "saldo-neu";
  const sign = delta > 0 ? "+" : "";
  const pct = prev === 0 ? "n/a" : `${sign}${((delta / prev) * 100).toFixed(1)}%`;
  return { cls, text: `${sign}${money(delta)} (${pct})` };
}

function getAllSortedTransactions() {
  return [...state.txData].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

const {
  getPayloadErrorMessage,
  getResponseErrorMessage,
  sbFetch,
  sbAuthFetch,
  fetchCurrentUser,
  fetchCurrentUserState
} = createSupabaseService({
  getAuthSession: () => state.authSession,
  getCurrentUser: () => state.currentUser,
  saveSession,
  clearSession,
  beginSyncOperation,
  endSyncOperation
});

const {
  addTransaction,
  addTransactionsBulk,
  updateTransaction,
  deleteTransaction,
  deleteTransactionsBulk,
  clearAllTransactions,
  duplicateTransaction: duplicateTransactionService,
  loadCloudData,
  seedCloudIfEmpty
} = createTransactionsService({
  getCurrentUser: () => state.currentUser,
  getTxData: () => state.txData,
  setTxData: (rows) => {
    state.txData = rows;
  },
  loadTx,
  saveTx,
  getRefresh: () => refresh,
  requireCloudSession,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  getLocalTransactionStore,
  markSyncSuccess,
  markSyncPending: setSyncPending
});

async function processScheduledMovements() {
  if (state.scheduledGenerationInFlight) return;
  if (!state.currentUser) return;

  const scheduled = Array.isArray(state.recurrentes) ? state.recurrentes : [];
  if (scheduled.length === 0) return;

  const existingSignatures = new Set((Array.isArray(state.txData) ? state.txData : []).map(txSignature));
  const generatedRows = [];

  scheduled.forEach((item) => {
    const occurrences = buildScheduledOccurrences(item, new Date());
    occurrences.forEach((fecha) => {
      const tx = {
        id: crypto.randomUUID(),
        fecha,
        tipo: item.tipo,
        categoria: item.categoria,
        monto: Number(item.monto || 0),
        detalle: item.detalle || ""
      };
      const signature = txSignature(tx);
      if (existingSignatures.has(signature)) return;
      existingSignatures.add(signature);
      generatedRows.push(tx);
    });
  });

  if (generatedRows.length === 0) return;

  state.scheduledGenerationInFlight = true;
  try {
    const ok = await addTransactionsBulk(generatedRows, { quiet: true });
    if (ok) {
      const label = generatedRows.length === 1 ? "1 movimiento programado generado" : `${generatedRows.length} movimientos programados generados`;
      showToast(label);
      setStatus(label, "success");
    }
  } finally {
    state.scheduledGenerationInFlight = false;
  }
}

async function removeGeneratedTransactionsForSchedule(item) {
  const nowKey = toIsoDate(new Date());
  const matchingIds = (Array.isArray(state.txData) ? state.txData : [])
    .filter((tx) => String(tx.fecha || "") >= nowKey)
    .filter((tx) => tx.tipo === item.tipo)
    .filter((tx) => tx.categoria === item.categoria)
    .filter((tx) => Number(tx.monto || 0) === Number(item.monto || 0))
    .filter((tx) => String(tx.detalle || "").trim() === String(item.detalle || "").trim())
    .map((tx) => tx.id);

  if (matchingIds.length === 0) return 0;

  const ok = await deleteTransactionsBulk(matchingIds, { quiet: true });
  return ok ? matchingIds.length : 0;
}

let setRecurrentInlineStatus = () => {};

const {
  currentMonthKey,
  deleteRecurrent,
  getOmittedIds,
  loadRecurrentes,
  omitForMonth,
  saveRecurrent,
  toggleRecurrent
} = createRecurrentesService({
  getCurrentUser: () => state.currentUser,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  setFeatureStatus: (message, tone) => {
    setRecurrentInlineStatus(message, tone);
  },
  showToast,
  setFeatureAvailability: (value) => {
    state.recurrentesAvailable = value !== false;
  },
  onRowsSynced: (rows) => {
    setRecurrentes(rows);
    saveRecurrentesState(rows);
    renderRecurrentList();
    processScheduledMovements();
  },
  loadRecurrentesCache,
  saveRecurrentesCache: saveRecurrentesState,
  clearRecurrentesCache: () => {
    clearRecurrentesCache();
    setRecurrentes([]);
  },
  loadRecurrentOmissions,
  saveRecurrentOmissions
});

const {
  downloadImportTemplate,
  exportFilteredToExcel,
  handleImportFileClick,
  parseDecimalInputValue
} = createImportExportService({
  CATEGORIAS,
  currentMonthKey: CURRENT_MONTH,
  getSelectedCurrency: () => state.selectedCurrency,
  getCurrentUser: () => state.currentUser,
  getTxData: () => state.txData,
  getCurrentDetailRows: () => state.currentDetailRows,
  getImportFile: () => importFileEl,
  loadTx,
  saveTx,
  requireCloudSession,
  txSignature,
  getRefresh: () => refresh,
  loadCloudData,
  sbAuthFetch,
  getResponseErrorMessage,
  setImportStatus,
  setStatus,
  getAnimatePrimarySave: () => animatePrimarySave,
  getFlashSavedFeedback: () => flashSavedFeedback,
  showToast,
  escapeHtml
});

const {
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
  updateArsConvertVisibility,
  updateArsResultPreview,
  updateCategoryOptions
} = createFormUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  form,
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
  getTxData: () => state.txData,
  getSelectedCurrency: () => state.selectedCurrency,
  getArsRate: () => state.arsRate,
  saveArsRate,
  saveSpreadPct,
  parseDecimalInputValue,
  setStatus,
  money,
  onEditingChange: (id) => {
    state.editingTxId = id;
  },
  setActiveTab
});

const { renderSuggestions, bindEvents: bindRecurrentSuggestionEvents } = createRecurrentSuggestionsUi({
  recurrentSuggestionsCardEl,
  recurrentSuggestionsTitleEl,
  btnRecurrentToggleEl,
  recurrentSuggestionsListEl,
  getCurrentUser: () => state.currentUser,
  isFeatureAvailable: () => state.recurrentesAvailable,
  getRecurrentes: () => state.recurrentes,
  getTxData: () => state.txData,
  getOmittedIds,
  omitForMonth,
  currentMonthKey,
  money,
  startPrefilledTransactionDraft,
  showToast
});

const {
  bindEvents: bindRecurrentEvents,
  renderList: renderRecurrentList,
  resetForm: resetRecurrentForm,
  setStatus: setRecurrentStatus,
  updateAuthVisibility: updateRecurrentAuthVisibility,
  updateCategoryOptions: updateRecurrentCategoryOptions
} = createRecurrentesUi({
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
  getCurrentUser: () => state.currentUser,
  isFeatureAvailable: () => state.recurrentesAvailable,
  getRecurrentes: () => state.recurrentes,
  setRecurrentes,
  saveRecurrent,
  deleteRecurrent,
  toggleRecurrent,
  removeGeneratedTransactionsForSchedule,
  refreshSuggestions: processScheduledMovements
});

setRecurrentInlineStatus = setRecurrentStatus;

const {
  loadQuickCategories,
  quickAddExpense,
  refreshQuickConfigValidation,
  renderQuickButtons,
  resetQuickCategories,
  saveQuickCategoriesFromUi,
  setQuickConfigStatus,
  setupQuickCategoryOptions,
  syncQuickCategorySelectOptions
} = createQuickActionsUi({
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
  getQuickCategories: () => state.quickCategories,
  setStatus,
  showToast,
  addTransaction,
  animatePrimarySave,
  flashSavedFeedback,
  money,
  parseDecimalInputValue
});

const {
  getFilteredDetailRows,
  moveCalendarMonth,
  refreshDetailCategoryOptions,
  renderCalendar,
  renderSelectedDayRows,
  resetDetailFilters,
  scrollToMovimientosSection,
  updateDetailSummaryUI
} = createCalendarUi({
  calTitleEl,
  calGridEl,
  dayTitleEl,
  lista,
  vacio,
  detailTypeEl,
  detailCategoryEl,
  detailFromEl,
  detailToEl,
  detailSearchEl,
  detailTotalEl,
  detailCountEl,
  detailAvgEl,
  movimientosSectionEl,
  getCalendarMonthDate: () => state.calendarMonthDate,
  setCalendarMonthDate: (date) => {
    state.calendarMonthDate = date;
  },
  getSelectedDayKey: () => state.selectedDayKey,
  setSelectedDayKey: (key) => {
    state.selectedDayKey = key;
  },
  getShowAllFilteredRows: () => state.showAllFilteredRows,
  formatDateLabel,
  formatMonthTitle,
  toDateKeyLocal,
  money,
  escapeHtml,
  getMonth,
  currentMonthKey: CURRENT_MONTH
});

const {
  bindChartInteractions,
  drawBalanceSparkline,
  drawCategoryDonutChart,
  drawMonthlyIncomeExpenseChart,
  drawYoyMiniChart,
  hideChartTooltip
} = createChartsUi({
  analysisPanelEl,
  chartMonthlyEl,
  chartMonthlyInsightEl,
  chartMonthlyLegendEl,
  chartCategoryEl,
  chartCategoryInsightEl,
  chartCategoryLegendEl,
  yoyMiniChartEl,
  yoyMiniLegendEl,
  balanceSparklineEl,
  balanceTrendEl,
  CURRENT_MONTH,
  getSelectedTheme: () => state.selectedTheme,
  money,
  monthLabel,
  StatsUtils
});

const {
  clearSavingsGoalFromUi,
  computeMonthlySummary,
  previousYearMonthKey,
  refreshSavingsGoalEditor,
  renderBudgetStatus,
  renderBudgetSummary,
  renderLast3Months,
  renderMonthlyComparison,
  renderSavingsGoalSummary,
  renderSpendingAlert,
  renderTopExpensesCurrentMonth,
  renderYearOverYearCategory,
  renderYearOverYearTotals,
  saveSavingsGoalFromUi,
  setSavingsGoalStatus,
  updateMonthlySummaryUI
} = createSummaryUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  CURRENT_MONTH,
  ingresosEl,
  gastosEl,
  balanceEl,
  balanceCardEl,
  cmpTitleEl,
  cmpIngresosEl,
  cmpGastosEl,
  cmpBalanceEl,
  cmpSummaryEl,
  spendingAlertEl,
  yoyCategoryEl,
  yoySummaryEl,
  yoyTitleEl,
  yoyIngresosEl,
  yoyGastosEl,
  yoyBalanceEl,
  topExpensesListEl,
  topExpensesNoteEl,
  budgetSummaryListEl,
  budgetListEl,
  savingsGoalAmountEl,
  savingsGoalStatusEl,
  savingsGoalSummaryEl,
  trend3mEl,
  getBudgets: () => state.budgets,
  getSavingsGoal: () => state.savingsGoal,
  saveSavingsGoal,
  money,
  monthLabel,
  getMonth,
  fmtDelta,
  fmtDeltaExpense,
  parseDecimalInputValue,
  setStatus,
  showToast,
  drawYoyMiniChart,
  StatsUtils
});

const { refresh } = createRefreshController({
  filtroMes,
  yoyPeriodAEl,
  yoyPeriodBEl,
  cargarEmptyStateEl,
  resumenEmptyCardEl,
  resumenContentCards,
  getInitialDataReady: () => state.initialDataReady,
  currentMonthLabelEl,
  CURRENT_MONTH,
  buildMonthOptions,
  monthLabel,
  previousYearMonthKey,
  getHasUserChosenMonth: () => state.hasUserChosenMonth,
  getCurrentTab,
  getAllSortedTransactions,
  computeMonthlySummary,
  updateMonthlySummaryUI,
  renderSavingsGoalSummary,
  renderTopExpensesCurrentMonth,
  drawBalanceSparkline,
  renderRecurrentSuggestions: renderSuggestions,
  refreshDetailCategoryOptions,
  getFilteredDetailRows,
  setCurrentDetailRows: (rows) => {
    state.currentDetailRows = rows;
  },
  updateDetailSummaryUI,
  renderCalendar,
  renderSelectedDayRows,
  drawMonthlyIncomeExpenseChart,
  drawCategoryDonutChart,
  renderMonthlyComparison,
  renderLast3Months,
  renderSpendingAlert,
  renderYearOverYearTotals,
  renderYearOverYearCategory,
  renderBudgetSummary,
  renderBudgetStatus
});

const {
  clearAuthActionBusy,
  runAsyncAction,
  setAuthActionBusy,
  setAuthButtons,
  updateEntryGate,
  validateEmailField,
  validatePasswordField
} = createAuthUi({
  authCardEl,
  accountMiniEl,
  accountMiniEmailEl,
  cloudIndicatorEl,
  heroSessionIndicatorEl,
  btnSignup,
  btnLogin,
  btnRecover,
  btnLogout,
  btnLogoutMini,
  btnGateSignin,
  btnGateSignup,
  emailEl,
  emailHintEl,
  passwordEl,
  passwordHintEl,
  entryGateEl,
  getCurrentUser: () => state.currentUser,
  getCurrentTab,
  getAuthActionInFlight: () => state.authActionInFlight,
  setAuthActionInFlight: (value) => {
    state.authActionInFlight = value;
  },
  resetSyncError: () => {
    state.hadRecentSyncError = false;
  },
  refreshSyncIndicator,
  setStatus
});

const { signup, login, recoverPassword, logout, initAuth } = createAuthService({
  emailEl,
  passwordEl,
  validateEmailField,
  validatePasswordField,
  setStatus,
  applyRememberPreference,
  saveSession,
  setCurrentUser: (user) => {
    state.currentUser = user;
    updateRecurrentAuthVisibility();
    renderSuggestions();
  },
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
  setTxData: (rows) => {
    state.txData = rows;
  },
  loadRecurrentesData: async () => {
    const rows = await loadRecurrentes();
    setRecurrentes(rows);
    saveRecurrentesState(rows);
    renderRecurrentList();
    updateRecurrentAuthVisibility();
    renderSuggestions();
    await processScheduledMovements();
  },
  clearRecurrentesState: () => {
    state.recurrentesAvailable = true;
    clearRecurrentesCache();
    setRecurrentes([]);
    renderRecurrentList();
    updateRecurrentAuthVisibility();
    renderSuggestions();
    resetRecurrentForm();
  },
  updateEntryGate,
  isLocalDevelopment,
  fetchCurrentUserState,
  getAuthSession: () => state.authSession,
  markSyncPending: setSyncPending
});

async function clearMyData() {
  const confirmed = window.confirm("Vas a borrar todos tus movimientos. ¿Continuar?");
  if (!confirmed) return;

  const ok = await clearAllTransactions();
  if (!ok) {
    setClearMyDataStatus("No se pudieron borrar datos.");
    return;
  }

  setClearMyDataStatus("Todos tus movimientos fueron eliminados.");
  setStatus("Todos tus movimientos fueron eliminados.");
  flashSavedFeedback("Datos borrados");
  showToast("Datos eliminados");
}

async function retrySyncFromUi() {
  if (!state.currentUser) {
    setStatus("No hay una sesion activa para reintentar la sincronizacion.", "error");
    refreshSyncIndicator();
    return;
  }

  setStatus("Reintentando sincronizacion...", "info");
  await loadCloudData();
  const recurrentRows = await loadRecurrentes();
  setRecurrentes(recurrentRows);
  renderRecurrentList();
  renderSuggestions();
  await processScheduledMovements();
  if (!state.hadRecentSyncError) {
    showToast("Sincronizacion actualizada");
  }
}

async function duplicateTransaction(id) {
  const ok = await duplicateTransactionService(id);
  if (!ok) return;
  flashSavedFeedback("Duplicado");
  showToast("Movimiento duplicado");
}

async function disableServiceWorkerCache() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // Ignore cache cleanup failures.
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const tipo = tipoEl.value;
  const monto = parseDecimalInputValue(document.getElementById("monto").value);
  const categoria = categoriaEl.value.trim();
  const detalle = document.getElementById("detalle").value.trim();

  if (!fecha || !categoria || monto <= 0) return;

  if (state.editingTxId) {
    const ok = await updateTransaction(state.editingTxId, {
      fecha,
      tipo,
      monto,
      categoria,
      detalle
    });
    if (ok) {
      animatePrimarySave();
      flashSavedFeedback("Guardado");
      setStatus("Movimiento editado correctamente.");
      showToast("Cambios guardados");
      resetTransactionForm();
    }
    return;
  }

  await addTransaction({
    id: crypto.randomUUID(),
    fecha,
    tipo,
    monto,
    categoria,
    detalle
  });

  animatePrimarySave();
  flashSavedFeedback("Guardado");
  showToast("Movimiento guardado");
  resetTransactionForm();
}

bindAppEvents({
  form,
  handleFormSubmit,
  filtroMes,
  setHasUserChosenMonth: (value) => {
    state.hasUserChosenMonth = value;
  },
  setCalendarMonthDate: (date) => {
    state.calendarMonthDate = date;
  },
  setSelectedDayKey: (value) => {
    state.selectedDayKey = value;
  },
  refresh,
  currencyEl,
  saveCurrency,
  updateArsConvertVisibility,
  arsConvertBoxEl,
  fetchArsRateForSelectedCurrency,
  updateArsResultPreview,
  themeEl,
  saveTheme,
  applyTheme,
  analysisPanelEl,
  hideChartTooltip,
  bindChartInteractions,
  rememberEl,
  applyRememberPreference,
  getAuthSession: () => state.authSession,
  saveSession,
  emailEl,
  validateEmailField,
  passwordEl,
  validatePasswordField,
  tipoEl,
  updateCategoryOptions,
  categoriaEl,
  tabBtns,
  setActiveTab,
  lista,
  startEditTransaction,
  startDuplicateDraftTransaction,
  deleteTransaction,
  calPrevEl,
  calNextEl,
  moveCalendarMonth,
  calGridEl,
  setShowAllFilteredRows: (value) => {
    state.showAllFilteredRows = value;
  },
  btnCancelEdit,
  resetTransactionForm,
  setStatus,
  btnEmptyStartEl,
  btnEmptyGoCargarEl,
  montoEl,
  btnGateSignin,
  btnGateSignup,
  entryGateEl,
  detailTypeEl,
  detailCategoryEl,
  detailFromEl,
  detailToEl,
  detailSearchEl,
  yoyPeriodAEl,
  yoyPeriodBEl,
  yoyCategoryEl,
  btnDetailClear,
  resetDetailFilters,
  setTopExpenseTempFilterActive: (value) => {
    state.topExpenseTempFilterActive = value;
  },
  topExpensesListEl,
  CURRENT_MONTH,
  toDateKeyLocal,
  monthLabel,
  scrollToMovimientosSection,
  budgetSummaryListEl,
  showToast,
  btnExportExcel,
  exportFilteredToExcel,
  btnDownloadTemplate,
  downloadImportTemplate,
  btnImportFile,
  handleImportFileClick,
  btnClearMyData,
  clearMyData,
  runAsyncAction,
  btnSignup,
  setAuthActionBusy,
  signup,
  clearAuthActionBusy,
  btnLogin,
  login,
  btnRecover,
  recoverPassword,
  btnLogout,
  logout,
  btnLogoutMini,
  quickButtons,
  quickAddExpense,
  quickCategorySelects,
  syncQuickCategorySelectOptions,
  refreshQuickConfigValidation,
  btnQuickConfigSave,
  saveQuickCategoriesFromUi,
  btnQuickConfigReset,
  resetQuickCategories,
  btnSavingsGoalSave,
  saveSavingsGoalFromUi,
  btnSavingsGoalClear,
  clearSavingsGoalFromUi,
  btnConvertArs,
  convertArsToSelectedCurrency,
  arsResultEl,
  money,
  getSelectedCurrency: () => state.selectedCurrency,
  btnRefreshRate,
  arsAmountEl,
  spreadPctEl,
  parseDecimalInputValue,
  saveSpreadPct,
  btnBudgetSave,
  budgetCategoryEl,
  budgetAmountEl,
  getBudgets: () => state.budgets,
  saveBudgets
});

bindRecurrentEvents();
bindRecurrentSuggestionEvents();

if (btnSyncRetryEl) {
  btnSyncRetryEl.addEventListener("click", () => {
    retrySyncFromUi();
  });
}

if (syncBadgeEl) {
  syncBadgeEl.addEventListener("click", () => {
    setActiveTab("opciones");
    requestAnimationFrame(() => {
      syncCardEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

(async () => {
  try {
    setStatus("Inicializando app...");
    localStorage.removeItem(ACTIVE_TAB_KEY);
    if (isLocalDevelopment()) {
      await disableServiceWorkerCache();
    }
    setupBudgetCategoryOptions();
    setupYoyCategoryOptions();
    setupQuickCategoryOptions();
    updateRecurrentCategoryOptions();
    updateRecurrentAuthVisibility();
    renderRecurrentList();
    resetRecurrentForm();
    renderQuickButtons();
    refreshSavingsGoalEditor();
    updateCategoryOptions(tipoEl.value);
    updateArsConvertVisibility();
    if (arsRateEl) arsRateEl.value = Number(state.arsRate).toFixed(4);
    if (spreadPctEl) spreadPctEl.value = Number(state.spreadPct).toFixed(1);
    await bootstrapHistorico();
    runCategoryMigration();
    state.txData = getLocalTransactionStore();
    if (currencyEl) currencyEl.value = state.selectedCurrency;
    if (themeEl) themeEl.value = state.selectedTheme;
    if (rememberEl) rememberEl.checked = loadRememberMe();
    applyTheme(state.selectedTheme);
    setActiveTab("cargar");
    updateArsConvertVisibility();
    refresh();
    state.appReady = true;
    document.body.classList.remove("app-boot");
    await initAuth();
    state.initialDataReady = true;
    state.syncUiReady = true;
    updateEntryGate();
    refreshSyncIndicator();
    requestAnimationFrame(() => {
      state.panelAnimationsReady = true;
    });
  } catch (err) {
    state.initialDataReady = true;
    refresh();
    setStatus(`Error al iniciar app: ${err?.message || String(err)}`);
  }
})();
