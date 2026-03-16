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
  balanceSparklineEl,
  balanceTrendEl,
  budgetAmountEl,
  budgetCategoryEl,
  budgetListEl,
  budgetSummaryListEl,
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
  btnRecover,
  btnRefreshRate,
  btnSavingsGoalClear,
  btnSavingsGoalSave,
  btnSignup,
  btnSubmitTx,
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
  cmpBalanceEl,
  cmpGastosEl,
  cmpIngresosEl,
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
  rememberEl,
  resumenContentCards,
  resumenEmptyCardEl,
  savingsGoalAmountEl,
  savingsGoalStatusEl,
  savingsGoalSummaryEl,
  spendingAlertEl,
  spreadPctEl,
  syncBadgeEl,
  syncIndicatorEl,
  tabBtns,
  tabPanels,
  themeEl,
  tipoEl,
  toastEl,
  topExpensesListEl,
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
  clearSessionStorage,
  loadArsRate,
  loadBudgets,
  loadCurrency,
  loadQuickCategoriesRaw,
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
  setStatusMessage,
  showSyncBadgeState,
  showToastMessage
} from "./js/ui/status.js";
import { createSupabaseService } from "./js/services/supabase.js";
import { createAuthService } from "./js/services/auth.js";
import { createTransactionsService } from "./js/services/transactions.js";
import { createImportExportService } from "./js/services/import-export.js";
import { createFormUi } from "./js/ui/form-ui.js";
import { createAuthUi } from "./js/ui/auth-ui.js";
import { createQuickActionsUi } from "./js/ui/quick-actions.js";
import { createCalendarUi } from "./js/ui/calendar.js";
import { createChartsUi } from "./js/ui/charts.js";
import { createSummaryUi } from "./js/ui/summary.js";
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
  quickCategories: buildInitialQuickCategories(
    CATEGORIAS.Gasto,
    QUICK_CATEGORY_DEFAULTS,
    loadQuickCategoriesRaw()
  ),
  savingsGoal: loadSavingsGoal(),
  syncBadgeTimer: null,
  authActionInFlight: false
});

if (fechaEl) fechaEl.valueAsDate = new Date();

function money(value) {
  return formatMoney(value, state.selectedCurrency);
}

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
  if (tab !== "cargar") {
    hideCalculator();
  }
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
    if (show) {
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
  state.syncBadgeTimer = showSyncBadgeState(syncBadgeEl, message, tone, autoHideMs, state.syncBadgeTimer);
}

function hideSyncBadge() {
  state.syncBadgeTimer = hideSyncBadgeState(syncBadgeEl, state.syncBadgeTimer);
}

