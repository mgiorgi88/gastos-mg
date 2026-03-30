export function createCalendarUi({
  calTitleEl,
  calGridEl,
  dayTitleEl,
  lista,
  vacio,
  detailTypeEl,
  detailCategoryEl,
  detailFromEl,
  detailToEl,
  detailSearchEl,
  detailTotalEl,
  detailCountEl,
  detailAvgEl,
  movimientosSectionEl,
  getCalendarMonthDate,
  setCalendarMonthDate,
  getSelectedDayKey,
  setSelectedDayKey,
  getShowAllFilteredRows,
  formatDateLabel,
  formatMonthTitle,
  toDateKeyLocal,
  money,
  escapeHtml,
  getMonth,
  currentMonthKey
}) {
  function hasActiveDetailFilters() {
    return (
      (detailTypeEl?.value || "Todos") !== "Todos"
      || (detailCategoryEl?.value || "Todos") !== "Todos"
      || Boolean(detailFromEl?.value)
      || Boolean(detailToEl?.value)
      || Boolean(String(detailSearchEl?.value || "").trim())
    );
  }

  function resetDetailFilters() {
    if (detailTypeEl) detailTypeEl.value = "Todos";
    if (detailCategoryEl) detailCategoryEl.value = "Todos";
    if (detailFromEl) detailFromEl.value = "";
    if (detailToEl) detailToEl.value = "";
    if (detailSearchEl) detailSearchEl.value = "";
  }

  function moveCalendarMonth(offset) {
    const base = getCalendarMonthDate();
    setCalendarMonthDate(new Date(base.getFullYear(), base.getMonth() + offset, 1));
    setSelectedDayKey(null);
  }

  function renderCalendar(rows) {
    if (!calGridEl || !calTitleEl) return;
    const calendarMonthDate = getCalendarMonthDate();
    const selectedDayKey = getSelectedDayKey();
    calTitleEl.textContent = formatMonthTitle(calendarMonthDate);
    const first = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    const rowsByDate = {};
    rows.forEach((x) => {
      const key = String(x.fecha).slice(0, 10);
      if (!rowsByDate[key]) rowsByDate[key] = [];
      rowsByDate[key].push(x);
    });

    const todayKey = toDateKeyLocal(new Date());
    let html = "";
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const key = toDateKeyLocal(d);
      const inMonth = d.getMonth() === calendarMonthDate.getMonth();
      const items = rowsByDate[key] || [];
      const hasIncome = items.some((x) => x.tipo === "Ingreso");
      const hasExpense = items.some((x) => x.tipo === "Gasto");
      const classes = [
        "calendar-cell",
        inMonth ? "" : "calendar-cell-out",
        key === todayKey ? "today" : "",
        key === selectedDayKey ? "selected" : ""
      ].filter(Boolean).join(" ");
      html += `
        <button type="button" class="${classes}" data-date="${key}">
          <span class="calendar-num">${d.getDate()}</span>
          <span class="calendar-dots">
            ${hasIncome ? '<i class="dot income"></i>' : ""}
            ${hasExpense ? '<i class="dot expense"></i>' : ""}
          </span>
        </button>
      `;
    }
    calGridEl.innerHTML = html;
  }

  function renderSelectedDayRows(rows) {
    if (!lista || !vacio || !dayTitleEl) return;
    const selectedDayKey = getSelectedDayKey();
    const showAllFilteredRows = getShowAllFilteredRows();
    const filtersActive = hasActiveDetailFilters();

    let dayRows = [];
    if (showAllFilteredRows || filtersActive) {
      dayRows = rows;
      dayTitleEl.textContent = filtersActive ? "Movimientos filtrados" : "Movimientos del filtro rapido";
    } else if (selectedDayKey) {
      dayRows = rows.filter((x) => String(x.fecha).slice(0, 10) === selectedDayKey);
      dayTitleEl.textContent = `Movimientos del ${formatDateLabel(selectedDayKey)}`;
    } else {
      dayTitleEl.textContent = "";
    }

    lista.innerHTML = "";
    dayRows
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="tx-main">
            <span class="tx-cat">${escapeHtml(item.categoria)}</span>
            <span class="tx-date">${formatDateLabel(item.fecha)}</span>
          </div>
          <div class="tx-sub">
            <span class="pill ${String(item.tipo).toLowerCase()}">${item.tipo}</span>
            <span>${escapeHtml(item.detalle || "-")}</span>
          </div>
          <div class="tx-actions">
            <strong class="monto ${String(item.tipo).toLowerCase()}">${item.tipo === "Gasto" ? "-" : "+"}${money(Number(item.monto))}</strong>
            <button class="danger action-btn" data-action="duplicate" data-id="${item.id}" type="button"><span class="action-icon">\u29C9</span><span class="action-label">Repetir</span></button>
            <button class="danger action-btn" data-action="edit" data-id="${item.id}" type="button"><span class="action-icon">\u270E</span><span class="action-label">Editar</span></button>
            <button class="danger action-btn" data-action="delete" data-id="${item.id}" type="button"><span class="action-icon">\u{1F5D1}</span><span class="action-label">Eliminar</span></button>
          </div>
        `;
        lista.appendChild(li);
      });

    vacio.hidden = dayRows.length > 0;
  }

  function refreshDetailCategoryOptions(rows) {
    if (!detailCategoryEl) return;
    const prev = detailCategoryEl.value;
    const cats = [...new Set(rows.map((x) => x.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    detailCategoryEl.innerHTML = [
      '<option value="Todos">Todos</option>',
      ...cats.map((c) => `<option value="${c}">${c}</option>`)
    ].join("");
    detailCategoryEl.value = cats.includes(prev) || prev === "Todos" ? prev : "Todos";
  }

  function getFilteredDetailRows(all) {
    const selectedDayKey = getSelectedDayKey();
    const showAllFilteredRows = getShowAllFilteredRows();
    const filterType = detailTypeEl?.value || "Todos";
    const filterCategory = detailCategoryEl?.value || "Todos";
    const filterFrom = detailFromEl?.value || "";
    const filterTo = detailToEl?.value || "";
    const filterSearch = String(detailSearchEl?.value || "").trim().toLowerCase();
    const filtersActive = hasActiveDetailFilters();

    let detailRows = [...all];

    if (!showAllFilteredRows && !filtersActive && selectedDayKey) {
      detailRows = detailRows.filter((x) => String(x.fecha).slice(0, 10) === selectedDayKey);
    }
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

  function scrollToMovimientosSection() {
    if (!movimientosSectionEl) return;
    requestAnimationFrame(() => {
      movimientosSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return {
    getFilteredDetailRows,
    moveCalendarMonth,
    refreshDetailCategoryOptions,
    renderCalendar,
    renderSelectedDayRows,
    resetDetailFilters,
    scrollToMovimientosSection,
    updateDetailSummaryUI
  };
}
