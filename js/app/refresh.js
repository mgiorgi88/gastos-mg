export function createRefreshController({
  filtroMes,
  summaryMonthPrevEl,
  summaryMonthNextEl,
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
  renderMonthCategoryBreakdown,
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
  function getNavigableMonthKeys() {
    return Array.from(filtroMes?.options || [])
      .map((option) => option.value)
      .filter((value) => value && value !== "Todos");
  }

  function updateSummaryMonthNavigation(selectedMonth) {
    const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
    const monthKeys = getNavigableMonthKeys();
    const selectedIndex = monthKeys.indexOf(monthKey);

    if (summaryMonthPrevEl) {
      summaryMonthPrevEl.disabled = selectedIndex < 0 || selectedIndex >= monthKeys.length - 1;
    }
    if (summaryMonthNextEl) {
      summaryMonthNextEl.disabled = selectedIndex <= 0;
    }
  }

  function updateMonthFilterOptions(all) {
    const options = buildMonthOptions(all, CURRENT_MONTH);
    const previous = filtroMes.value || CURRENT_MONTH;

    filtroMes.innerHTML = options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    const validValues = new Set(options.map((x) => x.value));
    const nextValue = getHasUserChosenMonth() && validValues.has(previous) ? previous : CURRENT_MONTH;
    filtroMes.value = nextValue;
    updateSummaryMonthNavigation(nextValue);
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
    const summaryMonth = monthKey === "Todos" ? CURRENT_MONTH : monthKey;
    renderCalendar(all);
    renderSelectedDayRows(detailRows);
    drawMonthlyIncomeExpenseChart(all, monthKey);
    drawCategoryDonutChart(all, monthKey);
    renderMonthlyComparison(all, monthKey);
    renderLast3Months(all, monthKey);
    renderSpendingAlert(all, summaryMonth);
    renderYearOverYearTotals(all, yoyPeriodA, yoyPeriodB);
    renderYearOverYearCategory(all, yoyPeriodA, yoyPeriodB);
    renderBudgetSummary(all, monthKey);
    renderBudgetStatus(all, summaryMonth);
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
    const summaryMonth = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;

    const summary = computeMonthlySummary(all, summaryMonth);
    const currentMonthSummary = computeMonthlySummary(all, CURRENT_MONTH);
    updateMonthlySummaryUI(summary, summaryMonth);
    updateLoadMonthlySummaryUI(currentMonthSummary);
    renderSavingsGoalSummary(summary.balanceValue, summaryMonth);
    renderTopExpensesCurrentMonth(all, summaryMonth);
    renderMonthCategoryBreakdown(all, summaryMonth);
    if (currentMonthLabelEl && !currentMonthLabelEl.textContent) {
      currentMonthLabelEl.textContent = `Mes actual: ${monthLabel(CURRENT_MONTH)}`;
    }
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
