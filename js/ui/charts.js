export function createChartsUi({
  analysisPanelEl,
  chartMonthlyEl,
  chartMonthlyInsightEl,
  chartMonthlyLegendEl,
  chartCategoryEl,
  chartCategoryInsightEl,
  chartCategoryLegendEl,
  yoyMiniChartEl,
  yoyMiniLegendEl,
  balanceSparklineEl,
  balanceTrendEl,
  CURRENT_MONTH,
  getSelectedTheme,
  money,
  monthLabel,
  StatsUtils
}) {
  let chartTooltipEl = null;
  let monthlyTooltipPoints = [];
  let donutTooltipSlices = [];
  let interactionsBound = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function getCssVar(name, fallback = "#3b82f6") {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function getFontFamily() {
    return getCssVar("--font-main", "Helvetica Neue, Helvetica, Arial, sans-serif");
  }

  function setupCanvas(canvas, width, height) {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return ctx;
  }

  function ensureChartTooltip() {
    if (chartTooltipEl) return chartTooltipEl;
    const el = document.createElement("div");
    el.className = "chart-tooltip";
    el.hidden = true;
    document.body.appendChild(el);
    chartTooltipEl = el;
    return el;
  }

  function hideChartTooltip() {
    if (!chartTooltipEl) return;
    chartTooltipEl.classList.remove("show");
    chartTooltipEl.hidden = true;
  }

  function showChartTooltip(clientX, clientY, title, line, color = "#3b82f6") {
    const el = ensureChartTooltip();
    el.innerHTML = `
      <div class="chart-tooltip-title">${escapeHtml(title)}</div>
      <div class="chart-tooltip-line">
        <i class="chart-tooltip-dot" style="background:${color}"></i>
        <span>${escapeHtml(line)}</span>
      </div>
    `;
    el.hidden = false;
    el.classList.add("show");

    const pad = 10;
    const tooltipRect = el.getBoundingClientRect();
    let left = clientX + 14;
    let top = clientY + 14;

    if (left + tooltipRect.width + pad > window.innerWidth) {
      left = clientX - tooltipRect.width - 14;
    }
    if (top + tooltipRect.height + pad > window.innerHeight) {
      top = clientY - tooltipRect.height - 14;
    }

    left = Math.max(pad, left);
    top = Math.max(pad, top);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function normalizeAngle(value) {
    const full = Math.PI * 2;
    let v = value;
    while (v < 0) v += full;
    while (v >= full) v -= full;
    return v;
  }

  function fillRoundedRect(ctx, x, y, w, h, r = 4) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
      return;
    }
    ctx.fillRect(x, y, w, h);
  }

  function getRecentMonthKeys(count = 6) {
    const keys = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }

  function getRecentMonthKeysFrom(anchorMonthKey, count = 6) {
    const [y, m] = String(anchorMonthKey || "").split("-").map(Number);
    if (!y || !m) return getRecentMonthKeys(count);

    const keys = [];
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(y, m - 1 - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }

  function drawMonthlyIncomeExpenseChart(all, selectedMonth = CURRENT_MONTH) {
    if (!chartMonthlyEl) return;
    if (analysisPanelEl && !analysisPanelEl.open) return;
    monthlyTooltipPoints = [];

    const width = chartMonthlyEl.clientWidth || 300;
    const height = chartMonthlyEl.clientHeight || 250;
    const ctx = setupCanvas(chartMonthlyEl, width, height);
    ctx.clearRect(0, 0, width, height);

    const anchorMonth = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
    const keys = getRecentMonthKeysFrom(anchorMonth, 6);
    const statsByMonth = StatsUtils.buildMonthlyStats(all);
    const rows = keys.map((k) => {
      const s = StatsUtils.getMonthStats(statsByMonth, k);
      return { key: k, ingresos: s.ingresos, gastos: s.gastos };
    });

    const maxVal = Math.max(1, ...rows.flatMap((r) => [r.ingresos, r.gastos]));
    const left = 36;
    const right = width - 10;
    const top = 16;
    const bottom = height - 26;
    const chartW = right - left;
    const chartH = bottom - top;
    const groupW = chartW / rows.length;
    const barW = Math.min(14, (groupW - 8) / 2);
    const gridColor = getSelectedTheme() === "dark" ? "rgba(148, 163, 184, 0.18)" : "rgba(100, 116, 139, 0.22)";

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i += 1) {
      const y = top + (chartH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    const incomeColor = "#22c55e";
    const expenseColor = "#ef4444";
    const textColor = getCssVar("--muted", "#6b7280");
    const fontFamily = getFontFamily();
    ctx.font = `11px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;

    rows.forEach((r, idx) => {
      const gx = left + idx * groupW + groupW / 2;
      const hIn = (r.ingresos / maxVal) * chartH;
      const hEx = (r.gastos / maxVal) * chartH;
      const monthTitle = monthLabel(r.key);
      const ingresoX = gx - barW - 2;
      const ingresoY = bottom - hIn;
      const gastoX = gx + 2;
      const gastoY = bottom - hEx;

      ctx.fillStyle = incomeColor;
      fillRoundedRect(ctx, ingresoX, ingresoY, barW, hIn, 4);
      ctx.fillStyle = expenseColor;
      fillRoundedRect(ctx, gastoX, gastoY, barW, hEx, 4);

      monthlyTooltipPoints.push({ month: monthTitle, type: "Ingresos", value: r.ingresos, color: incomeColor, x: ingresoX, y: ingresoY, w: barW, h: Math.max(hIn, 1) });
      monthlyTooltipPoints.push({ month: monthTitle, type: "Gastos", value: r.gastos, color: expenseColor, x: gastoX, y: gastoY, w: barW, h: Math.max(hEx, 1) });

      ctx.fillStyle = textColor;
      ctx.fillText(monthLabel(r.key).split(" ")[0], gx, height - 8);
    });

    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    if (chartMonthlyInsightEl && last && prev) {
      const delta = last.gastos - prev.gastos;
      const pct = prev.gastos > 0 ? `${Math.abs((delta / prev.gastos) * 100).toFixed(1)}%` : "n/a";
      const icon = delta > 0 ? "??" : delta < 0 ? "??" : "?";
      const trendWord = delta > 0 ? "subieron" : delta < 0 ? "bajaron" : "estables";
      let streakText = "";
      if (rows.length >= 3) {
        const g0 = rows[rows.length - 3].gastos;
        const g1 = rows[rows.length - 2].gastos;
        const g2 = rows[rows.length - 1].gastos;
        if (g2 < g1 && g1 < g0) streakText = " ?? 2 meses seguidos bajando gastos.";
        else if (g2 > g1 && g1 > g0) streakText = " ?? 2 meses seguidos subiendo gastos.";
      }
      chartMonthlyInsightEl.textContent = `${icon} Gastos ${trendWord}: ${money(Math.abs(delta))} (${pct}) vs mes anterior.${streakText}`;
    }

    if (chartMonthlyLegendEl) {
      chartMonthlyLegendEl.innerHTML = `
        <span class="chart-legend-item"><i class="chart-swatch" style="background:${incomeColor}"></i>Ingresos</span>
        <span class="chart-legend-item"><i class="chart-swatch" style="background:${expenseColor}"></i>Gastos</span>
      `;
    }
  }

  function drawCategoryDonutChart(all, selectedMonth) {
    if (!chartCategoryEl) return;
    if (analysisPanelEl && !analysisPanelEl.open) return;
    donutTooltipSlices = [];

    const monthKey = selectedMonth === "Todos" ? CURRENT_MONTH : selectedMonth;
    const byCategory = {};
    all.forEach((x) => {
      if (x.tipo !== "Gasto") return;
      if (getMonth(x.fecha) !== monthKey) return;
      byCategory[x.categoria] = (byCategory[x.categoria] || 0) + Number(x.monto);
    });

    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const width = chartCategoryEl.clientWidth || 300;
    const height = chartCategoryEl.clientHeight || 250;
    const ctx = setupCanvas(chartCategoryEl, width, height);
    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) {
      if (chartCategoryInsightEl) chartCategoryInsightEl.textContent = "Sin gastos para el mes seleccionado.";
      if (chartCategoryLegendEl) chartCategoryLegendEl.innerHTML = "";
      ctx.fillStyle = getCssVar("--muted", "#6b7280");
      ctx.textAlign = "center";
      ctx.font = `13px ${getFontFamily()}`;
      ctx.fillText("Sin datos", width / 2, height / 2);
      return;
    }

    const palette = ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd", "#1d4ed8", "#38bdf8", "#0ea5e9"];
    const total = entries.reduce((acc, [, v]) => acc + v, 0);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.43;
    let start = -Math.PI / 2;

    const topEntries = entries.slice(0, 7);
    topEntries.forEach(([cat, val], idx) => {
      const angle = (val / total) * Math.PI * 2;
      const end = start + angle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.fillStyle = palette[idx % palette.length];
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fill();
      donutTooltipSlices.push({
        category: cat,
        value: val,
        pct: ((val / total) * 100).toFixed(1),
        color: palette[idx % palette.length],
        cx,
        cy,
        outerR: r,
        innerR: r * 0.56,
        start: normalizeAngle(start),
        end: normalizeAngle(end),
        wraps: normalizeAngle(end) < normalizeAngle(start)
      });
      start = end;
    });

    ctx.beginPath();
    ctx.fillStyle = getCssVar("--bg", "#f6f7f9");
    ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
    ctx.fill();

    const [topCat, topVal] = entries[0];
    const share = ((topVal / total) * 100).toFixed(1);
    const top3Share = ((topEntries.slice(0, 3).reduce((acc, [, v]) => acc + v, 0) / total) * 100).toFixed(1);
    const fontFamily = getFontFamily();
    ctx.fillStyle = getCssVar("--ink", "#111827");
    ctx.textAlign = "center";
    ctx.font = `bold 13px ${fontFamily}`;
    ctx.fillText(`${share}%`, cx, cy - 2);
    ctx.fillStyle = getCssVar("--muted", "#6b7280");
    ctx.font = `11px ${fontFamily}`;
    ctx.fillText(topCat, cx, cy + 14);

    if (chartCategoryInsightEl) {
      const ratioText = `${Math.round((Number(share) / 100) * 10)}/10`;
      chartCategoryInsightEl.textContent = `?? Mayor categoria: ${topCat} (${share}%). Peso: ${ratioText} del gasto mensual. Top 3: ${top3Share}%.`;
    }

    if (chartCategoryLegendEl) {
      chartCategoryLegendEl.innerHTML = topEntries.slice(0, 5).map(([cat, val], idx) => {
        const pct = ((val / total) * 100).toFixed(1);
        return `<span class="chart-legend-item"><i class="chart-swatch" style="background:${palette[idx % palette.length]}"></i>${cat} (${pct}%)</span>`;
      }).join("");
    }
  }

  function drawYoyMiniChart(current, previous, monthKey, prevKey) {
    if (!yoyMiniChartEl) return;
    const width = yoyMiniChartEl.clientWidth || 280;
    const height = yoyMiniChartEl.clientHeight || 78;
    const ctx = setupCanvas(yoyMiniChartEl, width, height);
    ctx.clearRect(0, 0, width, height);

    const max = Math.max(1, current, previous);
    const top = 10;
    const bottom = height - 18;
    const h = bottom - top;

    const prevX = Math.round(width * 0.3);
    const currX = Math.round(width * 0.7);
    const barW = Math.max(22, Math.min(36, Math.round(width * 0.12)));
    const prevH = (previous / max) * h;
    const currH = (current / max) * h;
    const prevY = bottom - prevH;
    const currY = bottom - currH;

    const prevColor = getSelectedTheme() === "dark" ? "#60a5fa" : "#3b82f6";
    const currColor = current <= previous ? "#22c55e" : "#ef4444";
    const axisColor = getSelectedTheme() === "dark" ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.28)";
    const textColor = getCssVar("--muted", "#6b7280");

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, bottom + 0.5);
    ctx.lineTo(width - 8, bottom + 0.5);
    ctx.stroke();

    ctx.fillStyle = prevColor;
    fillRoundedRect(ctx, prevX - barW / 2, prevY, barW, prevH, 6);
    ctx.fillStyle = currColor;
    fillRoundedRect(ctx, currX - barW / 2, currY, barW, currH, 6);

    ctx.fillStyle = textColor;
    ctx.font = `10px ${getFontFamily()}`;
    ctx.textAlign = "center";
    ctx.fillText(monthLabel(prevKey).split(" ")[0], prevX, height - 4);
    ctx.fillText(monthLabel(monthKey).split(" ")[0], currX, height - 4);

    if (yoyMiniLegendEl) {
      const prevLabel = `Periodo B (${monthLabel(prevKey)})`;
      const currLabel = `Periodo A (${monthLabel(monthKey)})`;
      yoyMiniLegendEl.innerHTML = `
        <span class="chart-legend-item"><i class="chart-swatch" style="background:${prevColor}"></i>${prevLabel}</span>
        <span class="chart-legend-item"><i class="chart-swatch" style="background:${currColor}"></i>${currLabel}</span>
      `;
    }
  }

  function drawBalanceSparkline(all) {
    if (!balanceSparklineEl) return;
    const width = balanceSparklineEl.clientWidth || 220;
    const height = balanceSparklineEl.clientHeight || 46;
    const ctx = setupCanvas(balanceSparklineEl, width, height);
    ctx.clearRect(0, 0, width, height);

    const keys = getRecentMonthKeys(6);
    const statsByMonth = StatsUtils.buildMonthlyStats(all);
    const points = keys.map((k) => StatsUtils.getMonthStats(statsByMonth, k).balance);
    const min = Math.min(...points, 0);
    const max = Math.max(...points, 0);
    const range = Math.max(1, max - min);

    const left = 8;
    const right = width - 8;
    const top = 6;
    const bottom = height - 14;
    const step = points.length > 1 ? (right - left) / (points.length - 1) : 0;
    const yFor = (v) => bottom - ((v - min) / range) * (bottom - top);

    const axisY = yFor(0);
    ctx.strokeStyle = getSelectedTheme() === "dark" ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, axisY);
    ctx.lineTo(right, axisY);
    ctx.stroke();

    const barW = Math.max(8, Math.min(18, (right - left) / (points.length * 1.8)));
    points.forEach((v, i) => {
      const x = left + i * step;
      const y = yFor(v);
      const h = Math.abs(y - axisY);
      const barX = x - barW / 2;
      const barY = v >= 0 ? y : axisY;
      ctx.fillStyle = v >= 0 ? "#22c55e" : "#ef4444";
      fillRoundedRect(ctx, barX, barY, barW, Math.max(1, h), 4);
    });

    const textColor = getCssVar("--muted", "#6b7280");
    ctx.fillStyle = textColor;
    ctx.font = `10px ${getFontFamily()}`;
    ctx.textAlign = "left";
    ctx.fillText(monthLabel(keys[0]).split(" ")[0], left, height - 2);
    ctx.textAlign = "right";
    ctx.fillText(monthLabel(keys[keys.length - 1]).split(" ")[0], right, height - 2);

    if (balanceTrendEl) {
      const endVal = points[points.length - 1] || 0;
      const prevVal = points[points.length - 2] || 0;
      const delta = endVal - prevVal;
      const trendIcon = delta > 0 ? "??" : delta < 0 ? "??" : "?";
      balanceTrendEl.textContent = `${trendIcon} Verde = ahorro, rojo = deficit. Ultimo balance: ${money(endVal)}`;
    }
  }

  function handleMonthlyTooltip(clientX, clientY) {
    if (!chartMonthlyEl || monthlyTooltipPoints.length === 0) {
      hideChartTooltip();
      return;
    }
    const rect = chartMonthlyEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const directHit = monthlyTooltipPoints.find((p) => (
      x >= p.x - 3 &&
      x <= p.x + p.w + 3 &&
      y >= p.y - 3 &&
      y <= p.y + p.h + 3
    ));

    let hit = directHit;
    if (!hit) {
      const snapRadius = 28;
      let best = null;
      let bestDist = Number.POSITIVE_INFINITY;
      monthlyTooltipPoints.forEach((p) => {
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      });
      if (best && bestDist <= snapRadius) hit = best;
    }

    if (!hit) {
      hideChartTooltip();
      return;
    }
    showChartTooltip(clientX, clientY, hit.month, `${hit.type}: ${money(hit.value)}`, hit.color);
  }

  function handleDonutTooltip(clientX, clientY) {
    if (!chartCategoryEl || donutTooltipSlices.length === 0) {
      hideChartTooltip();
      return;
    }
    const rect = chartCategoryEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dx = x - donutTooltipSlices[0].cx;
    const dy = y - donutTooltipSlices[0].cy;
    const dist = Math.hypot(dx, dy);
    const angle = normalizeAngle(Math.atan2(dy, dx));

    const hit = donutTooltipSlices.find((s) => {
      if (dist < s.innerR || dist > s.outerR) return false;
      if (s.wraps) return angle >= s.start || angle <= s.end;
      return angle >= s.start && angle <= s.end;
    });
    if (!hit) {
      hideChartTooltip();
      return;
    }
    showChartTooltip(clientX, clientY, hit.category, `${money(hit.value)} (${hit.pct}%)`, hit.color);
  }

  function bindChartInteractions() {
    if (interactionsBound) return;
    interactionsBound = true;

    if (chartMonthlyEl) {
      chartMonthlyEl.addEventListener("mousemove", (e) => handleMonthlyTooltip(e.clientX, e.clientY));
      chartMonthlyEl.addEventListener("mouseleave", hideChartTooltip);
      chartMonthlyEl.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        if (!t) return;
        handleMonthlyTooltip(t.clientX, t.clientY);
      }, { passive: true });
      chartMonthlyEl.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        if (!t) return;
        handleMonthlyTooltip(t.clientX, t.clientY);
      }, { passive: true });
      chartMonthlyEl.addEventListener("touchend", hideChartTooltip, { passive: true });
    }

    if (chartCategoryEl) {
      chartCategoryEl.addEventListener("mousemove", (e) => handleDonutTooltip(e.clientX, e.clientY));
      chartCategoryEl.addEventListener("mouseleave", hideChartTooltip);
      chartCategoryEl.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        if (!t) return;
        handleDonutTooltip(t.clientX, t.clientY);
      }, { passive: true });
      chartCategoryEl.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        if (!t) return;
        handleDonutTooltip(t.clientX, t.clientY);
      }, { passive: true });
      chartCategoryEl.addEventListener("touchend", hideChartTooltip, { passive: true });
    }
  }

  return {
    bindChartInteractions,
    drawBalanceSparkline,
    drawCategoryDonutChart,
    drawMonthlyIncomeExpenseChart,
    drawYoyMiniChart,
    hideChartTooltip
  };
}
