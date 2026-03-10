export function createImportExportService({
  CATEGORIAS,
  currentMonthKey,
  getSelectedCurrency,
  getCurrentUser,
  getTxData,
  getCurrentDetailRows,
  getImportFile,
  loadTx,
  saveTx,
  requireCloudSession,
  txSignature,
  getRefresh,
  loadCloudData,
  sbAuthFetch,
  getResponseErrorMessage,
  setImportStatus,
  setStatus,
  getAnimatePrimarySave,
  getFlashSavedFeedback,
  showToast,
  escapeHtml
}) {
  function normalizeHeaderName(name) {
    return String(name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "")
      .replaceAll("_", "");
  }

  function mapImportRow(raw) {
    const mapped = {};
    Object.entries(raw || {}).forEach(([k, v]) => {
      mapped[normalizeHeaderName(k)] = v;
    });
    return {
      fecha: mapped.fecha ?? mapped.date ?? mapped.dia,
      tipo: mapped.tipo ?? mapped.type,
      categoria: mapped.categoria ?? mapped.category,
      monto: mapped.monto ?? mapped.importe ?? mapped.amount ?? mapped.valor,
      detalle: mapped.detalle ?? mapped.descripcion ?? mapped.description ?? "",
      moneda: mapped.moneda ?? mapped.currency ?? ""
    };
  }

  function parseImportedAmount(value) {
    if (typeof value === "number") return value;
    let s = String(value || "").trim();
    if (!s) return NaN;
    s = s.replaceAll(" ", "");
    const comma = s.lastIndexOf(",");
    const dot = s.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      if (comma > dot) {
        s = s.replaceAll(".", "").replace(",", ".");
      } else {
        s = s.replaceAll(",", "");
      }
    } else if (comma >= 0) {
      s = s.replace(",", ".");
    }
    return Number(s);
  }

  function parseDecimalInputValue(value) {
    const n = parseImportedAmount(value);
    return Number.isFinite(n) ? n : 0;
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseImportedDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return formatDateKey(value);
    }
    if (typeof value === "number" && typeof XLSX !== "undefined" && XLSX?.SSF?.parse_date_code) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return "";
      const d = new Date(parsed.y, parsed.m - 1, parsed.d);
      return formatDateKey(d);
    }
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      const day = slash[1].padStart(2, "0");
      const month = slash[2].padStart(2, "0");
      return `${slash[3]}-${month}-${day}`;
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return formatDateKey(d);
  }

  function normalizeImportTipo(value) {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "";
    if (["ingreso", "income", "in"].includes(v)) return "Ingreso";
    if (["gasto", "expense", "egreso", "out"].includes(v)) return "Gasto";
    return "";
  }

  function normalizeImportCategoria(tipo, value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const all = [...CATEGORIAS.Gasto, ...CATEGORIAS.Ingreso];
    const direct = all.find((c) => c.toLowerCase() === raw.toLowerCase());
    if (direct) return direct;
    const alias = {
      diesel: "Gasolina",
      nafta: "Gasolina",
      deposito: "Depositos",
      depositos: "Depositos",
      alquilerdeptoargentina: "Alquiler Depto Argentina"
    };
    const k = raw.toLowerCase().replaceAll(" ", "");
    const mapped = alias[k];
    if (!mapped) return "";
    if (tipo === "Ingreso" && !CATEGORIAS.Ingreso.includes(mapped)) return "";
    if (tipo === "Gasto" && !CATEGORIAS.Gasto.includes(mapped)) return "";
    return mapped;
  }

  function parseCsvLine(line, sep) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === sep && !inQuotes) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((x) => x.trim());
  }

  function parseCsvRows(text) {
    const lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n")
      .filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
    const headers = parseCsvLine(lines[0], sep);
    return lines.slice(1).map((line) => {
      const cols = parseCsvLine(line, sep);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] ?? "";
      });
      return obj;
    });
  }

  async function parseImportFile(file) {
    const name = String(file?.name || "").toLowerCase();
    if (name.endsWith(".json")) {
      const text = await file.text();
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    }
    if (name.endsWith(".csv")) {
      const text = await file.text();
      return parseCsvRows(text);
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      if (typeof XLSX === "undefined") {
        throw new Error("No se pudo cargar soporte Excel. Revisa internet y recarga.");
      }
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const first = wb.SheetNames[0];
      if (!first) return [];
      return XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: "" });
    }
    throw new Error("Formato no soportado. Usa .xlsx, .csv o .json");
  }

  function normalizeImportedRows(rawRows) {
    const normalized = [];
    const errors = [];

    rawRows.forEach((raw, idx) => {
      const rowNum = idx + 2;
      const r = mapImportRow(raw);
      const fecha = parseImportedDate(r.fecha);
      const tipo = normalizeImportTipo(r.tipo);
      const categoria = normalizeImportCategoria(tipo, r.categoria);
      const monto = parseImportedAmount(r.monto);
      const detalle = String(r.detalle || "").trim();

      if (!fecha) {
        errors.push(`Fila ${rowNum}: fecha invalida.`);
        return;
      }
      if (!tipo) {
        errors.push(`Fila ${rowNum}: tipo invalido (usa Gasto o Ingreso).`);
        return;
      }
      if (!categoria) {
        errors.push(`Fila ${rowNum}: categoria invalida para tipo ${tipo}.`);
        return;
      }
      if (!(monto > 0)) {
        errors.push(`Fila ${rowNum}: monto invalido.`);
        return;
      }

      normalized.push({
        id: crypto.randomUUID(),
        fecha,
        tipo,
        categoria,
        monto: Number(monto),
        detalle
      });
    });

    return { normalized, errors };
  }

  async function importTransactions(rows) {
    if (rows.length === 0) return 0;

    const seen = new Set(getTxData().map(txSignature));
    const deduped = [];
    rows.forEach((x) => {
      const sig = txSignature(x);
      if (seen.has(sig)) return;
      seen.add(sig);
      deduped.push(x);
    });
    if (deduped.length === 0) return 0;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (!requireCloudSession("importar movimientos")) return 0;
      const all = loadTx();
      all.push(...deduped);
      saveTx(all);
      getRefresh()?.();
      return deduped.length;
    }

    const payload = deduped.map((x) => ({
      user_id: currentUser.id,
      fecha: x.fecha,
      tipo: x.tipo,
      categoria: x.categoria,
      monto: Number(x.monto),
      detalle: x.detalle || ""
    }));
    const resp = await sbAuthFetch("/rest/v1/movimientos", {
      method: "POST",
      body: payload
    });
    if (!resp.ok) {
      const msg = await getResponseErrorMessage(resp);
      throw new Error(msg);
    }
    await loadCloudData();
    return deduped.length;
  }

  function downloadImportTemplate() {
    const selectedCurrency = getSelectedCurrency();
    const headers = ["fecha", "tipo", "categoria", "monto", "detalle", "moneda"];
    const sampleRows = [
      ["2026-03-01", "Ingreso", "Sueldo", 2500, "Nomina marzo", selectedCurrency],
      ["2026-03-02", "Gasto", "Supermercado", 84.3, "Compra semanal", selectedCurrency],
      ["2026-03-03", "Gasto", "Gasolina", 52, "Repostaje", selectedCurrency]
    ];

    if (typeof XLSX === "undefined") {
      const csv = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gastos_mg_plantilla.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setImportStatus("Plantilla CSV descargada (sin soporte Excel).");
      return;
    }

    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 24 },
      { wch: 12 },
      { wch: 32 },
      { wch: 10 }
    ];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };

    const allCategories = [...CATEGORIAS.Gasto, ...CATEGORIAS.Ingreso];
    const listFormula = (values) => `"${values.join(",").replaceAll('"', '""')}"`;
    ws["!dataValidation"] = [
      {
        sqref: "B2:B2000",
        type: "list",
        allowBlank: true,
        formula1: listFormula(["Ingreso", "Gasto"])
      },
      {
        sqref: "C2:C2000",
        type: "list",
        allowBlank: true,
        formula1: listFormula(allCategories)
      },
      {
        sqref: "F2:F2000",
        type: "list",
        allowBlank: true,
        formula1: listFormula(["EUR", "USD", "ARS"])
      }
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    const catalogRows = [
      ["Tipos validos", "Categorias gasto", "Categorias ingreso"],
      ...Array.from({ length: Math.max(2, CATEGORIAS.Gasto.length, CATEGORIAS.Ingreso.length) }, (_, i) => [
        i < 2 ? (i === 0 ? "Ingreso" : "Gasto") : "",
        CATEGORIAS.Gasto[i] || "",
        CATEGORIAS.Ingreso[i] || ""
      ])
    ];
    const wsCatalog = XLSX.utils.aoa_to_sheet(catalogRows);
    wsCatalog["!cols"] = [{ wch: 16 }, { wch: 24 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsCatalog, "Catalogos");

    XLSX.writeFile(wb, "gastos_mg_plantilla.xlsx");
    setImportStatus("Plantilla Excel descargada.");
  }

  function exportFilteredToExcel() {
    const rows = [...getCurrentDetailRows()];
    if (rows.length === 0) {
      setStatus("No hay movimientos filtrados para exportar.");
      return;
    }

    const selectedCurrency = getSelectedCurrency();
    const header = `
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Categoria</th>
        <th>Detalle</th>
        <th>Monto</th>
        <th>Moneda visual</th>
      </tr>
    `;
    const body = rows.map((x) => `
      <tr>
        <td>${escapeHtml(String(x.fecha).slice(0, 10))}</td>
        <td>${escapeHtml(x.tipo)}</td>
        <td>${escapeHtml(x.categoria)}</td>
        <td>${escapeHtml(x.detalle || "")}</td>
        <td style="mso-number-format:'0.00'">${Number(x.monto).toFixed(2)}</td>
        <td>${escapeHtml(selectedCurrency)}</td>
      </tr>
    `).join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"></head>
        <body>
          <table border="1">
            ${header}
            ${body}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `gastos-mg_${today}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`Excel exportado (${rows.length} movimientos).`);
  }

  async function handleImportFileClick() {
    try {
      const file = getImportFile()?.files?.[0];
      if (!file) {
        setImportStatus("Selecciona un archivo para importar.");
        return;
      }
      setImportStatus("Procesando archivo...");
      const rawRows = await parseImportFile(file);
      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        setImportStatus("El archivo no contiene filas para importar.");
        return;
      }
      const { normalized, errors } = normalizeImportedRows(rawRows);
      if (errors.length > 0) {
        const preview = errors.slice(0, 4).join(" ");
        setImportStatus(`Se detectaron ${errors.length} errores. ${preview}`);
        return;
      }
      const imported = await importTransactions(normalized);
      setImportStatus(`Importacion finalizada. Nuevos movimientos: ${imported}.`);
      if (getImportFile()) getImportFile().value = "";
      getAnimatePrimarySave()?.();
      getFlashSavedFeedback()?.("Importado");
      showToast(`Importados: ${imported}`);
    } catch (err) {
      setImportStatus(`Error al importar: ${err?.message || String(err)}`);
    }
  }

  return {
    downloadImportTemplate,
    exportFilteredToExcel,
    handleImportFileClick,
    parseDecimalInputValue
  };
}
