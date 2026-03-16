export function createSummaryUi({
  CATEGORIAS,
  CATEGORY_ICONS,
  CURRENT_MONTH,
  ingresosEl,
  gastosEl,
  balanceEl,
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
  getBudgets,
  getSavingsGoal,
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
}) {
  function previousYearMonthKey(monthKey) {
    const [y, m] = String(monthKey || "").split("-").map(Number);
    if (!y || !m) return monthKey;
    return `${String(y - 1)}-${String(m).padStart(2, "0")}`;
  }

  function renderMonthlyComparison(all, selectedMonth) {
    if (!cmpTitleEl || !cmpIngresosEl || !cmpGastosEl || !cmpBalanceEl) return;
    const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
    const prevKey = (() => {
      const [y, m] = monthKey.split("-").map(Number);
      const d = new Date(y, m - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();
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

    if (!cmpSummaryEl) return;

    const hasCurrData = curr.ingresos > 0 || curr.gastos > 0;
    const hasPrevData = prev.ingresos > 0 || prev.gastos > 0;
    if (!hasCurrData && !hasPrevData) {
      cmpSummaryEl.textContent = "Sin movimientos en ninguno de los dos meses.";
      return;
    }

    const deltas = [
      { label: "ingresos", value: curr.ingresos - prev.ingresos },
      { label: "gastos", value: curr.gastos - prev.gastos },
      { label: "balance", value: curr.balance - prev.balance }
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    const strongest = deltas[0];
    if (!(Math.abs(strongest.value) > 0)) {
      cmpSummaryEl.textContent = `Mes muy parecido a ${monthLabel(prevKey)}, sin cambios relevantes en ingresos, gastos ni balance.`;
      return;
    }

    const label = strongest.label === "gastos" ? "el gasto" : strongest.label === "ingresos" ? "los ingresos" : "el balance";
    const trendText = strongest.value > 0 ? "subieron" : "bajaron";
    cmpSummaryEl.textContent = `La mayor variacion estuvo en ${label}: ${trendText} ${money(Math.abs(strongest.value))} frente a ${monthLabel(prevKey)}.`;
  }

  function renderLast3Months(all, selectedMonth = CURRENT_MONTH) {
    if (!trend3mEl) return;

    const anchorMonth = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
    const monthKeys = [];
    const [yy, mm] = anchorMonth.split("-").map(Number);
    for (let i = 0; i < 6; i += 1) {
      const d = new Date(yy, mm - 1 - i, 1);
      monthKeys.unshift(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
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
    spendingAlertEl.className = "summary-alert";

    const statsByMonth = StatsUtils.buildMonthlyStats(all);
    const current = StatsUtils.getMonthStats(statsByMonth, CURRENT_MONTH).gastos;
    const last3Keys = (() => {
      const keys = [];
      const now = new Date();
      for (let i = 1; i <= 3; i += 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      return keys;
    })();
    const prevValues = last3Keys
      .map((key) => StatsUtils.getMonthStats(statsByMonth, key).gastos)
      .filter((v) => v > 0);

    if (current <= 0 || prevValues.length === 0) {
      spendingAlertEl.classList.add("summary-alert-neutral");
      spendingAlertEl.textContent = "Sin datos suficientes para comparar gasto mensual.";
      return;
    }

    const avg = prevValues.reduce((a, b) => a + b, 0) / prevValues.length;
    if (!(avg > 0)) {
      spendingAlertEl.classList.add("summary-alert-neutral");
      spendingAlertEl.textContent = "Sin datos suficientes para comparar gasto mensual.";
      return;
    }

    const delta = current - avg;
    const pct = (delta / avg) * 100;
    const absPct = Math.abs(pct).toFixed(1);
    const avgLabel = money(avg);

    const currentRows = all.filter((x) => x.tipo === "Gasto" && getMonth(x.fecha) === CURRENT_MONTH);
    const byCategory = {};
    currentRows.forEach((x) => {
      byCategory[x.categoria] = (byCategory[x.categoria] || 0) + Number(x.monto || 0);
    });
    const topCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topCategorySuffix = topCategoryEntry ? ` Lidera ${topCategoryEntry[0]} con ${money(topCategoryEntry[1])}.` : "";

    if (pct <= -10) {
      spendingAlertEl.classList.add("summary-alert-good");
      spendingAlertEl.textContent = `Gasto del mes ${absPct}% por debajo del promedio 3M (${avgLabel}).${topCategorySuffix}`;
      return;
    }
    if (pct >= 10) {
      spendingAlertEl.classList.add("summary-alert-bad");
      spendingAlertEl.textContent = `Alerta: gasto del mes ${absPct}% por encima del promedio 3M (${avgLabel}).${topCategorySuffix}`;
      return;
    }

    spendingAlertEl.classList.add("summary-alert-warn");
    spendingAlertEl.textContent = `Gasto del mes en linea con el promedio 3M (${avgLabel}).${topCategorySuffix}`;
  }

  function renderYearOverYearCategory(all, periodA = CURRENT_MONTH, periodB = previousYearMonthKey(CURRENT_MONTH)) {
    if (!yoySummaryEl || !yoyCategoryEl) return;
    const monthKey = periodA === "Todos" ? CURRENT_MONTH : periodA;
    const prevKey = periodB === "Todos" ? previousYearMonthKey(CURRENT_MONTH) : periodB;
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

  function renderYearOverYearTotals(all, periodA = CURRENT_MONTH, periodB = previousYearMonthKey(CURRENT_MONTH)) {
    if (!yoyTitleEl || !yoyIngresosEl || !yoyGastosEl || !yoyBalanceEl) return;

    const monthKey = periodA === "Todos" ? CURRENT_MONTH : periodA;
    const prevKey = periodB === "Todos" ? previousYearMonthKey(CURRENT_MONTH) : periodB;
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

  function renderBudgetStatus(all) {
    if (!budgetListEl) return;
    const budgets = getBudgets();
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
          <small>Presupuesto: ${money(budget)} - Gastado: ${money(spent)}</small>
          <strong class="${statusClass}">${diff >= 0 ? "Restante" : "Exceso"}: ${money(Math.abs(diff))}</strong>
        </li>
      `;
    }).join("");
  }

  function renderBudgetSummary(all, selectedMonth) {
    if (!budgetSummaryListEl) return;
    const budgets = getBudgets();
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

  function setSavingsGoalStatus(message, tone = "neutral") {
    if (!savingsGoalStatusEl) return;
    savingsGoalStatusEl.textContent = message;
    savingsGoalStatusEl.classList.remove("saldo-pos", "saldo-neg", "saldo-neu");
    if (tone === "ok") savingsGoalStatusEl.classList.add("saldo-pos");
    else if (tone === "error") savingsGoalStatusEl.classList.add("saldo-neg");
    else savingsGoalStatusEl.classList.add("saldo-neu");
  }

  function refreshSavingsGoalEditor() {
    const savingsGoal = getSavingsGoal();
    if (savingsGoalAmountEl) savingsGoalAmountEl.value = savingsGoal > 0 ? Number(savingsGoal).toFixed(2) : "";
    if (savingsGoal > 0) setSavingsGoalStatus(`Meta actual: ${money(savingsGoal)}.`, "ok");
    else setSavingsGoalStatus("Define una meta y la veras en el resumen del mes actual.", "neutral");
  }

  function renderSavingsGoalSummary(balanceValue) {
    if (!savingsGoalSummaryEl) return;
    const savingsGoal = getSavingsGoal();
    if (!(savingsGoal > 0)) {
      savingsGoalSummaryEl.hidden = true;
      savingsGoalSummaryEl.innerHTML = "";
      savingsGoalSummaryEl.classList.remove("goal-ok", "goal-low", "goal-deficit");
      return;
    }
    savingsGoalSummaryEl.hidden = false;

    const goal = Number(savingsGoal);
    const pct = goal > 0 ? (balanceValue / goal) * 100 : 0;
    const progress = Math.max(0, Math.min(100, pct));
    const delta = balanceValue - goal;
    const remaining = goal - balanceValue;
    const cls = balanceValue < 0 ? "goal-deficit" : delta >= 0 ? "goal-ok" : "goal-low";

    savingsGoalSummaryEl.classList.remove("goal-ok", "goal-low", "goal-deficit");
    savingsGoalSummaryEl.classList.add(cls);

    let statusLine = "";
    if (balanceValue < 0) {
      statusLine = `Deficit actual: ${money(Math.abs(balanceValue))}.`;
    } else if (delta >= 0) {
      statusLine = `Meta cumplida. Excedente: ${money(delta)}.`;
    } else {
      statusLine = `Faltan ${money(remaining)} para cumplir la meta.`;
    }

    savingsGoalSummaryEl.innerHTML = `
      <h3>Meta de ahorro mensual</h3>
      <p>Meta: ${money(goal)} - Actual: ${money(balanceValue)} (${pct.toFixed(1)}%)</p>
      <div class="savings-goal-progress">
        <div class="savings-goal-progress-bar" style="width:${progress}%;"></div>
      </div>
      <p class="${balanceValue < 0 ? "saldo-neg" : delta >= 0 ? "saldo-pos" : "saldo-neu"}">${statusLine}</p>
    `;
  }

  function saveSavingsGoalFromUi() {
    const amount = parseDecimalInputValue(savingsGoalAmountEl ? savingsGoalAmountEl.value : "");
    if (!(amount > 0)) {
      setSavingsGoalStatus("Ingresa una meta valida mayor a 0.", "error");
      showToast("Meta invalida");
      return;
    }
    saveSavingsGoal(amount);
    refreshSavingsGoalEditor();
    showToast("Meta guardada");
    setStatus(`Meta de ahorro actualizada: ${money(amount)}.`);
    return true;
  }

  function clearSavingsGoalFromUi() {
    saveSavingsGoal(0);
    refreshSavingsGoalEditor();
    showToast("Meta quitada");
    setStatus("Meta de ahorro eliminada.");
    return true;
  }

  function computeMonthlySummary(all, monthKey) {
    const rows = monthKey === "Todos" ? all : all.filter((x) => getMonth(x.fecha) === monthKey);
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
    balanceEl.classList.add(balanceValue > 0 ? "saldo-pos" : balanceValue < 0 ? "saldo-neg" : "saldo-neu");
  }

  function renderTopExpensesCurrentMonth(all) {
    if (!topExpensesListEl) return;

    const byCategory = {};
    let total = 0;
    all.forEach((x) => {
      if (x.tipo !== "Gasto") return;
      if (getMonth(x.fecha) !== CURRENT_MONTH) return;
      const amount = Number(x.monto || 0);
      if (!(amount > 0)) return;
      byCategory[x.categoria] = (byCategory[x.categoria] || 0) + amount;
      total += amount;
    });

    const top = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top.length === 0) {
      topExpensesListEl.innerHTML = '<li class="muted">Sin gastos cargados este mes.</li>';
      if (topExpensesNoteEl) topExpensesNoteEl.textContent = "Aun no hay categorias para detectar concentracion de gasto.";
      return;
    }

    topExpensesListEl.innerHTML = top
      .map(([cat, val], idx) => {
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
        return `
          <li>
            <button type="button" class="top-expenses-item" data-top-expense-cat="${cat}">
              <span class="top-expenses-rank">${idx + 1}.</span>
              <span class="top-expenses-cat">${cat}</span>
              <strong>${money(val)} (${pct}%)</strong>
            </button>
          </li>
        `;
      })
      .join("");

    if (topExpensesNoteEl) {
      const topShare = total > 0 ? (top.reduce((acc, [, val]) => acc + val, 0) / total) * 100 : 0;
      const [topCategory, topValue] = top[0];
      topExpensesNoteEl.textContent = `${topCategory} es la categoria que mas pesa este mes con ${money(topValue)}. El top 3 concentra ${topShare.toFixed(0)}% del gasto total.`;
    }
  }

  return {
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
  };
}

