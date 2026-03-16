function parseLocalizedNumber(value) {
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

function tokenizeExpression(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  const compact = raw.replaceAll(" ", "");
  if (!/^[\d.,+\-*/()]+$/.test(compact)) return null;
  const tokens = [];
  let current = "";

  for (const char of compact) {
    if (/\d|[.,]/.test(char)) {
      current += char;
      continue;
    }
    if (current) {
      tokens.push(current);
      current = "";
    }
    tokens.push(char);
  }
  if (current) tokens.push(current);
  return tokens;
}

export function parseDecimalExpression(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }
  const tokens = tokenizeExpression(value);
  if (!tokens?.length) return NaN;

  let index = 0;

  function parseFactor() {
    const token = tokens[index];
    if (token === "+") {
      index += 1;
      return parseFactor();
    }
    if (token === "-") {
      index += 1;
      const factor = parseFactor();
      return Number.isFinite(factor) ? -factor : NaN;
    }
    if (token === "(") {
      index += 1;
      const inner = parseExpression();
      if (tokens[index] !== ")") return NaN;
      index += 1;
      return inner;
    }
    const amount = parseLocalizedNumber(token);
    if (!Number.isFinite(amount)) return NaN;
    index += 1;
    return amount;
  }

  function parseTerm() {
    let value = parseFactor();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index];
      index += 1;
      const next = parseFactor();
      if (!Number.isFinite(value) || !Number.isFinite(next)) return NaN;
      if (operator === "*") value *= next;
      else {
        if (next === 0) return NaN;
        value /= next;
      }
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const operator = tokens[index];
      index += 1;
      const next = parseTerm();
      if (!Number.isFinite(value) || !Number.isFinite(next)) return NaN;
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const result = parseExpression();
  if (index !== tokens.length || !Number.isFinite(result)) return NaN;
  return result;
}

export function parseDecimalInputValue(value) {
  const n = parseDecimalExpression(value);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
}

export function formatExpressionResult(value) {
  if (!Number.isFinite(value)) return "";
  return Number(value).toFixed(2);
}
