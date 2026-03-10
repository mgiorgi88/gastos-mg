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
  isValidEmailValue,
  setButtonLoadingState,
  setFieldVisualState,
  setStatusMessage,
  showSyncBadgeState,
  showToastMessage
} from "./js/ui/status.js";
import { createSupabaseService } from "./js/services/supabase.js";
import { createAuthService } from "./js/services/auth.js";
import { createTransactionsService } from "./js/services/transactions.js";
import { createFormUi } from "./js/ui/form-ui.js";
import { createQuickActionsUi } from "./js/ui/quick-actions.js";
import { createCalendarUi } from "./js/ui/calendar.js";
import { createChartsUi } from "./js/ui/charts.js";
import { createSummaryUi } from "./js/ui/summary.js";

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
  const localeMap = {
    EUR: "es-ES",
    ARS: "es-AR",
    USD: "en-US"
  };
  const locale = localeMap[selectedCurrency] || "es-ES";
  return new Intl.NumberFormat(locale, { style: "currency", currency: selectedCurrency }).format(value);
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

function setButtonLoading(button, isLoading, loadingText = "Procesando...") {
  setButtonLoadingState(button, isLoading, loadingText);
}

function setFieldState(input, hintEl, state = "idle", message = "") {
  setFieldVisualState(input, hintEl, state, message);
}

function isValidEmail(value) {
  return isValidEmailValue(value);
}

function validateEmailField({ required = false } = {}) {
  const value = emailEl?.value?.trim() || "";
  if (!value) {
    setFieldState(emailEl, emailHintEl, required ? "invalid" : "idle", required ? "Introduce un email valido." : "");
    return !required;
  }
  if (!isValidEmail(value)) {
    setFieldState(emailEl, emailHintEl, "invalid", "Revisa el formato del email.");
    return false;
  }
  setFieldState(emailEl, emailHintEl, "valid", "Email correcto.");
  return true;
}

function validatePasswordField({ required = false, minLength = 0 } = {}) {
  const value = passwordEl?.value || "";
  if (!value) {
    setFieldState(passwordEl, passwordHintEl, required ? "invalid" : "idle", required ? "Introduce tu contraseña." : "");
    return !required;
  }
  if (minLength > 0 && value.length < minLength) {
    setFieldState(passwordEl, passwordHintEl, "invalid", `Usa al menos ${minLength} caracteres.`);
    return false;
  }
  setFieldState(passwordEl, passwordHintEl, "valid", minLength > 0 ? "Longitud correcta." : "Contraseña lista.");
  return true;
}

function setAuthActionBusy(activeButton = null, loadingText = "Procesando...") {
  authActionInFlight = Boolean(activeButton);
  const authButtons = [btnLogin, btnSignup, btnRecover];
  authButtons.forEach((btn) => {
    if (!btn) return;
    const isActive = btn === activeButton;
    btn.disabled = authActionInFlight || btn.disabled;
    setButtonLoading(btn, isActive, loadingText);
    if (!isActive && authActionInFlight) btn.disabled = true;
  });
  if (btnGateSignin) btnGateSignin.disabled = authActionInFlight;
  if (btnGateSignup) btnGateSignup.disabled = authActionInFlight;
}

function clearAuthActionBusy() {
  authActionInFlight = false;
  [btnLogin, btnSignup, btnRecover].forEach((btn) => {
    if (!btn) return;
    setButtonLoading(btn, false);
  });
  if (btnGateSignin) btnGateSignin.disabled = false;
  if (btnGateSignup) btnGateSignup.disabled = false;
  setAuthButtons();
}

