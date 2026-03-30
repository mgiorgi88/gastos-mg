export function bindAppEvents({
  form,
  handleFormSubmit,
  filtroMes,
  setHasUserChosenMonth,
  setCalendarMonthDate,
  setSelectedDayKey,
  refresh,
  currencyEl,
  saveCurrency,
  updateArsConvertVisibility,
  arsConvertBoxEl,
  fetchArsRateForSelectedCurrency,
  updateArsResultPreview,
  themeEl,
  saveTheme,
  applyTheme,
  analysisPanelEl,
  hideChartTooltip,
  bindChartInteractions,
  rememberEl,
  applyRememberPreference,
  getAuthSession,
  saveSession,
  emailEl,
  validateEmailField,
  passwordEl,
  validatePasswordField,
  tipoEl,
  updateCategoryOptions,
  categoriaEl,
  tabBtns,
  setActiveTab,
  lista,
  startEditTransaction,
  startDuplicateDraftTransaction,
  deleteTransaction,
  calPrevEl,
  calNextEl,
  moveCalendarMonth,
  calGridEl,
  setShowAllFilteredRows,
  btnCancelEdit,
  resetTransactionForm,
  setStatus,
  btnEmptyStartEl,
  btnEmptyGoCargarEl,
  montoEl,
  btnGateSignin,
  btnGateSignup,
  entryGateEl,
  detailTypeEl,
  detailCategoryEl,
  detailFromEl,
  detailToEl,
  detailSearchEl,
  yoyPeriodAEl,
  yoyPeriodBEl,
  yoyCategoryEl,
  btnDetailClear,
  resetDetailFilters,
  setTopExpenseTempFilterActive,
  topExpensesListEl,
  monthExpenseCategoryListEl,
  monthIncomeCategoryListEl,
  CURRENT_MONTH,
  toDateKeyLocal,
  monthLabel,
  scrollToMovimientosSection,
  budgetSummaryListEl,
  showToast,
  btnExportExcel,
  exportFilteredToExcel,
  btnDownloadTemplate,
  downloadImportTemplate,
  btnImportFile,
  handleImportFileClick,
  btnClearMyData,
  clearMyData,
  runAsyncAction,
  btnSignup,
  setAuthActionBusy,
  signup,
  clearAuthActionBusy,
  btnLogin,
  login,
  btnRecover,
  recoverPassword,
  btnResetPassword,
  updatePassword,
  btnCancelRecovery,
  cancelRecovery,
  btnLogout,
  logout,
  btnLogoutMini,
  quickButtons,
  quickAddExpense,
  quickCategorySelects,
  syncQuickCategorySelectOptions,
  refreshQuickConfigValidation,
  btnQuickConfigSave,
  saveQuickCategoriesFromUi,
  btnQuickConfigReset,
  resetQuickCategories,
  btnSavingsGoalSave,
  saveSavingsGoalFromUi,
  btnSavingsGoalClear,
  clearSavingsGoalFromUi,
  btnConvertArs,
  convertArsToSelectedCurrency,
  arsResultEl,
  money,
  getSelectedCurrency,
  btnRefreshRate,
  arsAmountEl,
  spreadPctEl,
  parseDecimalInputValue,
  saveSpreadPct,
  btnBudgetSave,
  budgetCategoryEl,
  budgetAmountEl,
  getBudgets,
  saveBudgets
}) {
  function applyMonthlyCategoryFilter(type, category) {
    const [yy, mm] = CURRENT_MONTH.split("-").map(Number);
    const monthFrom = `${yy}-${String(mm).padStart(2, "0")}-01`;
    const monthTo = toDateKeyLocal(new Date(yy, mm, 0));

    if (detailTypeEl) detailTypeEl.value = type;
    if (detailCategoryEl) detailCategoryEl.value = category;
    if (detailFromEl) detailFromEl.value = monthFrom;
    if (detailToEl) detailToEl.value = monthTo;
    if (detailSearchEl) detailSearchEl.value = "";

    setTopExpenseTempFilterActive(type === "Gasto");
    setShowAllFilteredRows(true);
    setSelectedDayKey(null);
    setCalendarMonthDate(new Date(yy, mm - 1, 1));

    setActiveTab("mas");
    refresh();
    scrollToMovimientosSection();
    setStatus(`Filtro aplicado: ${type === "Ingreso" ? "ingresos" : "gastos"} de ${category} en ${monthLabel(CURRENT_MONTH)}.`);
  }

  form.addEventListener("submit", handleFormSubmit);

  filtroMes.addEventListener("change", () => {
    setHasUserChosenMonth(true);
    if (filtroMes.value && filtroMes.value !== "Todos") {
      const [yy, mm] = filtroMes.value.split("-").map(Number);
      if (yy && mm) {
        setCalendarMonthDate(new Date(yy, mm - 1, 1));
        setSelectedDayKey(null);
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
      applyTheme(themeEl.value);
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
      if (getAuthSession()?.access_token) saveSession(getAuthSession());
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
      startDuplicateDraftTransaction(id);
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
      setShowAllFilteredRows(false);
      setSelectedDayKey(cell.getAttribute("data-date"));
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
      if (montoEl) montoEl.focus();
    });
  }

  if (btnEmptyGoCargarEl) {
    btnEmptyGoCargarEl.addEventListener("click", () => {
      setActiveTab("cargar");
      if (montoEl) montoEl.focus();
    });
  }

  if (btnGateSignin) {
    btnGateSignin.addEventListener("click", () => {
      if (entryGateEl) entryGateEl.hidden = true;
      setActiveTab("opciones");
      setStatus("Ingresa tu email y contrase\u00f1a para iniciar sesi\u00f3n.");
      if (emailEl) emailEl.focus();
    });
  }

  if (btnGateSignup) {
    btnGateSignup.addEventListener("click", () => {
      if (entryGateEl) entryGateEl.hidden = true;
      setActiveTab("opciones");
      setStatus("Completa email y contrase\u00f1a, luego pulsa Crear cuenta.");
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
      setShowAllFilteredRows(false);
      setTopExpenseTempFilterActive(false);
      refresh();
    });
  }

  if (topExpensesListEl) {
    topExpensesListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-top-expense-cat]");
      if (!btn) return;
      const cat = btn.getAttribute("data-top-expense-cat");
      if (!cat) return;
      applyMonthlyCategoryFilter("Gasto", cat);
    });
  }

  [monthExpenseCategoryListEl, monthIncomeCategoryListEl].forEach((listEl) => {
    if (!listEl) return;
    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-month-category][data-month-category-type]");
      if (!btn) return;
      const category = btn.getAttribute("data-month-category");
      const type = btn.getAttribute("data-month-category-type");
      if (!category || !type) return;
      applyMonthlyCategoryFilter(type, category);
    });
  });

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
      setSelectedDayKey(null);
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

  if (btnResetPassword) {
    btnResetPassword.addEventListener("click", async () => {
      await runAsyncAction(async () => {
        setAuthActionBusy(btnResetPassword, "Guardando nueva contraseña...");
        setStatus("Actualizando contraseña...", "info");
        await updatePassword();
      }, (err) => `Fallo en Actualizar contraseña: ${err?.message || String(err)}`);
      clearAuthActionBusy();
    });
  }

  if (btnCancelRecovery) {
    btnCancelRecovery.addEventListener("click", async () => {
      await runAsyncAction(
        async () => cancelRecovery(),
        (err) => `Fallo en Cancelar recuperación: ${err?.message || String(err)}`
      );
      clearAuthActionBusy();
    });
  }

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
      if (montoEl) montoEl.value = converted.toFixed(2);
      if (arsResultEl) arsResultEl.value = money(converted);
      setStatus(`Convertido a ${getSelectedCurrency()}: ${money(converted)}.`);
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
    const next = { ...getBudgets() };
    if (amount > 0) next[cat] = amount;
    else delete next[cat];
    saveBudgets(next);
    budgetAmountEl.value = "";
    setStatus(`Presupuesto actualizado para ${cat}.`);
    refresh();
  });
}
