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
const budgetCategoryEl = document.getElementById("budget-category");
const budgetAmountEl = document.getElementById("budget-amount");
const btnBudgetSave = document.getElementById("btn-budget-save");
const budgetListEl = document.getElementById("budget-list");
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

const emailEl = document.getElementById("auth-email");
const passwordEl = document.getElementById("auth-password");
const btnSignup = document.getElementById("btn-signup");
const btnLogin = document.getElementById("btn-login");
const btnRecover = document.getElementById("btn-recover");
const btnLogout = document.getElementById("btn-logout");
const authStatusEl = document.getElementById("auth-status");
const authCardEl = document.getElementById("auth-card");
const sessionBarEl = document.getElementById("session-bar");
const sessionEmailEl = document.getElementById("session-email");
const btnLogoutMini = document.getElementById("btn-logout-mini");

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
  Alquiler: "🏠",
  Hipoteca: "🏡",
  Supermercado: "🛒",
  Auto: "🚗",
  Seguro: "🛡️",
  Compras: "🛍️",
  Ropa: "👕",
  Servicios: "💡",
  Viajes: "✈️",
  Salidas: "🍽️",
  Gasolina: "⛽",
  Salud: "💊",
  Transporte: "🚌",
  Sueldo: "💼",
  Depositos: "🏦",
  "Alquiler Depto Argentina": "🏘️"
};

let currentUser = null;
let txData = [];
let hasUserChosenMonth = false;
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

function setStatus(msg) {
  if (authStatusEl) authStatusEl.textContent = msg;
  try {
    console.log("[GastosMG]", msg);
  } catch {
    // Ignore console issues.
  }
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
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  authSession = session;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  authSession = null;
  localStorage.removeItem(SESSION_KEY);
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
    const resp = await fetch("./historico.json", { cache: "no-store" });
    if (!resp.ok) return;

    const historico = await resp.json();
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
    .map((categoria) => `<option value="${categoria}">${CATEGORY_ICONS[categoria] || "•"} ${categoria}</option>`)
    .join("");
  categoriaEl.value = categorias.includes(selected) ? selected : (categorias[0] || "");
}