async function runAsyncAction(action, onErrorMessage) {
  try {
    await action();
  } catch (err) {
    setStatus(onErrorMessage(err), "error");
  }
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

function getMonth(dateStr) {
  return String(dateStr).slice(0, 7);
}

function buildMonthOptions(all) {
  const months = [...new Set(all.map((x) => getMonth(x.fecha)))];
  const ordered = [CURRENT_MONTH, ...months.filter((m) => m !== CURRENT_MONTH)];
  return [
    { value: CURRENT_MONTH, label: `Mes actual (${CURRENT_MONTH})` },
    ...ordered.filter((m, i) => i > 0).map((m) => ({ value: m, label: m })),
    { value: "Todos", label: "Todos" }
  ];
}

function getLast3MonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 1; i <= 3; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    keys.push(key);
  }
  return keys;
}

function monthLabel(key) {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [y, m] = key.split("-");
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${monthNames[idx]} ${y}`;
}

function previousMonthKey(monthKey) {
  const [y, m] = String(monthKey).split("-").map(Number);
  if (!y || !m) return CURRENT_MONTH;
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

function updateMonthFilterOptions(all) {
  const options = buildMonthOptions(all);
  const previous = filtroMes.value || CURRENT_MONTH;

  filtroMes.innerHTML = options
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join("");

  const validValues = new Set(options.map((x) => x.value));
  const nextValue = hasUserChosenMonth && validValues.has(previous) ? previous : CURRENT_MONTH;
  filtroMes.value = nextValue;
  return nextValue;
}

function updateYoyPeriodOptions(all) {
  if (!yoyPeriodAEl || !yoyPeriodBEl) {
    return { periodA: CURRENT_MONTH, periodB: previousYearMonthKey(CURRENT_MONTH) };
  }

  const months = buildMonthOptions(all)
    .map((opt) => opt.value)
    .filter((v) => v && v !== "Todos");
  const defaultA = CURRENT_MONTH;
  const defaultB = previousYearMonthKey(defaultA);
  const uniqueMonths = [...new Set([defaultA, defaultB, ...months])];
  const prevA = yoyPeriodAEl.value;
  const prevB = yoyPeriodBEl.value;

  const html = uniqueMonths
    .map((m) => `<option value="${m}">${monthLabel(m)}</option>`)
    .join("");

  yoyPeriodAEl.innerHTML = html;
  yoyPeriodBEl.innerHTML = html;

  const selectedA = uniqueMonths.includes(prevA)
    ? prevA
    : (uniqueMonths.includes(defaultA) ? defaultA : (uniqueMonths[0] || defaultA));
  yoyPeriodAEl.value = selectedA;

  let selectedB = uniqueMonths.includes(prevB)
    ? prevB
    : (uniqueMonths.includes(defaultB) ? defaultB : "");
  if (!selectedB) {
    selectedB = uniqueMonths.find((m) => m !== selectedA) || selectedA;
  }
  yoyPeriodBEl.value = selectedB;

  return { periodA: selectedA, periodB: selectedB };
}

function updateCalendarAndAnalytics(
  all,
  detailRows,
  monthKey,
  yoyPeriodA = CURRENT_MONTH,
  yoyPeriodB = previousYearMonthKey(CURRENT_MONTH)
) {
  renderCalendar(detailRows);
  renderSelectedDayRows(detailRows);
  drawMonthlyIncomeExpenseChart(all, monthKey);
  drawCategoryDonutChart(all, monthKey);
  renderMonthlyComparison(all, monthKey);
  renderLast3Months(all, monthKey);
  renderSpendingAlert(all);
  renderYearOverYearTotals(all, yoyPeriodA, yoyPeriodB);
  renderYearOverYearCategory(all, yoyPeriodA, yoyPeriodB);
  renderBudgetSummary(all, monthKey);
  renderBudgetStatus(all);
}

function refresh() {
  const all = getAllSortedTransactions();
  const hasTransactions = all.length > 0;

  if (cargarEmptyStateEl) cargarEmptyStateEl.hidden = hasTransactions;
  if (resumenEmptyCardEl) resumenEmptyCardEl.hidden = hasTransactions;
  resumenContentCards.forEach((card) => {
    card.hidden = !hasTransactions || card.getAttribute("data-panel") !== "resumen" || getCurrentTab() !== "resumen";
  });

  const selectedMonth = updateMonthFilterOptions(all);
  const yoyPeriods = updateYoyPeriodOptions(all);

  const summary = computeMonthlySummary(all, CURRENT_MONTH);
  updateMonthlySummaryUI(summary);
  renderSavingsGoalSummary(summary.balanceValue);
  renderTopExpensesCurrentMonth(all);
  if (currentMonthLabelEl) currentMonthLabelEl.textContent = `Mes actual: ${monthLabel(CURRENT_MONTH)}`;
  drawBalanceSparkline(all);

  refreshDetailCategoryOptions(all);
  const detailRows = getFilteredDetailRows(all);
  currentDetailRows = detailRows;

  updateDetailSummaryUI(detailRows);
  if (hasTransactions) {
    updateCalendarAndAnalytics(all, detailRows, selectedMonth, yoyPeriods.periodA, yoyPeriods.periodB);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeHeaderName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "")
    .replaceAll("_", "");
}

function mapImportRow(raw) {
  const mapped = {};
  Object.entries(raw || {}).forEach(([k, v]) => {
    mapped[normalizeHeaderName(k)] = v;
  });
  return {
    fecha: mapped.fecha ?? mapped.date ?? mapped.dia,
    tipo: mapped.tipo ?? mapped.type,
    categoria: mapped.categoria ?? mapped.category,
    monto: mapped.monto ?? mapped.importe ?? mapped.amount ?? mapped.valor,
    detalle: mapped.detalle ?? mapped.descripcion ?? mapped.description ?? "",
    moneda: mapped.moneda ?? mapped.currency ?? ""
  };
}

function parseImportedAmount(value) {
  if (typeof value === "number") return value;
  let s = String(value || "").trim();
  if (!s) return NaN;
  s = s.replaceAll(" ", "");
  const comma = s.lastIndexOf(",");
  const dot = s.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    if (comma > dot) {
      s = s.replaceAll(".", "").replace(",", ".");
    } else {
      s = s.replaceAll(",", "");
    }
  } else if (comma >= 0) {
    s = s.replace(",", ".");
  }
  return Number(s);
}

function parseDecimalInputValue(value) {
  const n = parseImportedAmount(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseImportedDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateKey(value);
  }
  if (typeof value === "number" && typeof XLSX !== "undefined" && XLSX?.SSF?.parse_date_code) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return "";
    const d = new Date(parsed.y, parsed.m - 1, parsed.d);
    return formatDateKey(d);
  }
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const day = slash[1].padStart(2, "0");
    const month = slash[2].padStart(2, "0");
    return `${slash[3]}-${month}-${day}`;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return formatDateKey(d);
}

function normalizeImportTipo(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (["ingreso", "income", "in"].includes(v)) return "Ingreso";
  if (["gasto", "expense", "egreso", "out"].includes(v)) return "Gasto";
  return "";
}

function normalizeImportCategoria(tipo, value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const all = [...CATEGORIAS.Gasto, ...CATEGORIAS.Ingreso];
  const direct = all.find((c) => c.toLowerCase() === raw.toLowerCase());
  if (direct) return direct;
  const alias = {
    diesel: "Gasolina",
    nafta: "Gasolina",
    deposito: "Depositos",
    depositos: "Depositos",
    alquilerdeptoargentina: "Alquiler Depto Argentina"
  };
  const k = raw.toLowerCase().replaceAll(" ", "");
  const mapped = alias[k];
  if (!mapped) return "";
  if (tipo === "Ingreso" && !CATEGORIAS.Ingreso.includes(mapped)) return "";
  if (tipo === "Gasto" && !CATEGORIAS.Gasto.includes(mapped)) return "";
  return mapped;
}

function parseCsvLine(line, sep) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === sep && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

function parseCsvRows(text) {
  const lines = String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
  const headers = parseCsvLine(lines[0], sep);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line, sep);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });
    return obj;
  });
}

async function parseImportFile(file) {
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".json")) {
    const text = await file.text();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  }
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCsvRows(text);
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    if (typeof XLSX === "undefined") {
      throw new Error("No se pudo cargar soporte Excel. Revisa internet y recarga.");
    }
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array", cellDates: true });
    const first = wb.SheetNames[0];
    if (!first) return [];
    return XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: "" });
  }
  throw new Error("Formato no soportado. Usa .xlsx, .csv o .json");
}

function normalizeImportedRows(rawRows) {
  const normalized = [];
  const errors = [];

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2;
    const r = mapImportRow(raw);
    const fecha = parseImportedDate(r.fecha);
    const tipo = normalizeImportTipo(r.tipo);
    const categoria = normalizeImportCategoria(tipo, r.categoria);
    const monto = parseImportedAmount(r.monto);
    const detalle = String(r.detalle || "").trim();

    if (!fecha) {
      errors.push(`Fila ${rowNum}: fecha invalida.`);
      return;
    }
    if (!tipo) {
      errors.push(`Fila ${rowNum}: tipo invalido (usa Gasto o Ingreso).`);
      return;
    }
    if (!categoria) {
      errors.push(`Fila ${rowNum}: categoria invalida para tipo ${tipo}.`);
      return;
    }
    if (!(monto > 0)) {
      errors.push(`Fila ${rowNum}: monto invalido.`);
      return;
    }

    normalized.push({
      id: crypto.randomUUID(),
      fecha,
      tipo,
      categoria,
      monto: Number(monto),
      detalle
    });
  });

  return { normalized, errors };
}

async function importTransactions(rows) {
  if (rows.length === 0) return 0;

  const seen = new Set(txData.map(txSignature));
  const deduped = [];
  rows.forEach((x) => {
    const sig = txSignature(x);
    if (seen.has(sig)) return;
    seen.add(sig);
    deduped.push(x);
  });
  if (deduped.length === 0) return 0;

  if (!currentUser) {
    if (!requireCloudSession("importar movimientos")) return 0;
    const all = loadTx();
    all.push(...deduped);
    saveTx(all);
    txData = all;
    refresh();
    return deduped.length;
  }

  const payload = deduped.map((x) => ({
    user_id: currentUser.id,
    fecha: x.fecha,
    tipo: x.tipo,
    categoria: x.categoria,
    monto: Number(x.monto),
    detalle: x.detalle || ""
  }));
  const resp = await sbAuthFetch("/rest/v1/movimientos", {
    method: "POST",
    body: payload
  });
  if (!resp.ok) {
    const msg = await getResponseErrorMessage(resp);
    throw new Error(msg);
  }
  await loadCloudData();
  return deduped.length;
}

function downloadImportTemplate() {
  const headers = ["fecha", "tipo", "categoria", "monto", "detalle", "moneda"];
  const sampleRows = [
    ["2026-03-01", "Ingreso", "Sueldo", 2500, "Nomina marzo", selectedCurrency],
    ["2026-03-02", "Gasto", "Supermercado", 84.3, "Compra semanal", selectedCurrency],
    ["2026-03-03", "Gasto", "Gasolina", 52, "Repostaje", selectedCurrency]
  ];

  if (typeof XLSX === "undefined") {
    const csv = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gastos_mg_plantilla.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setImportStatus("Plantilla CSV descargada (sin soporte Excel).");
    return;
  }

  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 24 },
    { wch: 12 },
    { wch: 32 },
    { wch: 10 }
  ];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  const allCategories = [...CATEGORIAS.Gasto, ...CATEGORIAS.Ingreso];
  const listFormula = (values) => `"${values.join(",").replaceAll('"', '""')}"`;
  // Data validation dropdowns to reduce import errors for non-technical users.
  ws["!dataValidation"] = [
    {
      sqref: "B2:B2000",
      type: "list",
      allowBlank: true,
      formula1: listFormula(["Ingreso", "Gasto"])
    },
    {
      sqref: "C2:C2000",
      type: "list",
      allowBlank: true,
      formula1: listFormula(allCategories)
    },
    {
      sqref: "F2:F2000",
      type: "list",
      allowBlank: true,
      formula1: listFormula(["EUR", "USD", "ARS"])
    }
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

  const catalogRows = [
    ["Tipos validos", "Categorias gasto", "Categorias ingreso"],
    ...Array.from({ length: Math.max(2, CATEGORIAS.Gasto.length, CATEGORIAS.Ingreso.length) }, (_, i) => [
      i < 2 ? (i === 0 ? "Ingreso" : "Gasto") : "",
      CATEGORIAS.Gasto[i] || "",
      CATEGORIAS.Ingreso[i] || ""
    ])
  ];
  const wsCatalog = XLSX.utils.aoa_to_sheet(catalogRows);
  wsCatalog["!cols"] = [{ wch: 16 }, { wch: 24 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsCatalog, "Catalogos");

  XLSX.writeFile(wb, "gastos_mg_plantilla.xlsx");
  setImportStatus("Plantilla Excel descargada.");
}

function exportFilteredToExcel() {
  const rows = [...currentDetailRows];
  if (rows.length === 0) {
    setStatus("No hay movimientos filtrados para exportar.");
    return;
  }

  const header = `
    <tr>
      <th>Fecha</th>
      <th>Tipo</th>
      <th>Categoria</th>
      <th>Detalle</th>
      <th>Monto</th>
      <th>Moneda visual</th>
    </tr>
  `;
  const body = rows.map((x) => `
    <tr>
      <td>${escapeHtml(String(x.fecha).slice(0, 10))}</td>
      <td>${escapeHtml(x.tipo)}</td>
      <td>${escapeHtml(x.categoria)}</td>
      <td>${escapeHtml(x.detalle || "")}</td>
      <td style="mso-number-format:'0.00'">${Number(x.monto).toFixed(2)}</td>
      <td>${escapeHtml(selectedCurrency)}</td>
    </tr>
  `).join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          ${header}
          ${body}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `gastos-mg_${today}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`Excel exportado (${rows.length} movimientos).`);
}

function setAuthButtons() {
  const logged = Boolean(currentUser);
  const activeTab = getCurrentTab();
  if (authCardEl) authCardEl.hidden = logged || activeTab !== "opciones";
  if (accountMiniEl) accountMiniEl.hidden = !logged || activeTab !== "opciones";
  if (accountMiniEmailEl) accountMiniEmailEl.textContent = logged ? currentUser.email : "";
  if (cloudIndicatorEl) {
    cloudIndicatorEl.textContent = logged ? "Nube: Conectado" : "Nube: Local";
    cloudIndicatorEl.classList.toggle("ok", logged);
  }
  if (btnSignup) btnSignup.disabled = logged || authActionInFlight;
  if (btnLogin) btnLogin.disabled = logged || authActionInFlight;
  if (btnRecover) btnRecover.disabled = logged || authActionInFlight;
  if (btnLogout) {
    btnLogout.disabled = !logged;
    btnLogout.hidden = !logged;
  }
  if (emailEl) emailEl.disabled = logged;
  if (passwordEl) passwordEl.disabled = logged;
  if (btnLogoutMini) btnLogoutMini.disabled = !logged;
  if (!logged) hadRecentSyncError = false;
  refreshSyncIndicator();
  updateEntryGate();
}

function updateEntryGate() {
  if (!entryGateEl) return;
  entryGateEl.hidden = Boolean(currentUser);
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
  refresh,
  requireCloudSession,
  sbAuthFetch,
  getResponseErrorMessage,
  setStatus,
  getLocalTransactionStore
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

async function handleImportFileClick() {
  try {
    const file = importFileEl?.files?.[0];
    if (!file) {
      setImportStatus("Selecciona un archivo para importar.");
      return;
    }
    setImportStatus("Procesando archivo...");
    const rawRows = await parseImportFile(file);
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      setImportStatus("El archivo no contiene filas para importar.");
      return;
    }
    const { normalized, errors } = normalizeImportedRows(rawRows);
    if (errors.length > 0) {
      const preview = errors.slice(0, 4).join(" ");
      setImportStatus(`Se detectaron ${errors.length} errores. ${preview}`);
      return;
    }
    const imported = await importTransactions(normalized);
    setImportStatus(`Importacion finalizada. Nuevos movimientos: ${imported}.`);
    if (importFileEl) importFileEl.value = "";
    animatePrimarySave(btnImportFile);
    flashSavedFeedback("Importado");
    showToast(`Importados: ${imported}`);
  } catch (err) {
    setImportStatus(`Error al importar: ${err?.message || String(err)}`);
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

form.addEventListener("submit", handleFormSubmit);

filtroMes.addEventListener("change", () => {
  hasUserChosenMonth = true;
  if (filtroMes.value && filtroMes.value !== "Todos") {
    const [yy, mm] = filtroMes.value.split("-").map(Number);
    if (yy && mm) {
      calendarMonthDate = new Date(yy, mm - 1, 1);
      selectedDayKey = null;
    }
  }
  refresh();
});

if (currencyEl) {
  currencyEl.addEventListener("change", async () => {
    saveCurrency(currencyEl.value);
    updateArsConvertVisibility();
    if (!arsConvertBoxEl?.hidden) {
      await fetchArsRateForSelectedCurrency();
      updateArsResultPreview();
    }
    refresh();
  });
}

if (themeEl) {
  themeEl.addEventListener("change", () => {
    saveTheme(themeEl.value);
    applyTheme(selectedTheme);
    refresh();
  });
}

if (analysisPanelEl) {
  analysisPanelEl.open = window.innerWidth > 600;
  analysisPanelEl.addEventListener("toggle", () => {
    hideChartTooltip();
    if (analysisPanelEl.open) requestAnimationFrame(() => refresh());
  });
}

bindChartInteractions();

if (rememberEl) {
  rememberEl.addEventListener("change", () => {
    applyRememberPreference();
    if (authSession?.access_token) saveSession(authSession);
  });
}

if (emailEl) {
  emailEl.addEventListener("input", () => validateEmailField());
  emailEl.addEventListener("blur", () => validateEmailField({ required: Boolean(emailEl.value.trim()) }));
}

if (passwordEl) {
  passwordEl.addEventListener("input", () => validatePasswordField());
  passwordEl.addEventListener("blur", () => {
    validatePasswordField({ required: Boolean(passwordEl.value), minLength: passwordEl.value ? 6 : 0 });
  });
}

tipoEl.addEventListener("change", () => updateCategoryOptions(tipoEl.value));
tipoEl.addEventListener("change", updateArsConvertVisibility);
categoriaEl.addEventListener("change", updateArsConvertVisibility);
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab") || "cargar";
    setActiveTab(tab);
    requestAnimationFrame(() => refresh());
  });
});

lista.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id][data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "edit") {
    startEditTransaction(id);
    return;
  }
  if (action === "duplicate") {
    await duplicateTransaction(id);
    return;
  }
  if (action === "delete") {
    await deleteTransaction(id);
  }
});

if (calPrevEl) {
  calPrevEl.addEventListener("click", () => {
    moveCalendarMonth(-1);
    refresh();
  });
}

if (calNextEl) {
  calNextEl.addEventListener("click", () => {
    moveCalendarMonth(1);
    refresh();
  });
}

if (calGridEl) {
  calGridEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".calendar-cell[data-date]");
    if (!cell) return;
    showAllFilteredRows = false;
    selectedDayKey = cell.getAttribute("data-date");
    refresh();
  });
}

if (btnCancelEdit) {
  btnCancelEdit.addEventListener("click", () => {
    resetTransactionForm();
    setStatus("Edicion cancelada.");
  });
}

if (btnEmptyStartEl) {
  btnEmptyStartEl.addEventListener("click", () => {
    setActiveTab("cargar");
    const montoEl = document.getElementById("monto");
    if (montoEl) montoEl.focus();
  });
}

if (btnEmptyGoCargarEl) {
  btnEmptyGoCargarEl.addEventListener("click", () => {
    setActiveTab("cargar");
    const montoEl = document.getElementById("monto");
    if (montoEl) montoEl.focus();
  });
}

if (btnGateSignin) {
  btnGateSignin.addEventListener("click", () => {
    if (entryGateEl) entryGateEl.hidden = true;
    setActiveTab("opciones");
    setStatus("Ingresa tu email y contraseña para iniciar sesión.");
    if (emailEl) emailEl.focus();
  });
}

if (btnGateSignup) {
  btnGateSignup.addEventListener("click", () => {
    if (entryGateEl) entryGateEl.hidden = true;
    setActiveTab("opciones");
    setStatus("Completa email y contraseña, luego pulsa Crear cuenta.");
    if (emailEl) emailEl.focus();
  });
}

if (detailTypeEl) detailTypeEl.addEventListener("change", refresh);
if (detailCategoryEl) detailCategoryEl.addEventListener("change", refresh);
if (detailFromEl) detailFromEl.addEventListener("change", refresh);
if (detailToEl) detailToEl.addEventListener("change", refresh);
if (detailSearchEl) detailSearchEl.addEventListener("input", refresh);
if (yoyPeriodAEl) yoyPeriodAEl.addEventListener("change", refresh);
if (yoyPeriodBEl) yoyPeriodBEl.addEventListener("change", refresh);
if (yoyCategoryEl) yoyCategoryEl.addEventListener("change", refresh);
if (btnDetailClear) {
  btnDetailClear.addEventListener("click", () => {
    resetDetailFilters();
    showAllFilteredRows = false;
    topExpenseTempFilterActive = false;
    refresh();
  });
}

if (topExpensesListEl) {
  topExpensesListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-top-expense-cat]");
    if (!btn) return;
    const cat = btn.getAttribute("data-top-expense-cat");
    if (!cat) return;

    // Reset detail filters to guarantee visible results for the chosen top category.
    if (detailTypeEl) detailTypeEl.value = "Gasto";
    const [yy, mm] = CURRENT_MONTH.split("-").map(Number);
    const monthFrom = `${yy}-${String(mm).padStart(2, "0")}-01`;
    const monthTo = toDateKeyLocal(new Date(yy, mm, 0));
    if (detailFromEl) detailFromEl.value = monthFrom;
    if (detailToEl) detailToEl.value = monthTo;
    if (detailSearchEl) detailSearchEl.value = "";
    if (detailCategoryEl) detailCategoryEl.value = cat;

    topExpenseTempFilterActive = true;
    showAllFilteredRows = true;
    selectedDayKey = null;
    calendarMonthDate = new Date();

    setActiveTab("mas");
    refresh();
    scrollToMovimientosSection();
    setStatus(`Filtro aplicado: ${cat} (${monthLabel(CURRENT_MONTH)}).`);
  });
}

if (budgetSummaryListEl) {
  budgetSummaryListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-budget-cat]");
    if (!btn) return;
    const cat = btn.getAttribute("data-budget-cat");
    if (!cat) return;
    setActiveTab("mas");
    if (detailTypeEl) detailTypeEl.value = "Gasto";
    if (detailCategoryEl) detailCategoryEl.value = cat;
    if (detailSearchEl) detailSearchEl.value = "";
    selectedDayKey = null;
    refresh();
    scrollToMovimientosSection();
    showToast(`Filtro: ${cat}`);
  });
}

if (btnExportExcel) {
  btnExportExcel.addEventListener("click", () => {
    exportFilteredToExcel();
  });
}

if (btnDownloadTemplate) {
  btnDownloadTemplate.addEventListener("click", () => {
    downloadImportTemplate();
  });
}

if (btnImportFile) {
  btnImportFile.addEventListener("click", () => {
    handleImportFileClick();
  });
}

if (btnClearMyData) {
  btnClearMyData.addEventListener("click", async () => {
    await clearMyData();
  });
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  hideChartTooltip();
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => refresh(), 120);
});

window.addEventListener("scroll", hideChartTooltip, { passive: true });

btnSignup.addEventListener("click", async () => {
  await runAsyncAction(async () => {
    setAuthActionBusy(btnSignup, "Creando cuenta...");
    setStatus("Creando cuenta...", "info");
    await signup();
  }, (err) => `Fallo en Crear cuenta: ${err?.message || String(err)}`);
  clearAuthActionBusy();
});

btnLogin.addEventListener("click", async () => {
  await runAsyncAction(async () => {
    setAuthActionBusy(btnLogin, "Iniciando sesi\u00f3n...");
    setStatus("Iniciando sesi\u00f3n...", "info");
    await login();
  }, (err) => `Fallo en Iniciar sesi\u00f3n: ${err?.message || String(err)}`);
  clearAuthActionBusy();
});

btnRecover.addEventListener("click", async () => {
  await runAsyncAction(async () => {
    setAuthActionBusy(btnRecover, "Enviando correo...");
    setStatus("Enviando recuperaci\u00f3n...", "info");
    await recoverPassword();
  }, (err) => `Fallo en Recuperar contrase\u00f1a: ${err?.message || String(err)}`);
  clearAuthActionBusy();
});

btnLogout.addEventListener("click", async () => {
  await runAsyncAction(
    async () => logout(),
    (err) => `Fallo en Cerrar sesi\u00f3n: ${err?.message || String(err)}`
  );
});

btnLogoutMini.addEventListener("click", async () => {
  await runAsyncAction(
    async () => logout(),
    (err) => `Fallo en Cerrar sesi\u00f3n: ${err?.message || String(err)}`
  );
});

quickButtons.forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const category = btn.dataset.category || "Supermercado";
    await quickAddExpense(category, btn);
  });
});

quickCategorySelects.forEach((selectEl) => {
  if (!selectEl) return;
  selectEl.addEventListener("change", () => {
    syncQuickCategorySelectOptions();
    refreshQuickConfigValidation();
  });
});

if (btnQuickConfigSave) {
  btnQuickConfigSave.addEventListener("click", saveQuickCategoriesFromUi);
}

if (btnQuickConfigReset) {
  btnQuickConfigReset.addEventListener("click", resetQuickCategories);
}

if (btnSavingsGoalSave) {
  btnSavingsGoalSave.addEventListener("click", saveSavingsGoalFromUi);
}

if (btnSavingsGoalClear) {
  btnSavingsGoalClear.addEventListener("click", clearSavingsGoalFromUi);
}

if (btnConvertArs) {
  btnConvertArs.addEventListener("click", async () => {
    await fetchArsRateForSelectedCurrency();
    const converted = convertArsToSelectedCurrency();
    if (!(converted > 0)) return;
    document.getElementById("monto").value = converted.toFixed(2);
    if (arsResultEl) arsResultEl.value = money(converted);
    setStatus(`Convertido a ${selectedCurrency}: ${money(converted)}.`);
  });
}

if (btnRefreshRate) {
  btnRefreshRate.addEventListener("click", async () => {
    await fetchArsRateForSelectedCurrency();
    setStatus("Cotizacion actualizada.");
  });
}

if (arsAmountEl) arsAmountEl.addEventListener("input", updateArsResultPreview);
if (spreadPctEl) {
  spreadPctEl.addEventListener("input", () => {
    const v = parseDecimalInputValue(spreadPctEl.value || 0);
    if (v >= 0) saveSpreadPct(v);
    updateArsResultPreview();
  });
}

btnBudgetSave.addEventListener("click", () => {
  const cat = budgetCategoryEl.value;
  const amount = parseDecimalInputValue(budgetAmountEl.value || 0);
  const next = { ...budgets };
  if (amount > 0) next[cat] = amount;
  else delete next[cat];
  saveBudgets(next);
  budgetAmountEl.value = "";
  setStatus(`Presupuesto actualizado para ${cat}.`);
  refresh();
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










