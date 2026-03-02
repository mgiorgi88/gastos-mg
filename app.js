const KEY = "mis_gastos_v1";
const BOOTSTRAP_KEY = "mis_gastos_bootstrap_v1";
const MIGRATION_KEY = "mis_gastos_migration_v2";
const SESSION_KEY = "mis_gastos_supabase_session_v1";
const QUICK_AMOUNTS_KEY = "mis_gastos_quick_amounts_v1";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

const SUPABASE_URL = "https://gwtioxerklmzjssweqgm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rcTj1A_vRoeOQ7yDOjPQ7g_PlmfsQPs";

const form = document.getElementById("tx-form");
const quickAmountEl = document.getElementById("quick-amount");
const quickDetailEl = document.getElementById("quick-detail");
const btnQuickSuper = document.getElementById("btn-quick-super");
const btnQuickComp = document.getElementById("btn-quick-comp");
const btnQuickSal = document.getElementById("btn-quick-sal");
const btnQuickGas = document.getElementById("btn-quick-gas");
const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const filtroMes = document.getElementById("filtro-mes");
const trend3mEl = document.getElementById("trend-3m");
const detalleMovimientosEl = document.getElementById("detalle-movimientos");
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
  Ingreso: ["Sueldo", "Depositos"]
};

let currentUser = null;
let txData = [];
let hasUserChosenMonth = false;
let authSession = loadSession();
let quickAmounts = loadQuickAmounts();

document.getElementById("fecha").valueAsDate = new Date();

function money(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
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
    .map((categoria) => `<option value="${categoria}">${categoria}</option>`)
    .join("");
  categoriaEl.value = categorias.includes(selected) ? selected : (categorias[0] || "");
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

  lista.innerHTML = "";
  filtered.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="meta">
        <strong>${item.categoria}</strong>
        <small>${item.fecha} - ${item.tipo}${item.detalle ? " - " + item.detalle : ""}</small>
      </div>
      <div>
        <strong class="monto ${String(item.tipo).toLowerCase()}">${item.tipo === "Gasto" ? "-" : "+"}${money(Number(item.monto))}</strong>
        <button class="danger" data-id="${item.id}" type="button">Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });

  vacio.hidden = filtered.length > 0;
  renderLast3Months(all);
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

  await addTransaction({
    id: crypto.randomUUID(),
    fecha,
    tipo,
    monto,
    categoria,
    detalle
  });

  form.reset();
  document.getElementById("fecha").valueAsDate = new Date();
  tipoEl.value = "Gasto";
  updateCategoryOptions("Gasto");
});

filtroMes.addEventListener("change", () => {
  hasUserChosenMonth = true;
  refresh();
});

tipoEl.addEventListener("change", () => updateCategoryOptions(tipoEl.value));

lista.addEventListener("click", async (e) => {
  if (!e.target.matches("button[data-id]")) return;
  const id = e.target.getAttribute("data-id");
  await deleteTransaction(id);
});

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

(async () => {
  try {
    setStatus("Inicializando app...");
    await disableServiceWorkerCache();
    if (detalleMovimientosEl) detalleMovimientosEl.open = false;
    updateCategoryOptions(tipoEl.value);
    await bootstrapHistorico();
    runCategoryMigration();
    txData = loadTx();
    refresh();
    await initAuth();
  } catch (err) {
    setStatus(`Error al iniciar app: ${err?.message || String(err)}`);
  }
})();
