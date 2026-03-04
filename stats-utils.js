(() => {
  /**
   * @typedef {Object} MonthStats
   * @property {number} ingresos
   * @property {number} gastos
   * @property {number} balance
   */

  const EMPTY_MONTH_STATS = Object.freeze({ ingresos: 0, gastos: 0, balance: 0 });

  function monthKeyFromDateStr(dateStr) {
    return String(dateStr || "").slice(0, 7);
  }

  /**
   * @param {Array<{fecha:string,tipo:string,monto:number}>} rows
   * @returns {Record<string, MonthStats>}
   */
  function buildMonthlyStats(rows) {
    const byMonth = {};
    (rows || []).forEach((x) => {
      const key = monthKeyFromDateStr(x.fecha);
      if (!key) return;
      const m = byMonth[key] || { ingresos: 0, gastos: 0, balance: 0 };
      if (x.tipo === "Ingreso") m.ingresos += Number(x.monto || 0);
      else m.gastos += Number(x.monto || 0);
      m.balance = m.ingresos - m.gastos;
      byMonth[key] = m;
    });
    return byMonth;
  }

  function getMonthStats(statsByMonth, key) {
    return statsByMonth?.[key] || EMPTY_MONTH_STATS;
  }

  function monthTotals(rows, monthKey, precomputedStats = null) {
    const stats = precomputedStats || buildMonthlyStats(rows);
    return getMonthStats(stats, monthKey);
  }

  window.StatsUtils = {
    EMPTY_MONTH_STATS,
    buildMonthlyStats,
    getMonthStats,
    monthTotals
  };
})();