function refreshSyncIndicator() {
  if (!syncIndicatorEl) return;

  syncIndicatorEl.classList.remove("sync-local", "sync-online", "sync-syncing", "sync-error");
  if (!state.currentUser) {
    syncIndicatorEl.classList.add("sync-local");
    syncIndicatorEl.textContent = "Sincronizacion: Local";
    hideSyncBadge();
    return;
  }
  if (state.syncOpsInFlight > 0) {
    syncIndicatorEl.classList.add("sync-syncing");
    syncIndicatorEl.textContent = "Sincronizacion: Sincronizando...";
    showSyncBadge("Sincronizando...", "syncing");
    return;
  }
  if (state.hadRecentSyncError) {
    syncIndicatorEl.classList.add("sync-error");
    syncIndicatorEl.textContent = "Sincronizacion: Error";
    showSyncBadge("Error de sync", "error");
    return;
  }
  syncIndicatorEl.classList.add("sync-online");
  syncIndicatorEl.textContent = "Sincronizacion: OK";
  hideSyncBadge();
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

function isLocalDevelopment() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function getLocalTransactionStore() {
  return isLocalDevelopment() ? loadTx() : [];
}

function requireCloudSession(actionLabel = "usar la app") {
  if (state.currentUser || isLocalDevelopment()) return true;
  setActiveTab("opciones");
  updateEntryGate();
  setStatus(`Inicia sesión para ${actionLabel}.`);
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
  updateTransaction,
  deleteTransaction,
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
  getLocalTransactionStore
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

const calculatorKeypadEl = document.getElementById("calculator-keypad");
const calculatorTargetEl = document.getElementById("calculator-target");
const calculatorDisplayEl = document.getElementById("calculator-display");
const calculatorLiveTotalEl = document.getElementById("calculator-live-total");
const calculatorCloseBtn = document.getElementById("calculator-close");
const quickAmountCalculatorSlotEl = document.getElementById("quick-amount-calculator-slot");
const montoCalculatorSlotEl = document.getElementById("monto-calculator-slot");
let activeCalculatorInput = null;
const mobileUserAgent =
  navigator.userAgentData?.mobile ||
  /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
const isTouchCalculatorDevice =
  Boolean(mobileUserAgent) &&
  window.matchMedia("(pointer: coarse)").matches;

function updateCalculatorScreen() {
  if (!calculatorDisplayEl || !calculatorLiveTotalEl || !activeCalculatorInput) return;
  const raw = String(activeCalculatorInput.value || "").trim();
  if (calculatorTargetEl) {
    calculatorTargetEl.textContent =
      activeCalculatorInput === quickAmountEl ? "Calculadora de importe rapido" : "Calculadora de monto";
  }
  calculatorDisplayEl.textContent = raw || "0";
  calculatorDisplayEl.classList.remove("calculator-display-error");
  calculatorLiveTotalEl.classList.remove("calculator-live-total-error");
  if (!raw) {
    calculatorLiveTotalEl.textContent = "Total: 0.00";
    return;
  }
  const result = evaluateMathExpression(raw);
  if (Number.isFinite(result)) {
    calculatorLiveTotalEl.textContent = `Total: ${result.toFixed(2)}`;
    return;
  }
  calculatorDisplayEl.classList.add("calculator-display-error");
  calculatorLiveTotalEl.classList.add("calculator-live-total-error");
  calculatorLiveTotalEl.textContent = "Total: expresion invalida";
}

function evaluateMathExpression(value) {
  return parseDecimalExpression(value);
}

function hideCalculator() {
  if (!calculatorKeypadEl) return;
  calculatorKeypadEl.hidden = true;
  calculatorKeypadEl.setAttribute("aria-hidden", "true");
  activeCalculatorInput = null;
}

function resolveCalculatorSlot(element) {
  if (element === quickAmountEl) return quickAmountCalculatorSlotEl;
  if (element === montoEl) return montoCalculatorSlotEl;
  return null;
}

function showCalculatorFor(element, options = {}) {
  if (!calculatorKeypadEl || !calculatorDisplayEl || !element) return;
  const { focusInput = true } = options;
  if (isTouchCalculatorDevice && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  if (isTouchCalculatorDevice) {
    const slotEl = resolveCalculatorSlot(element);
    if (slotEl && calculatorKeypadEl.parentElement !== slotEl) {
      slotEl.appendChild(calculatorKeypadEl);
    }
  }
  activeCalculatorInput = element;
  calculatorKeypadEl.hidden = false;
  calculatorKeypadEl.setAttribute("aria-hidden", "false");
  updateCalculatorScreen();
  if (focusInput) element.focus();
  if (isTouchCalculatorDevice) {
    calculatorKeypadEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function applyCalcKey(key) {
  if (!activeCalculatorInput) return;
  const current = String(activeCalculatorInput.value || "");

  if (key === "C") {
    setCalculatorValue("");
    return;
  }

  if (key === "backspace") {
    setCalculatorValue(current.slice(0, -1));
    return;
  }

  if (key === "close") {
    hideCalculator();
    return;
  }

  if (key === "⌫") {
    setCalculatorValue(current.slice(0, -1));
    return;
  }

  if (key === "=") {
    const result = evaluateMathExpression(current);
    if (Number.isFinite(result)) {
      setCalculatorValue(result.toFixed(2).replace(/\.00$/, ""));
    }
    return;
  }

  setCalculatorValue(current + key);
}

function setCalculatorValue(value) {
  if (!activeCalculatorInput) return;
  activeCalculatorInput.value = value;
  updateCalculatorScreen();
}

function bindCalculatorTrigger(inputEl) {
  if (!inputEl) return;

  if (isTouchCalculatorDevice) {
    inputEl.readOnly = true;
    inputEl.setAttribute("readonly", "readonly");
    inputEl.setAttribute("inputmode", "none");
  }

  if (!isTouchCalculatorDevice) {
    inputEl.addEventListener("focus", () => showCalculatorFor(inputEl));
  }
  inputEl.addEventListener("click", (event) => {
    if (isTouchCalculatorDevice) event.preventDefault();
    showCalculatorFor(inputEl, { focusInput: !isTouchCalculatorDevice });
  });
  inputEl.addEventListener(
    "touchstart",
    (event) => {
      if (isTouchCalculatorDevice) event.preventDefault();
      showCalculatorFor(inputEl, { focusInput: false });
    },
    { passive: false }
  );
  inputEl.addEventListener("pointerdown", (event) => {
    const isTouchPointer = event.pointerType === "touch" || window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchPointer) return;
    event.preventDefault();
    showCalculatorFor(inputEl, { focusInput: false });
  });
}

bindCalculatorTrigger(montoEl);
bindCalculatorTrigger(quickAmountEl);

if (calculatorCloseBtn) calculatorCloseBtn.addEventListener("click", hideCalculator);
if (calculatorKeypadEl) {
  calculatorKeypadEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const key = target.dataset.key;
    if (!key) return;
    applyCalcKey(key);
  });
}

document.addEventListener("click", (event) => {
  if (!calculatorKeypadEl || !activeCalculatorInput) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    hideCalculator();
    return;
  }
  const isInputTarget = target === montoEl || target === quickAmountEl;
  const isInputLabel = Boolean(montoEl?.closest("label")?.contains(target) || quickAmountEl?.closest("label")?.contains(target));
  if (isInputTarget || isInputLabel || calculatorKeypadEl.contains(target)) {
    return;
  }
  hideCalculator();
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
  }
});

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
  spendingAlertEl,
  yoyCategoryEl,
  yoySummaryEl,
  yoyTitleEl,
  yoyIngresosEl,
  yoyGastosEl,
  yoyBalanceEl,
  topExpensesListEl,
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
  updateEntryGate,
  isLocalDevelopment,
  fetchCurrentUserState,
  getAuthSession: () => state.authSession
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
  duplicateTransaction,
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

(async () => {
  try {
    setStatus("Inicializando app...");
    localStorage.removeItem(ACTIVE_TAB_KEY);
    await disableServiceWorkerCache();
    setupBudgetCategoryOptions();
    setupYoyCategoryOptions();
    setupQuickCategoryOptions();
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
    await initAuth();
    updateEntryGate();
    setActiveTab("cargar");
    refresh();
  } catch (err) {
    setStatus(`Error al iniciar app: ${err?.message || String(err)}`);
  }
})();


