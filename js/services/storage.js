import {
  KEY,
  BUDGETS_KEY,
  ARS_RATE_KEY,
  SPREAD_PCT_KEY,
  THEME_KEY,
  CURRENCY_KEY,
  SAVINGS_GOAL_KEY,
  QUICK_CATS_KEY,
  SESSION_KEY,
  REMEMBER_ME_KEY,
  RECURRENTS_CACHE_KEY,
  RECURRENTS_OMIT_KEY_PREFIX
} from "../config/constants.js";

export function readJsonStorage(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(store, key, value) {
  store.setItem(key, JSON.stringify(value));
}

export function readNumericStorage(key, fallback) {
  const parsed = Number(localStorage.getItem(key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadTx() {
  return readJsonStorage(localStorage, KEY, []);
}

export function saveTx(items) {
  writeJsonStorage(localStorage, KEY, items);
}

export function loadBudgets() {
  return readJsonStorage(localStorage, BUDGETS_KEY, {});
}

export function saveBudgetsValue(data) {
  writeJsonStorage(localStorage, BUDGETS_KEY, data);
}

export function loadArsRate() {
  const value = readNumericStorage(ARS_RATE_KEY, 1100);
  return value > 0 ? value : 1100;
}

export function saveArsRateValue(value) {
  localStorage.setItem(ARS_RATE_KEY, String(value));
}

export function loadSpreadPct() {
  const value = readNumericStorage(SPREAD_PCT_KEY, 3);
  return value >= 0 ? value : 3;
}

export function saveSpreadPctValue(value) {
  localStorage.setItem(SPREAD_PCT_KEY, String(value));
}

export function loadTheme() {
  const valid = new Set(["light", "dark"]);
  const stored = localStorage.getItem(THEME_KEY) || "light";
  return valid.has(stored) ? stored : "light";
}

export function saveThemeValue(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadCurrency() {
  const valid = new Set(["EUR", "ARS", "USD"]);
  const stored = localStorage.getItem(CURRENCY_KEY) || "EUR";
  return valid.has(stored) ? stored : "EUR";
}

export function saveCurrencyValue(currency) {
  localStorage.setItem(CURRENCY_KEY, currency);
}

export function loadSavingsGoal() {
  const value = readNumericStorage(SAVINGS_GOAL_KEY, 0);
  return value > 0 ? value : 0;
}

export function saveSavingsGoalValue(value) {
  if (value > 0) localStorage.setItem(SAVINGS_GOAL_KEY, String(value));
  else localStorage.removeItem(SAVINGS_GOAL_KEY);
}

export function loadQuickCategoriesRaw() {
  return readJsonStorage(localStorage, QUICK_CATS_KEY, null);
}

export function saveQuickCategoriesValue(categories) {
  writeJsonStorage(localStorage, QUICK_CATS_KEY, categories);
}

export function loadRecurrentesCache() {
  return readJsonStorage(localStorage, RECURRENTS_CACHE_KEY, []);
}

export function saveRecurrentesCache(items) {
  writeJsonStorage(localStorage, RECURRENTS_CACHE_KEY, items);
}

export function clearRecurrentesCache() {
  localStorage.removeItem(RECURRENTS_CACHE_KEY);
}

export function loadRecurrentOmissions(monthKey) {
  return readJsonStorage(localStorage, `${RECURRENTS_OMIT_KEY_PREFIX}${monthKey}`, []);
}

export function saveRecurrentOmissions(monthKey, ids) {
  writeJsonStorage(localStorage, `${RECURRENTS_OMIT_KEY_PREFIX}${monthKey}`, ids);
}

export function loadSessionData() {
  const local = readJsonStorage(localStorage, SESSION_KEY, null);
  if (local?.access_token) {
    return { session: local, persistMode: "local" };
  }
  const session = readJsonStorage(sessionStorage, SESSION_KEY, null);
  if (session?.access_token) {
    return { session, persistMode: "session" };
  }
  return { session: null, persistMode: "local" };
}

export function loadRememberMe() {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  if (stored === null) return true;
  return stored === "1";
}

export function saveRememberMe(enabled) {
  localStorage.setItem(REMEMBER_ME_KEY, enabled ? "1" : "0");
}

export function saveSessionWithMode(session, persistMode) {
  if (persistMode === "session") {
    writeJsonStorage(sessionStorage, SESSION_KEY, session);
    localStorage.removeItem(SESSION_KEY);
  } else {
    writeJsonStorage(localStorage, SESSION_KEY, session);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function clearSessionStorage() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
