# DOM policy

This engine was written independently for this repository. It uses public SDK
content-script lifecycle APIs and standard DOM APIs. It does not use the source,
components, tests, or dictionaries of another localization plugin.

Translation requires two conditions: an exact dictionary match and a semantic
interface control (`button`, `label`, menu item, tab, switch, tooltip, navigation
link, a marked dialog label, or a reviewed settings label branch). Arbitrary paragraph text and headings are not
translated. Integrations can opt in using `data-rus-ui`, or opt out with
`data-rus-ignore` / `translate="no"`.

Public BB source inspected at commit
`da3e60b81d560e114a2bec724bb59c997aaaae7f` in `get-bb/bb`:

- `apps/app/src/components/thread/timeline/ConversationMessageContent.tsx`:
  `data-message-column` marks message content.
- `apps/app/src/components/thread/timeline/ThreadTimelineRows.tsx`:
  `data-timeline-row-id` and `data-timeline-row-list` mark timeline content.
- `apps/app/src/components/thread/ThreadTitleMentions.tsx`:
  `.bb-thread-title` marks dynamic titles; `.truncate` and `.whitespace-pre`
  also appear around title fragments.
- `apps/app/src/components/code/BbSourceCode.tsx`:
  `data-bb-source-code-line-number`, `data-bb-source-code-viewport`, and
  `data-line` identify source-code surfaces.
- `apps/app/src/components/plugin/PluginSlotMount.tsx`:
  `data-bb-plugin-root` marks another plugin's UI.
- `apps/app/src/components/thread/toc/ThreadTableOfContents.tsx`:
  `data-thread-toc` marks user-content navigation.

Additional defensive boundaries include native form fields, contenteditable,
code/pre, common editor/terminal classes, rich text, truncation, monospaced text,
and explicitly marked user/project names. Entire protected branches are skipped.
The engine never changes form values, attributes other than title/aria-label/
placeholder, node structure, URLs, IDs, or event handlers. Inputs are excluded,
including their placeholder attributes.

Settings copy additionally uses the host's `data-settings-anchor` marker:
`apps/app/src/components/ui/settings-section.tsx` puts labels and descriptions
in the first child's first label group. Only that group is included. Value
branches remain excluded. `KeyboardSettingsSection.tsx` builds command labels
and descriptions from the built-in command metadata; its section's paragraphs
and subheadings are included. Key binding `<kbd>` text remains protected.

## Limits

BB does not expose a stable localization API or a complete static-copy marker.
Semantic HTML is not proof that its text is owned by BB. Unknown plugins or
future BB markup can put user content in an unmarked control. An exact dictionary
match there could be translated. The conservative exclusions reduce this risk
and also intentionally leave some interface copy in English. DOM policy must be
reviewed after host changes. `data-rus-ignore` is the supported opt-out.

## Lifecycle and privacy

The backend has no services or RPC. The frontend has no network calls,
telemetry, console logging, or collection of user strings. The only persisted
value is the enabled boolean in browser localStorage. Original/translated pairs
are held in memory only for modified nodes, for conditional restoration. They
are removed on host removal/update, disable, lifecycle abort, or disposal.

The observer batches mutations, filters attributes, skips protected branches,
and avoids duplicate nested scans. It does not poll or schedule timers.
Restoration only applies when the current value is still exactly the value
written by this generation. Host changes win. A lifecycle abort disconnects
the observer and preference listeners before restoring owned changes.

Fixed settings navigation links are recognized from
`apps/app/src/components/settings/settings-sections.ts` and the public
`/settings` route builder. Their truncated labels are allowed. Arbitrary plugin
detail/entity routes remain excluded; navigation matching uses exact paths.

## Official navigation rail exception

BB's built-in navigation is itself a plugin (`plugins/navigation/package.json`,
package `bb-plugin-navigation`, ID `navigation`). Its reviewed
`plugins/navigation/app/Rail.tsx` renders `data-testid="app-nav-rail"` and
icon-only buttons with their own `aria-label` values. `PluginSlotMount.tsx`
wraps it in `data-bb-plugin-root` plus `data-bb-plugin="navigation"`.

Only the rail inside that exact plugin boundary is eligible for translation.
Wrapper ancestors are traversed to reach it, but sibling plugin UI is excluded.
All enclosing plugin boundaries must satisfy this rule, so an unknown nested or
outer plugin remains excluded. Changes to either the plugin ID or rail marker
trigger protection reconciliation and restore the original labels.

An SVG descendant does not veto translation of its parent button's title or
accessible label. SVG text and SVG attributes remain protected. A protected
user-title/name/content descendant still vetoes parent attribute translation.

## Optional Spaces integration observed in the live DOM

Live QA also found an optional navigation provider with plugin ID `spaces`.
Its observed structure is a host
`nav[data-sidebar-navigation-placement="rail"]`, then the `spaces` plugin
boundary, then `div[data-testid="app-nav-rail"]` and icon-only buttons.
The Spaces implementation was not copied or inspected for this exception.

The same rail-only exception applies to `spaces` only when its plugin boundary
has that enclosing host `nav`. Spaces content outside the host rail, sibling
content outside `app-nav-rail`, and user-title descendants remain protected.
Changing the host navigation placement triggers reconciliation and restoration.
No other plugin ID is admitted.
