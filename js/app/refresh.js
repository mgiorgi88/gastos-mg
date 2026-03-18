export function createRefreshController({
  filtroMes,
  yoyPeriodAEl,
  yoyPeriodBEl,
  cargarEmptyStateEl,
  resumenEmptyCardEl,
  resumenContentCards,
  getInitialDataReady,
  currentMonthLabelEl,
  CURRENT_MONTH,
  buildMonthOptions,
  monthLabel,
  previousYearMonthKey,
  getHasUserChosenMonth,
  getCurrentTab,
  getAllSortedTransactions,
  computeMonthlySummary,
  updateMonthlySummaryUI,
  updateLoadMonthlySummaryUI,
  renderSavingsGoalSummary,
  renderTopExpensesCurrentMonth,
  drawBalanceSparkline,
  renderRecurrentSuggestions,
  refreshDetailCategoryOptions,
  getFilteredDetailRows,
  setCurrentDetailRows,
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
}) {
  function updateMonthFilterOptions(all) {
    const options = buildMonthOptions(all, CURRENT_MONTH);
    const previous = filtroMes.value || CURRENT_MONTH;

    filtroMes.innerHTML = options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    const validValues = new Set(options.map((x) => x.value));
    const nextValue = getHasUserChosenMonth() && validValues.has(previous) ? previous : CURRENT_MONTH;
    filtroMes.value = nextValue;
    return nextValue;
  }

  function updateYoyPeriodOptions(all) {
    if (!yoyPeriodAEl || !yoyPeriodBEl) {
      return { periodA: CURRENT_MONTH, periodB: previousYearMonthKey(CURRENT_MONTH) };
    }

    const months = buildMonthOptions(all, CURRENT_MONTH)
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
    renderCalendar(all);
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
    const initialDataReady = getInitialDataReady();

    if (cargarEmptyStateEl) cargarEmptyStateEl.hidden = !initialDataReady || hasTransactions;
    if (resumenEmptyCardEl) resumenEmptyCardEl.hidden = !initialDataReady || hasTransactions;
    resumenContentCards.forEach((card) => {
      card.hidden = !hasTransactions || card.getAttribute("data-panel") !== "resumen" || getCurrentTab() !== "resumen";
    });

    const selectedMonth = updateMonthFilterOptions(all);
    const yoyPeriods = updateYoyPeriodOptions(all);

    const summary = computeMonthlySummary(all, CURRENT_MONTH);
    updateMonthlySummaryUI(summary);
    updateLoadMonthlySummaryUI(summary);
    renderSavingsGoalSummary(summary.balanceValue);
    renderTopExpensesCurrentMonth(all);
    if (currentMonthLabelEl) currentMonthLabelEl.textContent = `Mes actual: ${monthLabel(CURRENT_MONTH)}`;
    drawBalanceSparkline(all);
    renderRecurrentSuggestions();

    refreshDetailCategoryOptions(all);
    const detailRows = getFilteredDetailRows(all);
    setCurrentDetailRows(detailRows);

    updateDetailSummaryUI(detailRows);
    if (hasTransactions) {
      updateCalendarAndAnalytics(all, detailRows, selectedMonth, yoyPeriods.periodA, yoyPeriods.periodB);
    }
  }

  return {
    refresh,
    updateCalendarAndAnalytics,
    updateMonthFilterOptions,
    updateYoyPeriodOptions
  };
}
