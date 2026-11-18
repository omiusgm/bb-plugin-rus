/**
 * Reviewed "Active child threads" banner above the composer (BB 0.49.0
 * ThreadPromptContextBanner.tsx). No dictionary data.
 *
 * The header text sits in a `.truncate` span, which the translator protects by
 * default. Only the span whose original text is exactly "Active child threads"
 * (a leaf, with no element children) is admitted, directly inside the banner toggle button. In the collapsed-question
 * state that button holds a child thread title instead, so the button itself is
 * never a scope. A banner inside a plugin boundary is not the host's. The expanded "back" button holds only fixed copy and is admitted
 * whole, by its original aria-label.
 */
export const CHILD_THREADS_TOGGLE_ID = 'thread-prompt-banner-child-threads-toggle';

export function childThreadsBannerScopes(
  document: Document,
  originalText: (element: Element) => string,
  originalLabel: (element: Element) => string | null,
): Element[] {
  const scopes: Element[] = [];
  for (const button of document.querySelectorAll(
    `[data-app-composer] section > button[id="${CHILD_THREADS_TOGGLE_ID}"]`)) {
    if (button.closest('[data-bb-plugin-root]')) continue;
    if (originalLabel(button) === 'Back to active child threads') {
      scopes.push(button);
      continue;
    }
    for (const span of button.querySelectorAll(':scope > span')) {
      if (span.children.length === 0 && originalText(span).trim() === 'Active child threads') scopes.push(span);
    }
  }
  return scopes;
}
