export const KEY = "mis_gastos_v1";
export const BOOTSTRAP_KEY = "mis_gastos_bootstrap_v1";
export const MIGRATION_KEY = "mis_gastos_migration_v2";
export const SESSION_KEY = "mis_gastos_supabase_session_v1";
export const CURRENCY_KEY = "mis_gastos_currency_v1";
export const BUDGETS_KEY = "mis_gastos_budgets_v1";
export const ARS_RATE_KEY = "mis_gastos_ars_rate_v1";
export const SPREAD_PCT_KEY = "mis_gastos_spread_pct_v1";
export const THEME_KEY = "mis_gastos_theme_v1";
export const ACTIVE_TAB_KEY = "mis_gastos_active_tab_v1";
export const REMEMBER_ME_KEY = "mis_gastos_remember_me_v1";
export const QUICK_CATS_KEY = "mis_gastos_quick_cats_v1";
export const SAVINGS_GOAL_KEY = "mis_gastos_savings_goal_v1";
export const RECURRENTS_CACHE_KEY = "mis_gastos_recurrentes_cache_v1";
export const RECURRENTS_OMIT_KEY_PREFIX = "mis_gastos_recurrentes_omitidos_";
export const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

export const SUPABASE_URL = "https://gwtioxerklmzjssweqgm.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_rcTj1A_vRoeOQ7yDOjPQ7g_PlmfsQPs";

export const CATEGORIAS = {
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

export const CATEGORY_ICONS = {
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

export const QUICK_CATEGORY_DEFAULTS = ["Supermercado", "Compras", "Salidas", "Gasolina"];
