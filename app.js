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

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} fecha ISO date (YYYY-MM-DD)
 * @property {"Ingreso"|"Gasto"} tipo
 * @property {string} categoria
 * @property {number} monto
 * @property {string} [detalle]
 */

let currentUser = null;
let txData = [];
let hasUserChosenMonth = false;
const sessionData = loadSessionData();
let sessionPersistMode = sessionData.persistMode;
let authSession = sessionData.session;
let selectedCurrency = loadCurrency();
let budgets = loadBudgets();
let arsRate = loadArsRate();
let spreadPct = loadSpreadPct();
let selectedTheme = loadTheme();
let editingTxId = null;
let calendarMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDayKey = null;
let showAllFilteredRows = false;
let topExpenseTempFilterActive = false;
let currentDetailRows = [];
let toastTimer = null;
let syncOpsInFlight = 0;
let hadRecentSyncError = false;
let quickCategories = (() => {
  const valid = CATEGORIAS.Gasto;
  const source = Array.isArray(loadQuickCategoriesRaw()) ? loadQuickCategoriesRaw() : [];
  const filtered = source.filter((x) => valid.includes(x));
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
})();
let savingsGoal = loadSavingsGoal();
let syncBadgeTimer = null;
let authActionInFlight = false;

const fechaEl = document.getElementById("fecha");
if (fechaEl) fechaEl.valueAsDate = new Date();

function money(value) {
  return formatMoney(value, selectedCurrency);
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
  if (tab !== "mas" && topExpenseTempFilterActive) {
    topExpenseTempFilterActive = false;
    showAllFilteredRows = false;
    selectedDayKey = null;
    resetDetailFilters();
  }
  saveActiveTab(tab);
  if (tab === "mas" && !selectedDayKey) {
    const now = new Date();
    selectedDayKey = toDateKeyLocal(now);
    calendarMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
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
    const logged = Boolean(currentUser);
    authCardEl.hidden = logged || tab !== "opciones";
  }
  if (accountMiniEl) {
    const logged = Boolean(currentUser);
    accountMiniEl.hidden = !logged || tab !== "opciones";
  }
}

function setStatus(msg, tone = "info") {
  setStatusMessage(authStatusEl, msg, tone);
}

function showSyncBadge(message, tone = "ok", autoHideMs = 0) {
  syncBadgeTimer = showSyncBadgeState(syncBadgeEl, message, tone, autoHideMs, syncBadgeTimer);
}

function hideSyncBadge() {
  syncBadgeTimer = hideSyncBadgeState(syncBadgeEl, syncBadgeTimer);
}

