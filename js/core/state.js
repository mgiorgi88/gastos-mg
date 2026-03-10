export function buildInitialQuickCategories(validCategories, defaults, raw) {
  const source = Array.isArray(raw) ? raw : [];
  const filtered = source.filter((x) => validCategories.includes(x));
  const unique = [];
  filtered.forEach((x) => {
    if (!unique.includes(x)) unique.push(x);
  });
  defaults.forEach((x) => {
    if (!unique.includes(x) && validCategories.includes(x)) unique.push(x);
  });
  validCategories.forEach((x) => {
    if (!unique.includes(x)) unique.push(x);
  });
  return unique.slice(0, 4);
}

export function createAppState(initialState) {
  return { ...initialState };
}
