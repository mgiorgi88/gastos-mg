const KEY = "mis_gastos_v1";
const BOOTSTRAP_KEY = "mis_gastos_bootstrap_v1";
const MIGRATION_KEY = "mis_gastos_migration_v2";
const SESSION_KEY = "mis_gastos_supabase_session_v1";
const QUICK_AMOUNTS_KEY = "mis_gastos_quick_amounts_v1";
const CURRENCY_KEY = "mis_gastos_currency_v1";
const BUDGETS_KEY = "mis_gastos_budgets_v1";
const ARS_RATE_KEY = "mis_gastos_ars_rate_v1";
const SPREAD_PCT_KEY = "mis_gastos_spread_pct_v1";
const THEME_KEY = "mis_gastos_theme_v1";
const ACTIVE_TAB_KEY = "mis_gastos_active_tab_v1";
const REMEMBER_ME_KEY = "mis_gastos_remember_me_v1";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

const SUPABASE_URL = "https://gwtioxerklmzjssweqgm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rcTj1A_vRoeOQ7yDOjPQ7g_PlmfsQPs";

const form = document.getElementById("tx-form");
const btnSubmitTx = document.getElementById("btn-submit-tx");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const txFormModeEl = document.getElementById("tx-form-mode");
const quickAmountEl = document.getElementById("quick-amount");
const quickDetailEl = document.getElementById("quick-detail");
const btnQuickSuper = document.getElementById("btn-quick-super");
const btnQuickComp = document.getElementById("btn-quick-comp");
const btnQuickSal = document.getElementById("btn-quick-sal");
const btnQuickGas = document.getElementById("btn-quick-gas");
const detailTypeEl = document.getElementById("detail-type");
const detailCategoryEl = document.getElementById("detail-category");
const detailFromEl = document.getElementById("detail-from");
const detailToEl = document.getElementById("detail-to");
const detailSearchEl = document.getElementById("detail-search");
const btnDetailClear = document.getElementById("btn-detail-clear");
const btnExportExcel = document.getElementById("btn-export-excel");
const detailTotalEl = document.getElementById("detail-total");
const detailCountEl = document.getElementById("detail-count");
const detailAvgEl = document.getElementById("detail-avg");
const cmpTitleEl = document.getElementById("cmp-title");
const cmpIngresosEl = document.getElementById("cmp-ingresos");
const cmpGastosEl = document.getElementById("cmp-gastos");
const cmpBalanceEl = document.getElementById("cmp-balance");
const chartMonthlyEl = document.getElementById("chart-monthly");
const chartMonthlyInsightEl = document.getElementById("chart-monthly-insight");
const chartMonthlyLegendEl = document.getElementById("chart-monthly-legend");
const chartCategoryEl = document.getElementById("chart-category");
const chartCategoryInsightEl = document.getElementById("chart-category-insight");
const chartCategoryLegendEl = document.getElementById("chart-category-legend");
const analysisPanelEl = document.getElementById("analysis-panel");
const budgetCategoryEl = document.getElementById("budget-category");
const budgetAmountEl = document.getElementById("budget-amount");
const btnBudgetSave = document.getElementById("btn-budget-save");
const budgetListEl = document.getElementById("budget-list");
const btnDownloadTemplate = document.getElementById("btn-download-template");
const importFileEl = document.getElementById("import-file");
const btnImportFile = document.getElementById("btn-import-file");
const importStatusEl = document.getElementById("import-status");
const arsConvertBoxEl = document.getElementById("ars-convert-box");
const arsAmountEl = document.getElementById("ars-amount");
const arsRateEl = document.getElementById("ars-rate");
const spreadPctEl = document.getElementById("spread-pct");
const arsResultEl = document.getElementById("ars-result");
const btnConvertArs = document.getElementById("btn-convert-ars");
const btnRefreshRate = document.getElementById("btn-refresh-rate");
const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const filtroMes = document.getElementById("filtro-mes");
const currencyEl = document.getElementById("currency-select");
const themeEl = document.getElementById("theme-select");
const trend3mEl = document.getElementById("trend-3m");
const calPrevEl = document.getElementById("cal-prev");
const calNextEl = document.getElementById("cal-next");
const calTitleEl = document.getElementById("cal-title");
const calGridEl = document.getElementById("cal-grid");
const dayTitleEl = document.getElementById("day-title");
const tipoEl = document.getElementById("tipo");
const categoriaEl = document.getElementById("categoria");

const ingresosEl = document.getElementById("ingresos");
const gastosEl = document.getElementById("gastos");
const balanceEl = document.getElementById("balance");
const currentMonthLabelEl = document.getElementById("current-month-label");
const balanceSparklineEl = document.getElementById("balance-sparkline");
const balanceTrendEl = document.getElementById("balance-trend");
const spendingAlertEl = document.getElementById("spending-alert");
const yoyCategoryEl = document.getElementById("yoy-category");
const yoySummaryEl = document.getElementById("yoy-summary");
const yoyMiniChartEl = document.getElementById("yoy-mini-chart");
const yoyTitleEl = document.getElementById("yoy-title");
const yoyIngresosEl = document.getElementById("yoy-ingresos");
const yoyGastosEl = document.getElementById("yoy-gastos");
const yoyBalanceEl = document.getElementById("yoy-balance");
const budgetSummaryListEl = document.getElementById("budget-summary-list");

const emailEl = document.getElementById("auth-email");
const passwordEl = document.getElementById("auth-password");
const rememberEl = document.getElementById("auth-remember");
const btnSignup = document.getElementById("btn-signup");
const btnLogin = document.getElementById("btn-login");
const btnRecover = document.getElementById("btn-recover");
const btnLogout = document.getElementById("btn-logout");
const authStatusEl = document.getElementById("auth-status");
const cloudIndicatorEl = document.getElementById("cloud-indicator");
const syncIndicatorEl = document.getElementById("sync-indicator");
const authCardEl = document.getElementById("auth-card");
const accountMiniEl = document.getElementById("account-mini");
const accountMiniEmailEl = document.getElementById("account-mini-email");
const btnLogoutMini = document.getElementById("btn-logout-mini");
const entryGateEl = document.getElementById("entry-gate");
const btnGateLocal = document.getElementById("btn-gate-local");
const btnGateLogin = document.getElementById("btn-gate-login");
const toastEl = document.getElementById("toast");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll("[data-panel]");

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} fecha ISO date (YYYY-MM-DD)
 * @property {"Ingreso"|"Gasto"} tipo
 * @property {string} categoria
 * @property {number} monto
 * @property {string} [detalle]
 */

const CATEGORIAS = {
  Gasto: [
    "Alquiler",
    "Hipoteca",
    "Supermercado",
    "Auto",
    "Seguro",
    "Compras",
    "Ropa",
    "Servicios",
    "Viajes",
    "Salidas",
    "Gasolina",
    "Salud",
    "Transporte"
  ],
  Ingreso: ["Sueldo", "Depositos", "Alquiler Depto Argentina"]
};

const CATEGORY_ICONS = {
  Alquiler: "\u{1F3E0}",
  Hipoteca: "\u{1F3E1}",
  Supermercado: "\u{1F6D2}",
  Auto: "\u{1F697}",
  Seguro: "\u{1F6E1}\uFE0F",
  Compras: "\u{1F6CD}\uFE0F",
  Ropa: "\u{1F455}",
  Servicios: "\u{1F4A1}",
  Viajes: "\u{2708}\uFE0F",
  Salidas: "\u{1F37D}\uFE0F",
  Gasolina: "\u{26FD}",
  Salud: "\u{1F48A}",
  Transporte: "\u{1F68C}",
  Sueldo: "\u{1F4BC}",
  Depositos: "\u{1F3E6}",
  "Alquiler Depto Argentina": "\u{1F3D8}\uFE0F"
};

let currentUser = null;
let txData = [];
let hasUserChosenMonth = false;
let sessionPersistMode = "local";
let authSession = loadSession();
let quickAmounts = loadQuickAmounts();
let selectedCurrency = loadCurrency();
let budgets = loadBudgets();
let arsRate = loadArsRate();
let spreadPct = loadSpreadPct();
let selectedTheme = loadTheme();
let editingTxId = null;
let calendarMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDayKey = null;
let currentDetailRows = [];
let lastQuickCategory = "Supermercado";
let toastTimer = null;
let chartTooltipEl = null;
let monthlyTooltipPoints = [];
let donutTooltipSlices = [];
let syncOpsInFlight = 0;
let hadRecentSyncError = false;