function refreshSyncIndicator() {
  if (!syncIndicatorEl) return;

  syncIndicatorEl.classList.remove("sync-local", "sync-online", "sync-syncing", "sync-error");
  if (!currentUser) {
    syncIndicatorEl.classList.add("sync-local");
    syncIndicatorEl.textContent = "Sincronizacion: Local";
    hideSyncBadge();
    return;
  }
  if (syncOpsInFlight > 0) {
    syncIndicatorEl.classList.add("sync-syncing");
    syncIndicatorEl.textContent = "Sincronizacion: Sincronizando...";
    showSyncBadge("Sincronizando...", "syncing");
    return;
  }
  if (hadRecentSyncError) {
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
  syncOpsInFlight += 1;
  refreshSyncIndicator();
}

function endSyncOperation(success) {
  syncOpsInFlight = Math.max(0, syncOpsInFlight - 1);
  if (success && syncOpsInFlight === 0) hadRecentSyncError = false;
  if (!success) hadRecentSyncError = true;
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
  toastTimer = showToastMessage(toastEl, message, toastTimer);
}

function saveBudgets(data) {
  budgets = data;
  saveBudgetsValue(data);
}

function saveArsRate(v) {
  arsRate = v;
  saveArsRateValue(v);
}

function saveSpreadPct(v) {
  spreadPct = v;
  saveSpreadPctValue(v);
}

function saveTheme(theme) {
  selectedTheme = theme;
  saveThemeValue(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function saveCurrency(currency) {
  selectedCurrency = currency;
  saveCurrencyValue(currency);
}

function saveSavingsGoal(value) {
  savingsGoal = value > 0 ? value : 0;
  saveSavingsGoalValue(savingsGoal);
}

function saveQuickCategories(categories) {
  quickCategories = sanitizeQuickCategories(categories);
  saveQuickCategoriesValue(quickCategories);
}

function saveSession(session) {
  authSession = session;
  saveSessionWithMode(session, sessionPersistMode);
}

function clearSession() {
  authSession = null;
  clearSessionStorage();
}

function applyRememberPreference() {
  const remember = rememberEl ? Boolean(rememberEl.checked) : true;
  saveRememberMe(remember);
  sessionPersistMode = remember ? "local" : "session";
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
  if (currentUser || isLocalDevelopment()) return true;
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
  return [...txData].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

const {
  getPayloadErrorMessage,
  getResponseErrorMessage,
  sbFetch,
  sbAuthFetch,
  fetchCurrentUser,
  fetchCurrentUserState
} = createSupabaseService({
  getAuthSession: () => authSession,
  getCurrentUser: () => currentUser,
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
  getCurrentUser: () => currentUser,
  getTxData: () => txData,
  setTxData: (rows) => {
    txData = rows;
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
  getSelectedCurrency: () => selectedCurrency,
  getCurrentUser: () => currentUser,
  getTxData: () => txData,
  getCurrentDetailRows: () => currentDetailRows,
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
  getTxData: () => txData,
  getSelectedCurrency: () => selectedCurrency,
  getArsRate: () => arsRate,
  saveArsRate,
  saveSpreadPct,
  parseDecimalInputValue,
  setStatus,
  money,
  onEditingChange: (id) => {
    editingTxId = id;
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
  getQuickCategories: () => quickCategories,
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
  getCalendarMonthDate: () => calendarMonthDate,
  setCalendarMonthDate: (date) => {
    calendarMonthDate = date;
  },
  getSelectedDayKey: () => selectedDayKey,
  setSelectedDayKey: (key) => {
    selectedDayKey = key;
  },
  getShowAllFilteredRows: () => showAllFilteredRows,
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
  getSelectedTheme: () => selectedTheme,
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
  getBudgets: () => budgets,
  getSavingsGoal: () => savingsGoal,
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
  getHasUserChosenMonth: () => hasUserChosenMonth,
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
    currentDetailRows = rows;
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
  getCurrentUser: () => currentUser,
  getCurrentTab,
  getAuthActionInFlight: () => authActionInFlight,
  setAuthActionInFlight: (value) => {
    authActionInFlight = value;
  },
  resetSyncError: () => {
    hadRecentSyncError = false;
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
    currentUser = user;
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
    txData = rows;
  },
  updateEntryGate,
  isLocalDevelopment,
  fetchCurrentUserState,
  getAuthSession: () => authSession
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

  if (editingTxId) {
    const ok = await updateTransaction(editingTxId, {
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
    hasUserChosenMonth = value;
  },
  setCalendarMonthDate: (date) => {
    calendarMonthDate = date;
  },
  setSelectedDayKey: (value) => {
    selectedDayKey = value;
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
  getAuthSession: () => authSession,
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
    showAllFilteredRows = value;
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
    topExpenseTempFilterActive = value;
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
  getSelectedCurrency: () => selectedCurrency,
  btnRefreshRate,
  arsAmountEl,
  spreadPctEl,
  parseDecimalInputValue,
  saveSpreadPct,
  btnBudgetSave,
  budgetCategoryEl,
  budgetAmountEl,
  getBudgets: () => budgets,
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
    if (arsRateEl) arsRateEl.value = Number(arsRate).toFixed(4);
    if (spreadPctEl) spreadPctEl.value = Number(spreadPct).toFixed(1);
    await bootstrapHistorico();
    runCategoryMigration();
    txData = getLocalTransactionStore();
    if (currencyEl) currencyEl.value = selectedCurrency;
    if (themeEl) themeEl.value = selectedTheme;
    if (rememberEl) rememberEl.checked = loadRememberMe();
    applyTheme(selectedTheme);
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













