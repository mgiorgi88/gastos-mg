export function getMonth(dateStr) {
  return String(dateStr).slice(0, 7);
}

export function buildMonthOptions(all, currentMonthKey) {
  const months = [...new Set(all.map((x) => getMonth(x.fecha)))];
  const ordered = [currentMonthKey, ...months.filter((m) => m !== currentMonthKey)];
  return [
    { value: currentMonthKey, label: `Mes actual (${currentMonthKey})` },
    ...ordered.filter((m, i) => i > 0).map((m) => ({ value: m, label: m })),
    { value: "Todos", label: "Todos" }
  ];
}

export function getLast3MonthKeys(baseDate = new Date()) {
  const keys = [];
  for (let i = 1; i <= 3; i += 1) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    keys.push(key);
  }
  return keys;
}

export function monthLabel(key) {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [y, m] = String(key).split("-");
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${monthNames[idx]} ${y}`;
}

export function previousMonthKey(monthKey, fallbackMonthKey) {
  const [y, m] = String(monthKey).split("-").map(Number);
  if (!y || !m) return fallbackMonthKey;
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(d);
}

export function formatMonthTitle(date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function toDateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
