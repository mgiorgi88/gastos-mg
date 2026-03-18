export function createRecurrentSuggestionsUi({
  recurrentSuggestionsCardEl,
  recurrentSuggestionsListEl
}) {
  function renderSuggestions() {
    if (recurrentSuggestionsCardEl) recurrentSuggestionsCardEl.hidden = true;
    if (recurrentSuggestionsListEl) recurrentSuggestionsListEl.hidden = true;
  }

  function bindEvents() {
    renderSuggestions();
  }

  return {
    bindEvents,
    renderSuggestions
  };
}