document.getElementById("fecha").valueAsDate = new Date();

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
  const stored = localStorage.getItem(ACTIVE_TAB_KEY) || "cargar";
  return ["cargar", "resumen", "mas"].includes(stored) ? stored : "cargar";
}

function saveActiveTab(tab) {
  localStorage.setItem(ACTIVE_TAB_KEY, tab);
}

function setActiveTab(tab) {
  saveActiveTab(tab);
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
    authCardEl.hidden = logged || tab !== "mas";
  }
  if (accountMiniEl) {
    const logged = Boolean(currentUser);
    accountMiniEl.hidden = !logged || tab !== "mas";
  }
}

function setStatus(msg) {
  if (authStatusEl) authStatusEl.textContent = msg;
  try {
    console.log("[GastosMG]", msg);
  } catch {
    // Ignore console issues.
  }
}

function refreshSyncIndicator() {
  if (!syncIndicatorEl) return;

  syncIndicatorEl.classList.remove("sync-local", "sync-online", "sync-syncing", "sync-error");
  if (!currentUser) {
    syncIndicatorEl.classList.add("sync-local");
    syncIndicatorEl.textContent = "Sincronizacion: Local";
    return;
  }
  if (syncOpsInFlight > 0) {
    syncIndicatorEl.classList.add("sync-syncing");
    syncIndicatorEl.textContent = "Sincronizacion: Sincronizando...";
    return;
  }
  if (hadRecentSyncError) {
    syncIndicatorEl.classList.add("sync-error");
    syncIndicatorEl.textContent = "Sincronizacion: Error";
    return;
  }
  syncIndicatorEl.classList.add("sync-online");
  syncIndicatorEl.textContent = "Sincronizacion: OK";
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

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastEl.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => {
      toastEl.hidden = true;
    }, 190);
  }, 1500);
}