function setupBudgetCategoryOptions() {
  if (!budgetCategoryEl) return;
  budgetCategoryEl.innerHTML = CATEGORIAS.Gasto
    .map((c) => `<option value="${c}">${CATEGORY_ICONS[c] || "•"} ${c}</option>`)
    .join("");
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

function monthTotals(rows, monthKey) {
  let ingresos = 0;
  let gastos = 0;
  rows.forEach((x) => {
    if (getMonth(x.fecha) !== monthKey) return;
    if (x.tipo === "Ingreso") ingresos += Number(x.monto);
    else gastos += Number(x.monto);
  });
  return { ingresos, gastos, balance: ingresos - gastos };
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
  const curr = monthTotals(all, monthKey);
  const prev = monthTotals(all, prevKey);

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
  calGridEl.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const dateKey = toDateKeyLocal(date);
    const rowsForDay = rows.filter((x) => String(x.fecha).slice(0, 10) === dateKey);
    const hasIncome = rowsForDay.some((x) => x.tipo === "Ingreso");
    const hasExpense = rowsForDay.some((x) => x.tipo === "Gasto");
    const isOutMonth = !dateKey.startsWith(monthKey);
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDayKey;

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `calendar-cell${isOutMonth ? " out-month" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}`;
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
          <strong>${CATEGORY_ICONS[item.categoria] || "•"} ${item.categoria}</strong>
          <small>
            <span class="tx-type ${item.tipo === "Ingreso" ? "ingreso" : "gasto"}">${item.tipo === "Ingreso" ? "Ingreso" : "Gasto"}</span>
            ${item.detalle ? " - " + item.detalle : ""}
          </small>
        </div>
        <div class="item-actions">
          <strong class="monto ${String(item.tipo).toLowerCase()}">${item.tipo === "Gasto" ? "-" : "+"}${money(Number(item.monto))}</strong>
          <button class="danger" data-action="edit" data-id="${item.id}" type="button">Editar</button>
          <button class="danger" data-action="delete" data-id="${item.id}" type="button">Eliminar</button>
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

function renderLast3Months(all) {
  if (!trend3mEl) return;

  const monthKeys = getLast3MonthKeys();
  const cards = monthKeys.map((key) => {
    let ingresos = 0;
    let gastos = 0;

    all.forEach((x) => {
      if (getMonth(x.fecha) !== key) return;
      if (x.tipo === "Ingreso") ingresos += Number(x.monto);
      else gastos += Number(x.monto);
    });

    const saldo = ingresos - gastos;
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
        <small>Presupuesto: ${money(budget)} · Gastado: ${money(spent)}</small>
        <strong class="${statusClass}">${diff >= 0 ? "Restante" : "Exceso"}: ${money(Math.abs(diff))}</strong>
      </li>
    `;
  }).join("");
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
    .map((c) => `<option value="${c}">${c === "Todos" ? "↕ Todos" : `${CATEGORY_ICONS[c] || "•"} ${c}`}</option>`)
    .join("");
  detailCategoryEl.value = categories.includes(prev) ? prev : "Todos";
}

function refresh() {
  const all = [...txData].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const options = buildMonthOptions(all);

  const previous = filtroMes.value || CURRENT_MONTH;
  filtroMes.innerHTML = options
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join("");

  const validValues = new Set(options.map((x) => x.value));
  filtroMes.value = hasUserChosenMonth && validValues.has(previous) ? previous : CURRENT_MONTH;

  const filtered =
    filtroMes.value === "Todos" ? all : all.filter((x) => getMonth(x.fecha) === filtroMes.value);

  let ingresos = 0;
  let gastos = 0;
  filtered.forEach((x) => (x.tipo === "Ingreso" ? (ingresos += Number(x.monto)) : (gastos += Number(x.monto))));
  const balanceValue = ingresos - gastos;
  ingresosEl.textContent = money(ingresos);
  gastosEl.textContent = money(gastos);
  balanceEl.textContent = money(balanceValue);
  balanceEl.classList.remove("saldo-pos", "saldo-neg", "saldo-neu");
  balanceEl.classList.add(balanceValue > 0 ? "saldo-pos" : balanceValue < 0 ? "saldo-neg" : "saldo-neu");

  refreshDetailCategoryOptions(all);

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
  currentDetailRows = detailRows;

  const detailTotal = detailRows.reduce((acc, x) => acc + Number(x.monto || 0), 0);
  const detailCount = detailRows.length;
  const detailAvg = detailCount > 0 ? detailTotal / detailCount : 0;
  if (detailTotalEl) detailTotalEl.textContent = money(detailTotal);
  if (detailCountEl) detailCountEl.textContent = String(detailCount);
  if (detailAvgEl) detailAvgEl.textContent = money(detailAvg);

  renderCalendar(detailRows);
  renderSelectedDayRows(detailRows);
  renderMonthlyComparison(all, filtroMes.value);
  renderLast3Months(all);
  renderBudgetStatus(all);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
  if (authCardEl) authCardEl.hidden = logged;
  if (sessionBarEl) sessionBarEl.hidden = !logged;
  if (sessionEmailEl) sessionEmailEl.textContent = logged ? `Conectado como ${currentUser.email}` : "";
  if (btnSignup) btnSignup.disabled = logged;
  if (btnLogin) btnLogin.disabled = logged;
  if (btnRecover) btnRecover.disabled = logged;
  if (btnLogout) btnLogout.disabled = !logged;
  if (emailEl) emailEl.disabled = logged;
  if (passwordEl) passwordEl.disabled = logged;
  if (btnLogoutMini) btnLogoutMini.disabled = !logged;
}

async function sbFetch(path, options = {}) {
  const { method = "GET", body, auth = false } = options;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
  };

  if (auth && authSession?.access_token) {
    headers.Authorization = `Bearer ${authSession.access_token}`;
  }

  const resp = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return resp;
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
    const txt = await resp.text().catch(() => "");
    setStatus(`Error cargando nube: ${txt || resp.status}`);
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
    const txt = await resp.text().catch(() => "");
    setStatus(`No se pudo migrar historico: ${txt || resp.status}`);
  }
}

async function signup() {
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || password.length < 6) {
    setStatus("Completa email y contrasena (minimo 6 caracteres).");
    return;
  }

  const resp = await sbFetch("/auth/v1/signup", {
    method: "POST",
    body: { email, password },
    auth: false
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = data?.msg || data?.error_description || data?.error || `HTTP ${resp.status}`;
    setStatus(`Error al crear cuenta: ${msg}`);
    return;
  }

  if (data?.access_token) {
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
    setStatus("Ingresa email y contrasena.");
    return;
  }

  const resp = await sbFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
    auth: false
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data?.access_token) {
    const msg = data?.msg || data?.error_description || data?.error || `HTTP ${resp.status}`;
    setStatus(`Error de inicio de sesion: ${msg}`);
    return;
  }

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
    setStatus("Escribe tu email para recuperar contrasena.");
    return;
  }

  const resp = await sbFetch("/auth/v1/recover", {
    method: "POST",
    body: { email },
    auth: false
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => null);
    const msg = data?.msg || data?.error_description || data?.error || `HTTP ${resp.status}`;
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
    const txt = await resp.text().catch(() => "");
    setStatus(`Error guardando en nube: ${txt || resp.status}`);
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
    const txt = await resp.text().catch(() => "");
    setStatus(`Error actualizando en nube: ${txt || resp.status}`);
    return false;
  }

  await loadCloudData();
  return true;
}

async function quickAddExpense(category) {
  const inputAmount = Number(quickAmountEl.value);
  const rememberedAmount = Number(quickAmounts[category] || 0);

  let amount = inputAmount > 0 ? inputAmount : rememberedAmount;
  if (amount <= 0) {
    const typed = prompt(`Importe para ${category}:`, "");
    amount = Number(typed);
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
  quickDetailEl.value = "";
  setStatus(`Carga rapida guardada: ${category} ${money(amount)}.`);
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
  const ars = Number(arsAmountEl.value || 0);
  const rate = Number(arsRateEl.value || arsRate || 0);
  const spread = Number(spreadPctEl?.value || spreadPct || 0);
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
  const ars = Number(arsAmountEl.value || 0);
  const rate = Number(arsRateEl.value || 0);
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
    const txt = await resp.text().catch(() => "");
    setStatus(`Error eliminando en nube: ${txt || resp.status}`);
    return;
  }

  await loadCloudData();
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const tipo = tipoEl.value;
  const monto = Number(document.getElementById("monto").value);
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
      setStatus("Movimiento editado correctamente.");
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

  resetTransactionForm();
});

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
  });
}

tipoEl.addEventListener("change", () => updateCategoryOptions(tipoEl.value));
tipoEl.addEventListener("change", updateArsConvertVisibility);
categoriaEl.addEventListener("change", updateArsConvertVisibility);

lista.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id][data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "edit") {
    startEditTransaction(id);
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

if (detailTypeEl) detailTypeEl.addEventListener("change", refresh);
if (detailCategoryEl) detailCategoryEl.addEventListener("change", refresh);
if (detailFromEl) detailFromEl.addEventListener("change", refresh);
if (detailToEl) detailToEl.addEventListener("change", refresh);
if (detailSearchEl) detailSearchEl.addEventListener("input", refresh);
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

if (btnExportExcel) {
  btnExportExcel.addEventListener("click", () => {
    exportFilteredToExcel();
  });
}

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
    setStatus(`Fallo en Recuperar contrasena: ${err?.message || String(err)}`);
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
    const v = Number(spreadPctEl.value || 0);
    if (v >= 0) saveSpreadPct(v);
    updateArsResultPreview();
  });
}

btnBudgetSave.addEventListener("click", () => {
  const cat = budgetCategoryEl.value;
  const amount = Number(budgetAmountEl.value || 0);
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
    updateCategoryOptions(tipoEl.value);
    updateArsConvertVisibility();
    if (arsRateEl) arsRateEl.value = Number(arsRate).toFixed(4);
    if (spreadPctEl) spreadPctEl.value = Number(spreadPct).toFixed(1);
    await bootstrapHistorico();
    runCategoryMigration();
    txData = loadTx();
    if (currencyEl) currencyEl.value = selectedCurrency;
    if (themeEl) themeEl.value = selectedTheme;
    applyTheme(selectedTheme);
    updateArsConvertVisibility();
    refresh();
    await initAuth();
  } catch (err) {
    setStatus(`Error al iniciar app: ${err?.message || String(err)}`);
  }
})();