function loadTx() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTx(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function loadQuickAmounts() {
  try {
    return JSON.parse(localStorage.getItem(QUICK_AMOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveQuickAmounts(data) {
  quickAmounts = data;
  localStorage.setItem(QUICK_AMOUNTS_KEY, JSON.stringify(data));
}

function loadBudgets() {
  try {
    return JSON.parse(localStorage.getItem(BUDGETS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveBudgets(data) {
  budgets = data;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(data));
}

function loadArsRate() {
  const v = Number(localStorage.getItem(ARS_RATE_KEY) || 1100);
  return v > 0 ? v : 1100;
}

function saveArsRate(v) {
  arsRate = v;
  localStorage.setItem(ARS_RATE_KEY, String(v));
}

function loadSpreadPct() {
  const v = Number(localStorage.getItem(SPREAD_PCT_KEY) || 3);
  return v >= 0 ? v : 3;
}

function saveSpreadPct(v) {
  spreadPct = v;
  localStorage.setItem(SPREAD_PCT_KEY, String(v));
}

function loadTheme() {
  const valid = new Set(["light", "dark"]);
  const stored = localStorage.getItem(THEME_KEY) || "light";
  return valid.has(stored) ? stored : "light";
}

function saveTheme(theme) {
  selectedTheme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function loadCurrency() {
  const valid = new Set(["EUR", "ARS", "USD"]);
  const stored = localStorage.getItem(CURRENCY_KEY) || "EUR";
  return valid.has(stored) ? stored : "EUR";
}

function saveCurrency(currency) {
  selectedCurrency = currency;
  localStorage.setItem(CURRENCY_KEY, currency);
}

function loadSession() {
  try {
    const local = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (local?.access_token) {
      sessionPersistMode = "local";
      return local;
    }
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (session?.access_token) {
      sessionPersistMode = "session";
      return session;
    }
    sessionPersistMode = "local";
    return null;
  } catch {
    sessionPersistMode = "local";
    return null;
  }
}

function loadRememberMe() {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  if (stored === null) return true;
  return stored === "1";
}

function saveRememberMe(enabled) {
  localStorage.setItem(REMEMBER_ME_KEY, enabled ? "1" : "0");
}

function saveSession(session) {
  authSession = session;
  if (sessionPersistMode === "session") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function clearSession() {
  authSession = null;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function applyRememberPreference() {
  const remember = rememberEl ? Boolean(rememberEl.checked) : true;
  saveRememberMe(remember);
  sessionPersistMode = remember ? "local" : "session";
}

function txSignature(tx) {
  return [tx.fecha, tx.tipo, tx.categoria, Number(tx.monto).toFixed(2), tx.detalle || ""].join("|");
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
  if (localStorage.getItem(BOOTSTRAP_KEY) === "done") return;

  try {
    const sources = ["./historico.private.json", "./historico.json"];
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
    ...CATEGORIAS.Gasto
    .map((c) => `<option value="${c}">${CATEGORY_ICONS[c] || "\u2022"} ${c}</option>`)
  ].join("");
  if (previous === "__ALL__" || (previous && CATEGORIAS.Gasto.includes(previous))) {
    yoyCategoryEl.value = previous;
  } else {
    yoyCategoryEl.value = "__ALL__";
  }
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

function getCssVar(name, fallback = "#3b82f6") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function getFontFamily() {
  return getCssVar("--font-main", "Helvetica Neue, Helvetica, Arial, sans-serif");
}

function setupCanvas(canvas, width, height) {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function ensureChartTooltip() {
  if (chartTooltipEl) return chartTooltipEl;
  const el = document.createElement("div");
  el.className = "chart-tooltip";
  el.hidden = true;
  document.body.appendChild(el);
  chartTooltipEl = el;
  return el;
}

function hideChartTooltip() {
  if (!chartTooltipEl) return;
  chartTooltipEl.classList.remove("show");
  chartTooltipEl.hidden = true;
}

function showChartTooltip(clientX, clientY, title, line, color = "#3b82f6") {
  const el = ensureChartTooltip();
  el.innerHTML = `
    <div class="chart-tooltip-title">${escapeHtml(title)}</div>
    <div class="chart-tooltip-line">
      <i class="chart-tooltip-dot" style="background:${color}"></i>
      <span>${escapeHtml(line)}</span>
    </div>
  `;
  el.hidden = false;
  el.classList.add("show");

  const pad = 10;
  const tooltipRect = el.getBoundingClientRect();
  let left = clientX + 14;
  let top = clientY + 14;

  if (left + tooltipRect.width + pad > window.innerWidth) {
    left = clientX - tooltipRect.width - 14;
  }
  if (top + tooltipRect.height + pad > window.innerHeight) {
    top = clientY - tooltipRect.height - 14;
  }

  left = Math.max(pad, left);
  top = Math.max(pad, top);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function normalizeAngle(value) {
  const full = Math.PI * 2;
  let v = value;
  while (v < 0) v += full;
  while (v >= full) v -= full;
  return v;
}

function fillRoundedRect(ctx, x, y, w, h, r = 4) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    return;
  }
  ctx.fillRect(x, y, w, h);
}

function getRecentMonthKeys(count = 6) {
  const keys = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function drawMonthlyIncomeExpenseChart(all) {
  if (!chartMonthlyEl) return;
  if (analysisPanelEl && !analysisPanelEl.open) return;
  monthlyTooltipPoints = [];

  const width = chartMonthlyEl.clientWidth || 300;
  const height = chartMonthlyEl.clientHeight || 250;
  const ctx = setupCanvas(chartMonthlyEl, width, height);
  ctx.clearRect(0, 0, width, height);

  const keys = getRecentMonthKeys(6);
  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const rows = keys.map((k) => {
    const s = StatsUtils.getMonthStats(statsByMonth, k);
    return { key: k, ingresos: s.ingresos, gastos: s.gastos };
  });

  const maxVal = Math.max(1, ...rows.flatMap((r) => [r.ingresos, r.gastos]));
  const left = 36;
  const right = width - 10;
  const top = 16;
  const bottom = height - 26;
  const chartW = right - left;
  const chartH = bottom - top;
  const groupW = chartW / rows.length;
  const barW = Math.min(14, (groupW - 8) / 2);
  const gridColor = selectedTheme === "dark" ? "rgba(148, 163, 184, 0.18)" : "rgba(100, 116, 139, 0.22)";

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i += 1) {
    const y = top + (chartH * i) / 3;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  const incomeColor = "#22c55e";
  const expenseColor = "#ef4444";
  const textColor = getCssVar("--muted", "#6b7280");
  const fontFamily = getFontFamily();
  ctx.font = `11px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.fillStyle = textColor;

  rows.forEach((r, idx) => {
    const gx = left + idx * groupW + groupW / 2;
    const hIn = (r.ingresos / maxVal) * chartH;
    const hEx = (r.gastos / maxVal) * chartH;
    const monthTitle = monthLabel(r.key);
    const ingresoX = gx - barW - 2;
    const ingresoY = bottom - hIn;
    const gastoX = gx + 2;
    const gastoY = bottom - hEx;

    ctx.fillStyle = incomeColor;
    fillRoundedRect(ctx, ingresoX, ingresoY, barW, hIn, 4);
    ctx.fillStyle = expenseColor;
    fillRoundedRect(ctx, gastoX, gastoY, barW, hEx, 4);

    monthlyTooltipPoints.push({
      month: monthTitle,
      type: "Ingresos",
      value: r.ingresos,
      color: incomeColor,
      x: ingresoX,
      y: ingresoY,
      w: barW,
      h: Math.max(hIn, 1)
    });
    monthlyTooltipPoints.push({
      month: monthTitle,
      type: "Gastos",
      value: r.gastos,
      color: expenseColor,
      x: gastoX,
      y: gastoY,
      w: barW,
      h: Math.max(hEx, 1)
    });

    ctx.fillStyle = textColor;
    ctx.fillText(monthLabel(r.key).split(" ")[0], gx, height - 8);
  });

  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  if (chartMonthlyInsightEl && last && prev) {
    const delta = last.gastos - prev.gastos;
    const pct = prev.gastos > 0 ? `${Math.abs((delta / prev.gastos) * 100).toFixed(1)}%` : "n/a";
    const icon = delta > 0 ? "\u{1F53A}" : delta < 0 ? "\u{1F7E2}" : "\u{26AA}";
    const trendWord = delta > 0 ? "subieron" : delta < 0 ? "bajaron" : "estables";
    let streakText = "";
    if (rows.length >= 3) {
      const g0 = rows[rows.length - 3].gastos;
      const g1 = rows[rows.length - 2].gastos;
      const g2 = rows[rows.length - 1].gastos;
      if (g2 < g1 && g1 < g0) streakText = " \u{1F4C9} 2 meses seguidos bajando gastos.";
      else if (g2 > g1 && g1 > g0) streakText = " \u{1F4C8} 2 meses seguidos subiendo gastos.";
    }
    chartMonthlyInsightEl.textContent = `${icon} Gastos ${trendWord}: ${money(Math.abs(delta))} (${pct}) vs mes anterior.${streakText}`;
  }

  if (chartMonthlyLegendEl) {
    chartMonthlyLegendEl.innerHTML = `
      <span class="chart-legend-item"><i class="chart-swatch" style="background:${incomeColor}"></i>Ingresos</span>
      <span class="chart-legend-item"><i class="chart-swatch" style="background:${expenseColor}"></i>Gastos</span>
    `;
  }
}

function drawCategoryDonutChart(all, selectedMonth) {
  if (!chartCategoryEl) return;
  if (analysisPanelEl && !analysisPanelEl.open) return;
  donutTooltipSlices = [];

  const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
  const byCategory = {};
  all.forEach((x) => {
    if (x.tipo !== "Gasto") return;
    if (getMonth(x.fecha) !== monthKey) return;
    byCategory[x.categoria] = (byCategory[x.categoria] || 0) + Number(x.monto);
  });

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const width = chartCategoryEl.clientWidth || 300;
  const height = chartCategoryEl.clientHeight || 250;
  const ctx = setupCanvas(chartCategoryEl, width, height);
  ctx.clearRect(0, 0, width, height);

  if (entries.length === 0) {
    if (chartCategoryInsightEl) chartCategoryInsightEl.textContent = "Sin gastos para el mes seleccionado.";
    if (chartCategoryLegendEl) chartCategoryLegendEl.innerHTML = "";
    ctx.fillStyle = getCssVar("--muted", "#6b7280");
    ctx.textAlign = "center";
    ctx.font = `13px ${getFontFamily()}`;
    ctx.fillText("Sin datos", width / 2, height / 2);
    return;
  }

  const palette = ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd", "#1d4ed8", "#38bdf8", "#0ea5e9"];
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.43;
  let start = -Math.PI / 2;

  const topEntries = entries.slice(0, 7);
  topEntries.forEach(([cat, val], idx) => {
    const angle = (val / total) * Math.PI * 2;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = palette[idx % palette.length];
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fill();
    donutTooltipSlices.push({
      category: cat,
      value: val,
      pct: ((val / total) * 100).toFixed(1),
      color: palette[idx % palette.length],
      cx,
      cy,
      outerR: r,
      innerR: r * 0.56,
      start: normalizeAngle(start),
      end: normalizeAngle(end),
      wraps: normalizeAngle(end) < normalizeAngle(start)
    });
    start = end;
  });

  ctx.beginPath();
  ctx.fillStyle = getCssVar("--bg", "#f6f7f9");
  ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  ctx.fill();

  const [topCat, topVal] = entries[0];
  const share = ((topVal / total) * 100).toFixed(1);
  const top3Share = ((topEntries.slice(0, 3).reduce((acc, [, v]) => acc + v, 0) / total) * 100).toFixed(1);
  const fontFamily = getFontFamily();
  ctx.fillStyle = getCssVar("--ink", "#111827");
  ctx.textAlign = "center";
  ctx.font = `bold 13px ${fontFamily}`;
  ctx.fillText(`${share}%`, cx, cy - 2);
  ctx.fillStyle = getCssVar("--muted", "#6b7280");
  ctx.font = `11px ${fontFamily}`;
  ctx.fillText(topCat, cx, cy + 14);

  if (chartCategoryInsightEl) {
    const ratioText = `${Math.round((Number(share) / 100) * 10)}/10`;
    chartCategoryInsightEl.textContent = `\u{1F7E2} Mayor categoria: ${topCat} (${share}%). Peso: ${ratioText} del gasto mensual. Top 3: ${top3Share}%.`;
  }

  if (chartCategoryLegendEl) {
    chartCategoryLegendEl.innerHTML = topEntries.slice(0, 5).map(([cat, val], idx) => {
      const pct = ((val / total) * 100).toFixed(1);
      return `<span class="chart-legend-item"><i class="chart-swatch" style="background:${palette[idx % palette.length]}"></i>${cat} (${pct}%)</span>`;
    }).join("");
  }
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

function renderMonthlyComparison(all, selectedMonth) {
  if (!cmpTitleEl || !cmpIngresosEl || !cmpGastosEl || !cmpBalanceEl) return;

  const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
  const prevKey = previousMonthKey(monthKey);
  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const curr = StatsUtils.monthTotals(all, monthKey, statsByMonth);
  const prev = StatsUtils.monthTotals(all, prevKey, statsByMonth);

  cmpTitleEl.textContent = `${monthKey} vs ${prevKey}`;

  const i = fmtDelta(curr.ingresos, prev.ingresos);
  cmpIngresosEl.className = i.cls;
  cmpIngresosEl.textContent = i.text;

  const g = fmtDeltaExpense(curr.gastos, prev.gastos);
  cmpGastosEl.className = g.cls;
  cmpGastosEl.textContent = g.text;

  const b = fmtDelta(curr.balance, prev.balance);
  cmpBalanceEl.className = b.cls;
  cmpBalanceEl.textContent = b.text;
}

function handleMonthlyTooltip(clientX, clientY) {
  if (!chartMonthlyEl || monthlyTooltipPoints.length === 0) {
    hideChartTooltip();
    return;
  }
  const rect = chartMonthlyEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const directHit = monthlyTooltipPoints.find((p) => (
    x >= p.x - 3 &&
    x <= p.x + p.w + 3 &&
    y >= p.y - 3 &&
    y <= p.y + p.h + 3
  ));

  let hit = directHit;
  if (!hit) {
    // Snap: on touch/mouse near the bars, attach tooltip to the closest bar.
    const SNAP_RADIUS = 28;
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    monthlyTooltipPoints.forEach((p) => {
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    });
    if (best && bestDist <= SNAP_RADIUS) hit = best;
  }

  if (!hit) {
    hideChartTooltip();
    return;
  }
  showChartTooltip(clientX, clientY, hit.month, `${hit.type}: ${money(hit.value)}`, hit.color);
}

function handleDonutTooltip(clientX, clientY) {
  if (!chartCategoryEl || donutTooltipSlices.length === 0) {
    hideChartTooltip();
    return;
  }
  const rect = chartCategoryEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const dx = x - donutTooltipSlices[0].cx;
  const dy = y - donutTooltipSlices[0].cy;
  const dist = Math.hypot(dx, dy);
  const angle = normalizeAngle(Math.atan2(dy, dx));

  const hit = donutTooltipSlices.find((s) => {
    if (dist < s.innerR || dist > s.outerR) return false;
    if (s.wraps) return angle >= s.start || angle <= s.end;
    return angle >= s.start && angle <= s.end;
  });
  if (!hit) {
    hideChartTooltip();
    return;
  }
  showChartTooltip(clientX, clientY, hit.category, `${money(hit.value)} (${hit.pct}%)`, hit.color);
}

function formatDateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(d);
}

function formatMonthTitle(date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function toDateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function moveCalendarMonth(offset) {
  calendarMonthDate = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() + offset, 1);
  selectedDayKey = null;
}

function renderCalendar(rows) {
  if (!calGridEl || !calTitleEl) return;

  const y = calendarMonthDate.getFullYear();
  const m = calendarMonthDate.getMonth();
  const first = new Date(y, m, 1);
  const firstWeekDay = (first.getDay() + 6) % 7;
  const gridStart = new Date(y, m, 1 - firstWeekDay);
  const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
  const todayKey = toDateKeyLocal(new Date());

  calTitleEl.textContent = formatMonthTitle(calendarMonthDate);
  calGridEl.classList.remove("month-enter");
  void calGridEl.offsetWidth;
  calGridEl.classList.add("month-enter");
  calGridEl.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const dateKey = toDateKeyLocal(date);
    const rowsForDay = rows.filter((x) => String(x.fecha).slice(0, 10) === dateKey);
    const hasIncome = rowsForDay.some((x) => x.tipo === "Ingreso");
    const hasExpense = rowsForDay.some((x) => x.tipo === "Gasto");
    const hasData = hasIncome || hasExpense;
    const isOutMonth = !dateKey.startsWith(monthKey);
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDayKey;

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `calendar-cell${isOutMonth ? " out-month" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}${hasData ? " has-data" : " no-data"}`;
    cell.setAttribute("data-date", dateKey);
    cell.innerHTML = `
      <small>${date.getDate()}</small>
      <span class="calendar-marks">
        ${hasIncome ? '<i class="dot income"></i>' : ""}
        ${hasExpense ? '<i class="dot expense"></i>' : ""}
      </span>
    `;
    calGridEl.appendChild(cell);
  }
}

function renderSelectedDayRows(rows) {
  if (!selectedDayKey) {
    if (dayTitleEl) dayTitleEl.textContent = "Selecciona un dia para ver movimientos.";
    lista.innerHTML = "";
    vacio.hidden = true;
    return;
  }

  const dayRows = rows.filter((x) => String(x.fecha).slice(0, 10) === selectedDayKey);
  if (dayTitleEl) dayTitleEl.textContent = `Movimientos del ${formatDateLabel(selectedDayKey)}`;

  lista.innerHTML = "";
  dayRows
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
    .forEach((item) => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="meta">
          <strong>${CATEGORY_ICONS[item.categoria] || "\u2022"} ${item.categoria}</strong>
          <small>
            <span class="tx-type ${item.tipo === "Ingreso" ? "ingreso" : "gasto"}">${item.tipo === "Ingreso" ? "Ingreso" : "Gasto"}</span>
            ${item.detalle ? " - " + item.detalle : ""}
          </small>
        </div>
        <div class="item-actions">
          <strong class="monto ${String(item.tipo).toLowerCase()}">${item.tipo === "Gasto" ? "-" : "+"}${money(Number(item.monto))}</strong>
          <button class="danger action-btn" data-action="duplicate" data-id="${item.id}" type="button"><span class="action-icon">\u29C9</span><span class="action-label">Duplicar</span></button>
          <button class="danger action-btn" data-action="edit" data-id="${item.id}" type="button"><span class="action-icon">\u270E</span><span class="action-label">Editar</span></button>
          <button class="danger action-btn" data-action="delete" data-id="${item.id}" type="button"><span class="action-icon">\u{1F5D1}</span><span class="action-label">Eliminar</span></button>
        </div>
      `;
      lista.appendChild(li);
    });

  vacio.hidden = dayRows.length > 0;
}

function setEditingState(tx = null) {
  editingTxId = tx ? String(tx.id) : null;
  if (btnSubmitTx) btnSubmitTx.textContent = tx ? "Guardar cambios" : "Guardar";
  if (btnCancelEdit) btnCancelEdit.hidden = !tx;
  if (txFormModeEl) txFormModeEl.hidden = !tx;
}

function startEditTransaction(id) {
  const tx = txData.find((x) => String(x.id) === String(id));
  if (!tx) {
    setStatus("No se encontro el movimiento para editar.");
    return;
  }

  document.getElementById("fecha").value = String(tx.fecha).slice(0, 10);
  tipoEl.value = tx.tipo === "Ingreso" ? "Ingreso" : "Gasto";
  updateCategoryOptions(tipoEl.value, tx.categoria);
  document.getElementById("monto").value = Number(tx.monto).toFixed(2);
  document.getElementById("detalle").value = tx.detalle || "";
  updateArsConvertVisibility();
  setEditingState(tx);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`Editando: ${tx.categoria} del ${tx.fecha}.`);
}

function resetTransactionForm() {
  form.reset();
  document.getElementById("fecha").valueAsDate = new Date();
  tipoEl.value = "Gasto";
  updateCategoryOptions("Gasto");
  updateArsConvertVisibility();
  setEditingState(null);
}

function animatePrimarySave() {
  if (!btnSubmitTx) return;
  btnSubmitTx.classList.remove("saving");
  void btnSubmitTx.offsetWidth;
  btnSubmitTx.classList.add("saving");
  setTimeout(() => btnSubmitTx.classList.remove("saving"), 260);
}

function renderLast3Months(all) {
  if (!trend3mEl) return;

  const monthKeys = getRecentMonthKeys(6);
  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const cards = monthKeys.map((key) => {
    const stats = StatsUtils.getMonthStats(statsByMonth, key);
    const saldo = stats.balance;
    const saldoClass = saldo > 0 ? "saldo-pos" : saldo < 0 ? "saldo-neg" : "saldo-neu";

    return `
      <article class="trend-item">
        <span>${monthLabel(key)}</span>
        <strong class="${saldoClass}">${money(saldo)}</strong>
      </article>
    `;
  });

  trend3mEl.innerHTML = cards.join("");
}

function renderSpendingAlert(all) {
  if (!spendingAlertEl) return;

  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const current = StatsUtils.getMonthStats(statsByMonth, CURRENT_MONTH).gastos;
  const last3Keys = getLast3MonthKeys();
  const prevValues = last3Keys
    .map((k) => StatsUtils.getMonthStats(statsByMonth, k).gastos)
    .filter((v) => v > 0);

  spendingAlertEl.classList.remove(
    "summary-alert-good",
    "summary-alert-warn",
    "summary-alert-bad",
    "summary-alert-neutral"
  );

  if (prevValues.length === 0) {
    spendingAlertEl.classList.add("summary-alert-neutral");
    spendingAlertEl.textContent = "Sin historial suficiente para comparar gasto mensual.";
    return;
  }

  const avg = prevValues.reduce((acc, v) => acc + v, 0) / prevValues.length;
  if (avg <= 0) {
    spendingAlertEl.classList.add("summary-alert-neutral");
    spendingAlertEl.textContent = "Sin promedio valido para comparar gasto mensual.";
    return;
  }

  const delta = current - avg;
  const pct = (delta / avg) * 100;
  const absPct = Math.abs(pct).toFixed(1);
  const avgLabel = money(avg);

  if (pct <= -10) {
    spendingAlertEl.classList.add("summary-alert-good");
    spendingAlertEl.textContent = `Gasto del mes ${absPct}% por debajo del promedio 3M (${avgLabel}).`;
    return;
  }
  if (pct >= 10) {
    spendingAlertEl.classList.add("summary-alert-bad");
    spendingAlertEl.textContent = `Alerta: gasto del mes ${absPct}% por encima del promedio 3M (${avgLabel}).`;
    return;
  }

  spendingAlertEl.classList.add("summary-alert-warn");
  spendingAlertEl.textContent = `Gasto del mes en linea con el promedio 3M (${avgLabel}).`;
}

function previousYearMonthKey(monthKey) {
  const [y, m] = String(monthKey || "").split("-").map(Number);
  if (!y || !m) return monthKey;
  return `${String(y - 1)}-${String(m).padStart(2, "0")}`;
}

function renderYearOverYearCategory(all, selectedMonth) {
  if (!yoySummaryEl || !yoyCategoryEl) return;
  const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
  const prevKey = previousYearMonthKey(monthKey);
  const cat = yoyCategoryEl.value || "__ALL__";
  const isAll = cat === "__ALL__";

  let current = 0;
  let previous = 0;
  all.forEach((x) => {
    if (x.tipo !== "Gasto") return;
    if (!isAll && x.categoria !== cat) return;
    const mk = getMonth(x.fecha);
    if (mk === monthKey) current += Number(x.monto);
    else if (mk === prevKey) previous += Number(x.monto);
  });

  drawYoyMiniChart(current, previous, monthKey, prevKey);

  yoySummaryEl.classList.remove("saldo-pos", "saldo-neg", "saldo-neu");
  const scopeLabel = isAll ? "Total gastos" : cat;

  if (current === 0 && previous === 0) {
    yoySummaryEl.classList.add("saldo-neu");
    yoySummaryEl.textContent = `${scopeLabel}: sin movimientos en ${monthLabel(monthKey)} ni en ${monthLabel(prevKey)}.`;
    return;
  }

  if (previous === 0) {
    yoySummaryEl.classList.add("saldo-neu");
    yoySummaryEl.textContent = `${scopeLabel}: ${money(current)} en ${monthLabel(monthKey)}. Sin dato para ${monthLabel(prevKey)}.`;
    return;
  }

  const delta = current - previous;
  const pct = ((delta / previous) * 100).toFixed(1);
  const improving = delta < 0;
  yoySummaryEl.classList.add(improving ? "saldo-pos" : delta > 0 ? "saldo-neg" : "saldo-neu");
  yoySummaryEl.textContent = `${scopeLabel}: ${money(current)} vs ${money(previous)} (${pct >= 0 ? "+" : ""}${pct}%) respecto a ${monthLabel(prevKey)}.`;
}

function renderYearOverYearTotals(all, selectedMonth) {
  if (!yoyTitleEl || !yoyIngresosEl || !yoyGastosEl || !yoyBalanceEl) return;

  const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
  const prevKey = previousYearMonthKey(monthKey);
  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const curr = StatsUtils.monthTotals(all, monthKey, statsByMonth);
  const prev = StatsUtils.monthTotals(all, prevKey, statsByMonth);

  yoyTitleEl.textContent = `${monthKey} vs ${prevKey}`;

  const i = fmtDelta(curr.ingresos, prev.ingresos);
  yoyIngresosEl.className = i.cls;
  yoyIngresosEl.textContent = i.text;

  const g = fmtDeltaExpense(curr.gastos, prev.gastos);
  yoyGastosEl.className = g.cls;
  yoyGastosEl.textContent = g.text;

  const b = fmtDelta(curr.balance, prev.balance);
  yoyBalanceEl.className = b.cls;
  yoyBalanceEl.textContent = b.text;
}

function drawYoyMiniChart(current, previous, monthKey, prevKey) {
  if (!yoyMiniChartEl) return;
  const width = yoyMiniChartEl.clientWidth || 280;
  const height = yoyMiniChartEl.clientHeight || 78;
  const ctx = setupCanvas(yoyMiniChartEl, width, height);
  ctx.clearRect(0, 0, width, height);

  const max = Math.max(1, current, previous);
  const top = 10;
  const bottom = height - 18;
  const h = bottom - top;

  const prevX = Math.round(width * 0.3);
  const currX = Math.round(width * 0.7);
  const barW = Math.max(22, Math.min(36, Math.round(width * 0.12)));
  const prevH = (previous / max) * h;
  const currH = (current / max) * h;
  const prevY = bottom - prevH;
  const currY = bottom - currH;

  const prevColor = selectedTheme === "dark" ? "#60a5fa" : "#3b82f6";
  const currColor = current <= previous ? "#22c55e" : "#ef4444";
  const axisColor = selectedTheme === "dark" ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.28)";
  const textColor = getCssVar("--muted", "#6b7280");

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, bottom + 0.5);
  ctx.lineTo(width - 8, bottom + 0.5);
  ctx.stroke();

  ctx.fillStyle = prevColor;
  fillRoundedRect(ctx, prevX - barW / 2, prevY, barW, prevH, 6);
  ctx.fillStyle = currColor;
  fillRoundedRect(ctx, currX - barW / 2, currY, barW, currH, 6);

  ctx.fillStyle = textColor;
  ctx.font = `10px ${getFontFamily()}`;
  ctx.textAlign = "center";
  ctx.fillText(monthLabel(prevKey).split(" ")[0], prevX, height - 4);
  ctx.fillText(monthLabel(monthKey).split(" ")[0], currX, height - 4);
}

function renderBudgetStatus(all) {
  if (!budgetListEl) return;

  const spentByCategory = {};
  all.forEach((x) => {
    if (x.tipo !== "Gasto") return;
    if (getMonth(x.fecha) !== CURRENT_MONTH) return;
    spentByCategory[x.categoria] = (spentByCategory[x.categoria] || 0) + Number(x.monto);
  });

  const categoriesWithBudget = CATEGORIAS.Gasto.filter((c) => Number(budgets[c] || 0) > 0);
  if (categoriesWithBudget.length === 0) {
    budgetListEl.innerHTML = `<li class="muted">No hay presupuestos cargados para el mes actual.</li>`;
    return;
  }

  budgetListEl.innerHTML = categoriesWithBudget.map((cat) => {
    const budget = Number(budgets[cat] || 0);
    const spent = Number(spentByCategory[cat] || 0);
    const diff = budget - spent;
    const statusClass = diff >= 0 ? "saldo-pos" : "saldo-neg";
    return `
      <li class="budget-item">
        <span>${cat}</span>
        <small>Presupuesto: ${money(budget)} \u00B7 Gastado: ${money(spent)}</small>
        <strong class="${statusClass}">${diff >= 0 ? "Restante" : "Exceso"}: ${money(Math.abs(diff))}</strong>
      </li>
    `;
  }).join("");
}

function renderBudgetSummary(all, selectedMonth) {
  if (!budgetSummaryListEl) return;

  const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
  const spentByCategory = {};
  all.forEach((x) => {
    if (x.tipo !== "Gasto") return;
    if (getMonth(x.fecha) !== monthKey) return;
    spentByCategory[x.categoria] = (spentByCategory[x.categoria] || 0) + Number(x.monto);
  });

  const items = CATEGORIAS.Gasto
    .filter((cat) => Number(budgets[cat] || 0) > 0)
    .map((cat) => {
      const budget = Number(budgets[cat] || 0);
      const spent = Number(spentByCategory[cat] || 0);
      const pct = budget > 0 ? (spent / budget) * 100 : 0;
      const status = pct > 100 ? "bad" : pct >= 80 ? "warn" : "good";
      return { cat, budget, spent, pct, status };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  if (items.length === 0) {
    budgetSummaryListEl.innerHTML = "";
    return;
  }

  budgetSummaryListEl.innerHTML = `
    <h3 class="muted" style="margin: 2px 0 2px; font-size: 0.9rem;">Presupuesto por categoria (${monthLabel(monthKey)})</h3>
    ${items.map((x) => `
      <button type="button" class="budget-summary-item ${x.status}" data-budget-cat="${x.cat}">
        <div class="budget-summary-item-head">
          <strong>${CATEGORY_ICONS[x.cat] || "\u2022"} ${x.cat}</strong>
          <small>${money(x.spent)} / ${money(x.budget)} (${x.pct.toFixed(0)}%)</small>
        </div>
        <div class="budget-progress">
          <div class="budget-progress-bar" style="width:${Math.min(100, Math.max(0, x.pct))}%;"></div>
        </div>
      </button>
    `).join("")}
  `;
}

function refreshDetailCategoryOptions(rows) {
  if (!detailCategoryEl) return;
  const prev = detailCategoryEl.value || "Todos";
  const selectedType = detailTypeEl ? detailTypeEl.value : "Todos";
  const baseCategories =
    selectedType === "Gasto"
      ? CATEGORIAS.Gasto
      : selectedType === "Ingreso"
        ? CATEGORIAS.Ingreso
        : [...CATEGORIAS.Gasto, ...CATEGORIAS.Ingreso];
  const dataCategories = rows
    .filter((x) => selectedType === "Todos" || x.tipo === selectedType)
    .map((x) => x.categoria)
    .filter(Boolean);
  const categories = ["Todos", ...new Set([...baseCategories, ...dataCategories])];
  detailCategoryEl.innerHTML = categories
    .map((c) => `<option value="${c}">${c === "Todos" ? "\u2195 Todos" : `${CATEGORY_ICONS[c] || "\u2022"} ${c}`}</option>`)
    .join("");
  detailCategoryEl.value = categories.includes(prev) ? prev : "Todos";
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

function computeMonthlySummary(all, monthKey) {
  const rows =
    monthKey === "Todos"
      ? all
      : all.filter((x) => getMonth(x.fecha) === monthKey);

  let ingresos = 0;
  let gastos = 0;

  rows.forEach((x) => {
    if (x.tipo === "Ingreso") ingresos += Number(x.monto);
    else gastos += Number(x.monto);
  });

  const balanceValue = ingresos - gastos;
  return { ingresos, gastos, balanceValue, rows };
}

function updateMonthlySummaryUI(summary) {
  const { ingresos, gastos, balanceValue } = summary;
  ingresosEl.textContent = money(ingresos);
  gastosEl.textContent = money(gastos);
  balanceEl.textContent = money(balanceValue);
  balanceEl.classList.remove("saldo-pos", "saldo-neg", "saldo-neu");
  balanceEl.classList.add(
    balanceValue > 0 ? "saldo-pos" : balanceValue < 0 ? "saldo-neg" : "saldo-neu"
  );
}

function drawBalanceSparkline(all) {
  if (!balanceSparklineEl) return;
  const width = balanceSparklineEl.clientWidth || 220;
  const height = balanceSparklineEl.clientHeight || 46;
  const ctx = setupCanvas(balanceSparklineEl, width, height);
  ctx.clearRect(0, 0, width, height);

  const keys = getRecentMonthKeys(6);
  const statsByMonth = StatsUtils.buildMonthlyStats(all);
  const points = keys.map((k) => StatsUtils.getMonthStats(statsByMonth, k).balance);
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 0);
  const range = Math.max(1, max - min);

  const left = 8;
  const right = width - 8;
  const top = 6;
  const bottom = height - 14;
  const step = points.length > 1 ? (right - left) / (points.length - 1) : 0;
  const yFor = (v) => bottom - ((v - min) / range) * (bottom - top);

  const axisY = yFor(0);
  ctx.strokeStyle = selectedTheme === "dark" ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, axisY);
  ctx.lineTo(right, axisY);
  ctx.stroke();

  const barW = Math.max(8, Math.min(18, (right - left) / (points.length * 1.8)));
  points.forEach((v, i) => {
    const x = left + i * step;
    const y = yFor(v);
    const h = Math.abs(y - axisY);
    const barX = x - barW / 2;
    const barY = v >= 0 ? y : axisY;
    ctx.fillStyle = v >= 0 ? "#22c55e" : "#ef4444";
    fillRoundedRect(ctx, barX, barY, barW, Math.max(1, h), 4);
  });

  const textColor = getCssVar("--muted", "#6b7280");
  ctx.fillStyle = textColor;
  ctx.font = `10px ${getFontFamily()}`;
  ctx.textAlign = "left";
  ctx.fillText(monthLabel(keys[0]).split(" ")[0], left, height - 2);
  ctx.textAlign = "right";
  ctx.fillText(monthLabel(keys[keys.length - 1]).split(" ")[0], right, height - 2);

  if (balanceTrendEl) {
    const endVal = points[points.length - 1] || 0;
    const prevVal = points[points.length - 2] || 0;
    const delta = endVal - prevVal;
    const trendIcon = delta > 0 ? "\u{1F4C8}" : delta < 0 ? "\u{1F4C9}" : "\u{27A1}";
    balanceTrendEl.textContent = `${trendIcon} Verde = ahorro, rojo = deficit. Ultimo balance: ${money(endVal)}`;
  }
}

function getFilteredDetailRows(all) {
  let detailRows = [...all];

  const filterType = detailTypeEl ? detailTypeEl.value : "Todos";
  const filterCategory = detailCategoryEl ? detailCategoryEl.value : "Todos";
  const filterFrom = detailFromEl ? detailFromEl.value : "";
  const filterTo = detailToEl ? detailToEl.value : "";
  const filterSearch = (detailSearchEl ? detailSearchEl.value : "").trim().toLowerCase();

  if (filterType !== "Todos") {
    detailRows = detailRows.filter((x) => x.tipo === filterType);
  }
  if (filterCategory !== "Todos") {
    detailRows = detailRows.filter((x) => x.categoria === filterCategory);
  }
  if (filterFrom) {
    detailRows = detailRows.filter((x) => String(x.fecha) >= filterFrom);
  }
  if (filterTo) {
    detailRows = detailRows.filter((x) => String(x.fecha) <= filterTo);
  }
  if (filterSearch) {
    detailRows = detailRows.filter((x) => {
      const hay = `${x.categoria} ${x.detalle || ""} ${x.tipo} ${x.fecha}`.toLowerCase();
      return hay.includes(filterSearch);
    });
  }

  return detailRows;
}

function updateDetailSummaryUI(detailRows) {
  const detailTotal = detailRows.reduce((acc, x) => acc + Number(x.monto || 0), 0);
  const detailCount = detailRows.length;
  const detailAvg = detailCount > 0 ? detailTotal / detailCount : 0;

  if (detailTotalEl) detailTotalEl.textContent = money(detailTotal);
  if (detailCountEl) detailCountEl.textContent = String(detailCount);
  if (detailAvgEl) detailAvgEl.textContent = money(detailAvg);
}

function updateCalendarAndAnalytics(all, detailRows, monthKey) {
  renderCalendar(detailRows);
  renderSelectedDayRows(detailRows);
  drawMonthlyIncomeExpenseChart(all);
  drawCategoryDonutChart(all, monthKey);
  renderMonthlyComparison(all, monthKey);
  renderLast3Months(all);
  renderSpendingAlert(all);
  renderYearOverYearTotals(all, monthKey);
  renderYearOverYearCategory(all, monthKey);
  renderBudgetSummary(all, monthKey);
  renderBudgetStatus(all);
}

function refresh() {
  const all = getAllSortedTransactions();
  const selectedMonth = updateMonthFilterOptions(all);

  const summary = computeMonthlySummary(all, CURRENT_MONTH);
  updateMonthlySummaryUI(summary);
  if (currentMonthLabelEl) currentMonthLabelEl.textContent = `Mes actual: ${monthLabel(CURRENT_MONTH)}`;
  drawBalanceSparkline(all);

  refreshDetailCategoryOptions(all);
  const detailRows = getFilteredDetailRows(all);
  currentDetailRows = detailRows;

  updateDetailSummaryUI(detailRows);
  updateCalendarAndAnalytics(all, detailRows, selectedMonth);
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
  if (authCardEl) authCardEl.hidden = logged || loadActiveTab() !== "mas";
  if (accountMiniEl) accountMiniEl.hidden = !logged || loadActiveTab() !== "mas";
  if (accountMiniEmailEl) accountMiniEmailEl.textContent = logged ? currentUser.email : "";
  if (cloudIndicatorEl) {
    cloudIndicatorEl.textContent = logged ? "Nube: Conectado" : "Nube: Local";
    cloudIndicatorEl.classList.toggle("ok", logged);
  }
  if (btnSignup) btnSignup.disabled = logged;
  if (btnLogin) btnLogin.disabled = logged;
  if (btnRecover) btnRecover.disabled = logged;
  if (btnLogout) btnLogout.disabled = !logged;
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

const NETWORK_TIMEOUT_MS = 12000;
const NETWORK_RETRY_ATTEMPTS = 2;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, init, timeoutMs = NETWORK_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildErrorResponse(message, status = 599) {
  const payload = JSON.stringify({ error: message, msg: message, message });
  return new Response(payload, {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function getResponseErrorMessage(resp) {
  if (!resp) return "Error de red";
  try {
    const data = await resp.clone().json();
    const msg = data?.msg || data?.error_description || data?.error || data?.message || data?.hint;
    if (msg) return String(msg);
  } catch {
    // Ignore JSON parse errors.
  }
  try {
    const txt = await resp.clone().text();
    const clean = String(txt || "").trim();
    if (clean) return clean.slice(0, 240);
  } catch {
    // Ignore text parse errors.
  }
  return `HTTP ${resp.status}`;
}

function getPayloadErrorMessage(data, resp) {
  const msg = data?.msg || data?.error_description || data?.error || data?.message || data?.hint;
  return msg || `HTTP ${resp.status}`;
}

async function sbFetch(path, options = {}) {
  const { method = "GET", body, auth = false, retry = true, timeoutMs = NETWORK_TIMEOUT_MS } = options;
  const upperMethod = String(method || "GET").toUpperCase();
  const canRetry = retry && (upperMethod === "GET" || upperMethod === "HEAD");
  const attempts = canRetry ? NETWORK_RETRY_ATTEMPTS : 1;
  const trackSync = options.trackSync ?? Boolean(currentUser);
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };

  if (auth && authSession?.access_token) {
    headers.Authorization = `Bearer ${authSession.access_token}`;
  }

  let closed = false;
  const closeSync = (ok) => {
    if (closed || !trackSync) return;
    closed = true;
    endSyncOperation(ok);
  };
  if (trackSync) beginSyncOperation();

  for (let i = 1; i <= attempts; i += 1) {
    try {
      const resp = await fetchWithTimeout(`${SUPABASE_URL}${path}`, {
        method: upperMethod,
        headers,
        body: body ? JSON.stringify(body) : undefined
      }, timeoutMs);

      if (canRetry && (resp.status >= 500 || resp.status === 429) && i < attempts) {
        await wait(260 * i);
        continue;
      }
      closeSync(resp.ok);
      return resp;
    } catch (err) {
      if (i < attempts) {
        await wait(260 * i);
        continue;
      }
      if (err?.name === "AbortError") {
        closeSync(false);
        return buildErrorResponse("Tiempo de espera agotado al conectar con la nube.", 504);
      }
      closeSync(false);
      return buildErrorResponse("No se pudo conectar con la nube. Revisa internet.", 599);
    }
  }

  closeSync(false);
  return buildErrorResponse("Error de red inesperado.", 599);
}

async function refreshAuthToken() {
  if (!authSession?.refresh_token) return false;

  const resp = await sbFetch("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: authSession.refresh_token },
    auth: false
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data?.access_token) {
    clearSession();
    return false;
  }

  saveSession(data);
  return true;
}

async function sbAuthFetch(path, options = {}, retry = true) {
  let resp = await sbFetch(path, { ...options, auth: true });
  if (resp.status !== 401 || !retry) return resp;

  const ok = await refreshAuthToken();
  if (!ok) return resp;

  resp = await sbFetch(path, { ...options, auth: true });
  return resp;
}

async function fetchCurrentUser() {
  if (!authSession?.access_token) return null;

  const resp = await sbAuthFetch("/auth/v1/user", { method: "GET" });
  if (!resp.ok) return null;

  return resp.json();
}

async function loadCloudData() {
  if (!currentUser) {
    txData = loadTx();
    refresh();
    return;
  }

  const resp = await sbAuthFetch(
    "/rest/v1/movimientos?select=id,fecha,tipo,categoria,monto,detalle&order=fecha.desc,created_at.desc",
    { method: "GET" }
  );

  if (!resp.ok) {
    const msg = await getResponseErrorMessage(resp);
    setStatus(`Error cargando nube: ${msg}`);
    txData = loadTx();
    refresh();
    return;
  }

  const data = await resp.json().catch(() => []);
  txData = (data || []).map((r) => ({
    id: r.id,
    fecha: String(r.fecha).slice(0, 10),
    tipo: r.tipo,
    categoria: r.categoria,
    monto: Number(r.monto),
    detalle: r.detalle || ""
  }));
  saveTx(txData);
  refresh();
}

async function seedCloudIfEmpty() {
  if (!currentUser) return;

  const checkResp = await sbAuthFetch(
    "/rest/v1/movimientos?select=id&limit=1",
    { method: "GET" }
  );
  if (!checkResp.ok) return;

  const existing = await checkResp.json().catch(() => []);
  if (Array.isArray(existing) && existing.length > 0) return;

  const localData = loadTx();
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
    setStatus(`No se pudo migrar historico: ${msg}`);
  }
}

async function signup() {
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || password.length < 6) {
    setStatus("Completa email y contrase\u00f1a (m\u00ednimo 6 caracteres).");
    return;
  }

  const resp = await sbFetch("/auth/v1/signup", {
    method: "POST",
    body: { email, password },
    auth: false
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = getPayloadErrorMessage(data, resp);
    setStatus(`Error al crear cuenta: ${msg}`);
    return;
  }

  if (data?.access_token) {
    applyRememberPreference();
    saveSession(data);
    currentUser = data.user || null;
    setAuthButtons();
    setStatus(`Conectado como ${currentUser?.email || email}`);
    await seedCloudIfEmpty();
    await loadCloudData();
  } else {
    setStatus("Cuenta creada. Revisa tu email para confirmar y luego inicia sesion.");
  }
}

async function login() {
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    setStatus("Ingresa email y contrase\u00f1a.");
    return;
  }

  const resp = await sbFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
    auth: false
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data?.access_token) {
    const msg = getPayloadErrorMessage(data, resp);
    setStatus(`Error de inicio de sesion: ${msg}`);
    return;
  }

  applyRememberPreference();
  saveSession(data);
  currentUser = data.user || null;
  setAuthButtons();
  setStatus(`Conectado como ${currentUser?.email || email}`);
  await seedCloudIfEmpty();
  await loadCloudData();
}

async function recoverPassword() {
  const email = emailEl.value.trim();
  if (!email) {
    setStatus("Escribe tu email para recuperar contrase\u00f1a.");
    return;
  }

  const resp = await sbFetch("/auth/v1/recover", {
    method: "POST",
    body: { email },
    auth: false
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => null);
    const msg = getPayloadErrorMessage(data, resp);
    setStatus(`Error al enviar recuperacion: ${msg}`);
    return;
  }

  setStatus("Si el email existe, Supabase envio un correo de recuperacion.");
}

async function logout() {
  if (authSession?.access_token) {
    await sbAuthFetch("/auth/v1/logout", { method: "POST" }).catch(() => {});
  }
  clearSession();
  currentUser = null;
  txData = loadTx();
  setAuthButtons();
  updateEntryGate();
  refresh();
  setStatus("Sesion cerrada. Modo local activo.");
}

async function initAuth() {
  if (!authSession?.access_token) {
    currentUser = null;
    setStatus("Sin sesion. Puedes iniciar sesion para guardar en la nube.");
    setAuthButtons();
    txData = loadTx();
    refresh();
    return;
  }

  const user = await fetchCurrentUser();
  if (!user) {
    clearSession();
    currentUser = null;
    setStatus("Sesion expirada. Inicia sesion nuevamente.");
    setAuthButtons();
    txData = loadTx();
    refresh();
    return;
  }

  currentUser = user;
  setAuthButtons();
  setStatus(`Conectado como ${currentUser.email}`);
  await seedCloudIfEmpty();
  await loadCloudData();
}

async function addTransaction(tx) {
  if (!currentUser) {
    const all = loadTx();
    all.push(tx);
    saveTx(all);
    txData = all;
    refresh();
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
    setStatus(`Error guardando en nube: ${msg}`);
    return;
  }

  await loadCloudData();
}

async function updateTransaction(id, tx) {
  if (!currentUser) {
    const next = loadTx().map((x) => (String(x.id) === String(id) ? { ...x, ...tx, id: x.id } : x));
    saveTx(next);
    txData = next;
    refresh();
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
    setStatus(`Error actualizando en nube: ${msg}`);
    return false;
  }

  await loadCloudData();
  return true;
}

async function quickAddExpense(category) {
  lastQuickCategory = category;
  updateQuickAmountPlaceholder(category);
  const inputAmount = parseDecimalInputValue(quickAmountEl.value);
  const rememberedAmount = Number(quickAmounts[category] || 0);

  let amount = inputAmount > 0 ? inputAmount : rememberedAmount;
  if (amount <= 0) {
    const typed = prompt(`Importe para ${category}:`, "");
    amount = parseDecimalInputValue(typed);
  }

  if (!(amount > 0)) {
    setStatus("Importe invalido para carga rapida.");
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

  saveQuickAmounts({ ...quickAmounts, [category]: amount });
  updateQuickAmountPlaceholder(category);
  quickDetailEl.value = "";
  setStatus(`Carga rapida guardada: ${category} ${money(amount)}.`);
  showToast(`Guardado: ${category}`);
}

function updateQuickAmountPlaceholder(category = lastQuickCategory) {
  if (!quickAmountEl) return;
  const remembered = Number(quickAmounts[category] || 0);
  if (remembered > 0) {
    quickAmountEl.placeholder = `${remembered.toFixed(2)} (ultimo ${category.toLowerCase()})`;
  } else {
    quickAmountEl.placeholder = "0.00";
  }
}

function updateArsConvertVisibility() {
  if (!arsConvertBoxEl) return;
  const show =
    tipoEl.value === "Ingreso" &&
    categoriaEl.value === "Alquiler Depto Argentina" &&
    selectedCurrency === "USD";
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
  const ars = parseDecimalInputValue(arsAmountEl.value || 0);
  const rate = parseDecimalInputValue(arsRateEl.value || arsRate || 0);
  const spread = parseDecimalInputValue(spreadPctEl?.value || spreadPct || 0);
  if (!(ars > 0) || !(rate > 0)) {
    setStatus("No se pudo convertir: falta ARS o tipo de cambio.");
    return null;
  }
  saveArsRate(rate);
  if (spread >= 0) saveSpreadPct(spread);
  if (selectedCurrency === "ARS") return ars;
  const gross = ars / rate;
  const net = gross * (1 - (spread / 100));
  return net > 0 ? net : 0;
}

async function fetchArsRateForSelectedCurrency() {
  if (!arsRateEl) return;

  if (selectedCurrency === "ARS") {
    arsRateEl.value = "1";
    saveArsRate(1);
    updateArsResultPreview();
    return;
  }

  try {
    const resp = await fetch("https://open.er-api.com/v6/latest/ARS", { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const perArs = Number(data?.rates?.[selectedCurrency] || 0);
    if (!(perArs > 0)) throw new Error("sin cotizacion");
    const arsPerUnit = 1 / perArs;
    saveArsRate(arsPerUnit);
    arsRateEl.value = arsPerUnit.toFixed(4);
    updateArsResultPreview();
  } catch {
    if (arsRate > 0) {
      arsRateEl.value = Number(arsRate).toFixed(4);
      updateArsResultPreview();
      setStatus("No se pudo actualizar la cotizacion online. Se usa la ultima guardada.");
    } else {
      setStatus("No se pudo obtener tipo de cambio online.");
    }
  }
}

function updateArsResultPreview() {
  if (!arsResultEl || !arsAmountEl || !arsRateEl) return;
  const ars = parseDecimalInputValue(arsAmountEl.value || 0);
  const rate = parseDecimalInputValue(arsRateEl.value || 0);
  if (!(ars > 0) || !(rate > 0)) {
    arsResultEl.value = "";
    return;
  }
  const converted = selectedCurrency === "ARS" ? ars : ars / rate;
  arsResultEl.value = money(converted);
}

async function deleteTransaction(id) {
  if (!currentUser) {
    const next = loadTx().filter((x) => String(x.id) !== String(id));
    saveTx(next);
    txData = next;
    refresh();
    return;
  }

  const encodedId = encodeURIComponent(id);
  const resp = await sbAuthFetch(`/rest/v1/movimientos?id=eq.${encodedId}`, {
    method: "DELETE"
  });

  if (!resp.ok) {
    const msg = await getResponseErrorMessage(resp);
    setStatus(`Error eliminando en nube: ${msg}`);
    return;
  }

  await loadCloudData();
}

async function duplicateTransaction(id) {
  const base = txData.find((x) => String(x.id) === String(id));
  if (!base) {
    setStatus("No se encontro el movimiento para duplicar.");
    return;
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
  setStatus(`Movimiento duplicado en fecha ${today}.`);
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

if (chartMonthlyEl) {
  chartMonthlyEl.addEventListener("mousemove", (e) => handleMonthlyTooltip(e.clientX, e.clientY));
  chartMonthlyEl.addEventListener("mouseleave", hideChartTooltip);
  chartMonthlyEl.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleMonthlyTooltip(t.clientX, t.clientY);
  }, { passive: true });
  chartMonthlyEl.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleMonthlyTooltip(t.clientX, t.clientY);
  }, { passive: true });
  chartMonthlyEl.addEventListener("touchend", hideChartTooltip, { passive: true });
}

if (chartCategoryEl) {
  chartCategoryEl.addEventListener("mousemove", (e) => handleDonutTooltip(e.clientX, e.clientY));
  chartCategoryEl.addEventListener("mouseleave", hideChartTooltip);
  chartCategoryEl.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleDonutTooltip(t.clientX, t.clientY);
  }, { passive: true });
  chartCategoryEl.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleDonutTooltip(t.clientX, t.clientY);
  }, { passive: true });
  chartCategoryEl.addEventListener("touchend", hideChartTooltip, { passive: true });
}

if (rememberEl) {
  rememberEl.addEventListener("change", () => {
    applyRememberPreference();
    if (authSession?.access_token) saveSession(authSession);
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

if (btnGateLocal) {
  btnGateLocal.addEventListener("click", () => {
    if (entryGateEl) entryGateEl.hidden = true;
    setActiveTab("cargar");
    setStatus("Modo local activo.");
  });
}

if (btnGateLogin) {
  btnGateLogin.addEventListener("click", () => {
    if (entryGateEl) entryGateEl.hidden = true;
    setActiveTab("mas");
    if (emailEl) emailEl.focus();
  });
}

if (detailTypeEl) detailTypeEl.addEventListener("change", refresh);
if (detailCategoryEl) detailCategoryEl.addEventListener("change", refresh);
if (detailFromEl) detailFromEl.addEventListener("change", refresh);
if (detailToEl) detailToEl.addEventListener("change", refresh);
if (detailSearchEl) detailSearchEl.addEventListener("input", refresh);
if (yoyCategoryEl) yoyCategoryEl.addEventListener("change", refresh);
if (btnDetailClear) {
  btnDetailClear.addEventListener("click", () => {
    if (detailTypeEl) detailTypeEl.value = "Todos";
    if (detailCategoryEl) detailCategoryEl.value = "Todos";
    if (detailFromEl) detailFromEl.value = "";
    if (detailToEl) detailToEl.value = "";
    if (detailSearchEl) detailSearchEl.value = "";
    refresh();
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

let resizeTimer = null;
window.addEventListener("resize", () => {
  hideChartTooltip();
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => refresh(), 120);
});

window.addEventListener("scroll", hideChartTooltip, { passive: true });

btnSignup.addEventListener("click", async () => {
  try {
    setStatus("Creando cuenta...");
    await signup();
  } catch (err) {
    setStatus(`Fallo en Crear cuenta: ${err?.message || String(err)}`);
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    setStatus("Iniciando sesion...");
    await login();
  } catch (err) {
    setStatus(`Fallo en Iniciar sesion: ${err?.message || String(err)}`);
  }
});

btnRecover.addEventListener("click", async () => {
  try {
    setStatus("Enviando recuperacion...");
    await recoverPassword();
  } catch (err) {
    setStatus(`Fallo en Recuperar contrase\u00f1a: ${err?.message || String(err)}`);
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await logout();
  } catch (err) {
    setStatus(`Fallo en Cerrar sesion: ${err?.message || String(err)}`);
  }
});

btnLogoutMini.addEventListener("click", async () => {
  try {
    await logout();
  } catch (err) {
    setStatus(`Fallo en Cerrar sesion: ${err?.message || String(err)}`);
  }
});

btnQuickSuper.addEventListener("click", async () => quickAddExpense("Supermercado"));
btnQuickComp.addEventListener("click", async () => quickAddExpense("Compras"));
btnQuickSal.addEventListener("click", async () => quickAddExpense("Salidas"));
btnQuickGas.addEventListener("click", async () => quickAddExpense("Gasolina"));
btnQuickSuper.addEventListener("mouseenter", () => updateQuickAmountPlaceholder("Supermercado"));
btnQuickComp.addEventListener("mouseenter", () => updateQuickAmountPlaceholder("Compras"));
btnQuickSal.addEventListener("mouseenter", () => updateQuickAmountPlaceholder("Salidas"));
btnQuickGas.addEventListener("mouseenter", () => updateQuickAmountPlaceholder("Gasolina"));

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
    await disableServiceWorkerCache();
    setupBudgetCategoryOptions();
    setupYoyCategoryOptions();
    updateCategoryOptions(tipoEl.value);
    updateArsConvertVisibility();
    if (arsRateEl) arsRateEl.value = Number(arsRate).toFixed(4);
    if (spreadPctEl) spreadPctEl.value = Number(spreadPct).toFixed(1);
    await bootstrapHistorico();
    runCategoryMigration();
    txData = loadTx();
    if (currencyEl) currencyEl.value = selectedCurrency;
    if (themeEl) themeEl.value = selectedTheme;
    if (rememberEl) rememberEl.checked = loadRememberMe();
    applyTheme(selectedTheme);
    setActiveTab("cargar");
    updateQuickAmountPlaceholder();
    updateArsConvertVisibility();
    refresh();
    await initAuth();
    updateEntryGate();
  } catch (err) {
    setStatus(`Error al iniciar app: ${err?.message || String(err)}`);
  }
})();
