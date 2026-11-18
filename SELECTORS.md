# DOM policy

This engine was written independently for this repository. It uses public SDK
content-script lifecycle APIs and standard DOM APIs. It does not use the source,
components, tests, or dictionaries of another localization plugin.

Translation requires an exact dictionary match and a reviewed interface scope.
There is no substring replacement or interpolation. Arbitrary paragraphs and
headings remain excluded. `data-rus-ui` is an explicit opt-in; `data-rus-ignore`
and `translate="no"` are opt-outs. An opt-in never overrides protected ancestors.

## Source and evidence

The additional scopes were reviewed against the MIT-licensed English source at
`get-bb/bb`, tag `desktop-v0.49.0`, commit
`7b26cae79ec978fafd0a5db0e8517e94f12eb8f4`.

Protected markers come from these public sources:

- `apps/app/src/components/thread/timeline/ConversationMessageContent.tsx`:
  `data-message-column` marks message content.
- `apps/app/src/components/thread/timeline/ThreadTimelineRows.tsx`:
  `data-timeline-row-id` and `data-timeline-row-list` mark timeline content.
- `apps/app/src/components/thread/ThreadTitleMentions.tsx`:
  `.bb-thread-title` marks dynamic titles. `.truncate` and `.whitespace-pre`
  also appear around title fragments.
- `apps/app/src/components/code/BbSourceCode.tsx`:
  `data-bb-source-code-line-number`, `data-bb-source-code-viewport`, and
  `data-line` identify source-code surfaces.
- `apps/app/src/components/plugin/PluginSlotMount.tsx`:
  `data-bb-plugin-root` and `data-bb-plugin` identify plugin-owned UI.
- `apps/app/src/components/thread/toc/ThreadTableOfContents.tsx`:
  `data-thread-toc` marks user-content navigation.

Additional boundaries include native form text/values, contenteditable, code/pre,
common editor/terminal classes, rich text, monospaced text, truncation, and
explicit user/project names. Protected branches are skipped. The exceptions below
admit only reviewed static leaves or native hint attributes. All enclosing plugin
boundaries must qualify; nesting a reviewed plugin inside an unknown plugin never
admits its content.

## Host controls and settings

Semantic controls remain eligible: buttons, labels, summary/legend, menu items,
tabs, switches, checkboxes/radios, tooltips, navigation links, and marked dialog
labels/descriptions. SVG contents stay protected. Decorative SVG descendants do
not veto a parent control's accessible label. Protected user-title/name/content
descendants still veto parent attributes, except for the separately reviewed
static accessible names below.

These settings scopes have separate evidence:

- `apps/app/src/components/ui/settings-section.tsx`, lines 24–64 and 147–189:
  `data-settings-anchor` identifies sections and controls. Only the first label
  group's paragraphs and heading are included; control/value branches stay out.
  The heading must retain the nested title-wrapper shape.
- `ChoiceDropdownSetting.tsx`, lines 42–55: a setting button's `aria-label` is
  the setting label, while its truncated child is the selected provider/value.
  The accessible label may translate only when it equals the nearest
  `data-settings-anchor`. The selected text and its parent title stay protected.
- `KeyboardSettingsSection.tsx`, lines 357–405: built-in command paragraphs,
  subheadings, default-shortcut metadata spans, and Desktop/Custom badges are
  included. Keycaps, native values, and truncated user text remain protected.
- `ApplicationLinkApprovalsSettings.tsx`, lines 30–77: only the built-in empty
  paragraph and Always allowed list label are included. App schemes and the
  error-message paragraph are excluded.
- `ProvidersSettingsSection.tsx`, lines 450–470: only the first h3/p group in
  Configuration's bordered finished-turn section is included. Provider rows are
  excluded from this scope.
- `MachinesSettingsSection.tsx`, lines 120–171 and 395–430: the explanatory
  `role="note"` branch is static. Inside `data-machine-row`, only the connection
  status leaf, permission leaf, and built-in badges are included. The first
  row's machine label, platform label, and project count are excluded.
- `MachineAccessSettings.tsx`, lines 149–164 and 388–409: fixed accessible section
  labels identify the heading/description, Ready/Unavailable status paragraph,
  and Manage link. Provider descriptions, connection messages, and addresses
  stay outside this scope. Label matching uses the original attribute when this
  generation owns its translated form.
- `MobileAppSection.tsx`, lines 22–140: `section[aria-label="Mobile app downloads"]`
  identifies the static header and platform-card paragraphs/headings/links/dt
  labels. Nested plugin settings remain excluded; dl values and versions stay
  excluded. The access section uses its own narrower scope above.
- `SettingsView.tsx`, lines 1210–1235: Early adopter's second child contains the
  static h3/p copy. Other descendants are not admitted by this exception.
- `BrowserSettingsSection.tsx`, lines 240–263: the direct normal paragraph in
  the card contains built-in availability copy. Error paragraphs are excluded.

Fixed settings navigation paths come from
`apps/app/src/components/settings/settings-sections.ts`. Only exact known paths
admit truncated navigation labels. Plugin detail/entity paths stay excluded.

`AppLayout.tsx`, lines 339–349 and 410–415, uses the same truncated title class
for several page types. Therefore the title exception also requires a fixed
settings route (or a single `/settings/plugins/:pluginId` detail route),
`data-app-content-shell`, and
`data-testid="app-page-header-content-row"`. Project and navigation-plugin page titles are
not admitted. Plugin detail content headings and installed-plugin names remain
excluded; only the outer Settings header/sidebar chrome uses this detail-route
exception. `AppLayout.tsx`, lines 346–349, resolves that route family to Settings,
and `route-paths.test.ts`, lines 96–98, confirms the plugin-detail path. `SettingsSidebar.tsx`, lines 430–472, and
`SectionSidebar.tsx`, lines 89–99, justify the section-label shape under
`data-testid="settings-sidebar-body"`. Installed-plugin links are separate
siblings and remain excluded. These two structures were also confirmed in the
live host DOM before this change.

## Native hint attributes

Native input/textarea text, `value`, `defaultValue`, and all other data attributes
are never read or changed. Only `placeholder` and `aria-label` can translate in
these reviewed cases; native `title` remains excluded:

- Settings search under `settings-sidebar-body`, from `SettingsSidebar.tsx`,
  lines 166–167.
- Keyboard search under its Keyboard shortcuts anchor, from
  `KeyboardSettingsSection.tsx`, lines 754–760.
- Archived-thread search only on `/settings/archived`, from
  `ArchivedThreadsSettingsSection.tsx`, lines 202–208.
- New branch prefix under its own anchor, from `SettingsView.tsx`, lines 659–670.
- Automatic variable name/GH_TOKEN value under Environment variables, from
  `MachineEnvironmentSettings.tsx`, lines 460–480.
- Marketplace source/subdirectory under Plugin marketplaces, from
  `MarketplacesSettingsSection.tsx`, lines 111–125.
- Resource search forms with known labels on exact Plugins, Skills, or
  Automations collection routes. `packages/shared-ui/src/components/ui/resource/toolbar.tsx`,
  lines 177–220, supplies their static form and input labels.
- Explicit `data-rus-ui` opt-in, including native textarea hints.

Monospaced/truncated styling on the native field itself does not prevent these
hint attributes. Protected parents, editor roots, messages, code, opt-outs, and
unknown plugin boundaries still prevent translation. Password and hidden inputs
are excluded. The TreeWalker visits a native node's eligible attributes before
rejecting its text branch. Tests verify unchanged input values, textarea text and
default values, host hint updates, protected moves, and disposal.

## Reviewed plugin exceptions

### Official navigation and observed Spaces rail

`plugins/navigation/app/Rail.tsx` renders `data-testid="app-nav-rail"` and
icon-only buttons; the official plugin ID is `navigation`. Only the rail is
eligible. Wrapper ancestors can be traversed to reach it; siblings stay excluded.

Live QA also found an optional `spaces` navigation provider under the host
`nav[data-sidebar-navigation-placement="rail"]`, followed by the plugin boundary
and `app-nav-rail`. The original review covered only that observed rail.
The rail exception applies only while the enclosing host nav is in rail mode;
the separately reviewed Spaces menu/dialog extension is documented below. A changed plugin ID or marker restores the original labels.

### Official Automations collection

`plugins/automations/overview-view.tsx`, lines 602–768, uses
`ResourceCollectionPage` with ID `automations-collection`.
`packages/shared-ui/src/components/ui/resource/collection.tsx`, lines 47–140,
provides its fixed tab IDs and collection structure. Both Installed and Browse
tab IDs must be present under the same `automations` plugin boundary.

Only these branches qualify: collection description, mode tabs, New automation
buttons, installed-panel search form, Filters/Sort toolbar buttons, and
loading/empty/error state branches. `row.tsx`, lines 357–415, supplies the latter
status structure. Resource rows, prompt-content roots, card content, templates,
job names, instructions, and dynamic project filters are excluded. Unknown or
outer plugin boundaries still veto this exception. Removing an identity or tab
marker restores translated leaves. Attribute labels used to recognize a scope
are compared against the original value owned by this generation.

### Composer reasoning leaf

`apps/app/src/components/pickers/ModelReasoningPicker.tsx`, lines 915–993,
places the selected model in `.truncate` and the reasoning label in a separate
`span.shrink-0[data-promptbox-hide-compact]`. Only that leaf inside `bb--composer`
and the button labeled Provider, model and reasoning (optional shortcut suffix)
is eligible. Adjacent model names, projects, composer text, and all other
composer controls remain excluded by this exception. Removing the marker
restores the reasoning label.

## Lifecycle, privacy and limits

The engine never changes URLs, IDs, event handlers, node structure, form values,
or attributes other than title/aria-label/placeholder. It has no network calls,
telemetry, console logging, services, or RPC. The frontend persists only its
enabled preference. Original/translated pairs live in memory for conditional
restoration; host updates win. Disabling, aborting, disposing, moving into a
protected scope, and removing scope markers restore owned changes.

The observer batches mutations, filters attributes, skips protected branches,
and avoids duplicate nested scans. Automations scopes are cached per plugin
boundary during one scan/flush, then invalidated before the next mutation
reconciliation. This avoids rescanning the collection for every resource row
without retaining grants across mutations. It does not poll or schedule timers.

BB has no stable localization API or complete static-copy marker. Semantic HTML
alone does not prove host ownership. An exact dictionary match in an unmarked
user control can still translate. These exclusions reduce that risk and leave
some interface copy in English. Review DOM policy after host changes.
`data-rus-ignore` is the supported opt-out.


## Additional static accessible names and collection chrome

Some host landmarks contain user titles or plugin-owned descendants. Their own
static `aria-label` is independent from those descendants. The engine can
translate only that attribute, while keeping all descendant text and attributes
subject to the normal policy. Source-backed names are:

- `SidebarNavigationHost.tsx`, lines 205–216: Sidebar navigation requires a host
  nav test ID (`sidebar-navigation-rail` or `sidebar-navigation-region`) and
  `data-sidebar-navigation-placement`.
- `MachineAccessSettings.tsx`, lines 149–155: Machine access on
  `/settings/machines`, or Accessing bb from your phone on `/settings/mobile`.
- `MobileAppSection.tsx`, line 22: Mobile app downloads on `/settings/mobile`.
- `SettingsView.tsx`, lines 1210–1235: Early adopter requires its matching
  `data-settings-anchor` and `/settings/experiments`.
- `UpdatesSettingsSection.tsx`, lines 1714–1729: Bulk update actions requires
  `role="toolbar"`, `data-updates-domain="provider-clis"`, and
  `/settings/updates`.

Unknown plugin boundaries and protected ancestors still veto these accessible
names. Descendant-content veto is bypassed only for the exact reviewed aria name,
never for `title` or general text. Tests include nested user names and unknown
plugin UI and verify their data remains unchanged.

On `/plugins`, only the ResourceSourceShelf header-description paragraph below
`data-testid="plugin-browse-shelves"` is included. Its selector follows the
section's first branch; plugin cards are in its second branch and remain
excluded. `plugin-browse-discovery.ts`, lines 148–160, supplies descriptions only
from known host category metadata; collections and unknown categories have no
such description. `BrowsePluginsTab.tsx`, lines 357–410, renders that shelf and
puts catalog cards in `data-plugin-shelf`.
`resource/collection.tsx`, lines 235–268, defines the header branch.
The category descriptions are English source metadata, not translated copies
from another plugin.

The Plugins hero adds only its direct description paragraph under
`#plugins-browse-results section[aria-roledescription="carousel"]` with the fixed
accessible name What you can build with bb plugins. `BrowseHeroCarousel.tsx`,
lines 18–23, supplies the fixed copy;
`components/showcase-hero/ShowcaseHeroCarousel.tsx`, lines 184–218, supplies
the section and direct paragraph. Headings, demo scenes, animated demo labels,
plugin identities and card descriptions are not admitted by this exception.
Both category and hero shapes were confirmed in the live host DOM.

## Attribute-only composer and picker controls

The `bb--composer` exception additionally admits only static control
`aria-label` values. It does not admit their title attributes, text descendants,
editor input, model names, or neighboring controls. A `data-promptbox` ancestor
is required, plus these source structures:

- Prompt actions / Start voice input require `data-promptbox-action-row`.
  `plugins/composer/src/PromptBoxActionsMenu.tsx`, lines 128–142, and
  `PromptBoxInternal.tsx`, lines 3525–3660, supply the labels and row.
- Collapse prompt box requires `data-promptbox-standard-actions`, from
  `PromptBoxInternal.tsx`, lines 3425–3448.
- Stop run / Enter a prompt or attach a file. require
  `data-promptbox-submit-action`. `PromptBoxInternal.tsx`, lines 305–309 and
  3630–3639, defines that control; `NewThreadComposer.tsx`, lines 440 and
  1685–1689, supplies the static empty-input reason. Other dynamic blocker
  messages are not whitelisted.

Host picker accessible names require the host
`[data-app-composer][data-promptbox-shell]` ancestor:

- Environment additionally requires its own
  `data-promptbox-shrinkable-control`. `EnvironmentPicker.tsx`, lines 394–398,
  supplies that static aria name and marker.
- Permission mode additionally requires full-label and compact-label spans.
  `PermissionModePicker.tsx`, line 79, and `OptionPicker.tsx`, lines 95–125,
  supply the static aria name and separate selected-value spans.
- Branch additionally requires `role="combobox"`, `data-new-thread-footer`,
  and the exact `environment-project-checkout` plugin boundary.
  `plugins/environment-project-checkout/app.tsx`, lines 448–476, defines that
  button separately from the selected branch label.

`NewThreadPromptBox.tsx`, lines 299–300 and 339–382, and
`FollowUpPromptBox.tsx`, lines 641 and 884–905, establish host composer placement.
The three picker DOM structures were confirmed live. The Branch plugin
exception is attribute-only; it grants no text or sibling-plugin translation.
All outer plugin boundaries must still qualify. Removing a required marker or
changing plugin identity restores the original accessible name.

## Tasks: reviewed static leaves

Evidence: the shipped MIT Tasks bundle at
`/Applications/bb.app/Contents/Resources/app.asar.unpacked/node_modules/bb-app/server/dist/builtin-plugins/tasks/dist/app.js`,
plus live DOM on `/plugins/tasks/tasks`, its task detail route, create dialog,
status/priority popovers, and navigation tab. The policy is in
`reviewed-tasks.ts`. Every grant requires the nearest
`[data-bb-plugin-root][data-bb-plugin="tasks"]`; every enclosing plugin boundary
must independently qualify. No route-only or plugin-wide text grant is used.
This also covers the same detail UI mounted in a thread side panel. Message,
timeline and editor ancestors retain their veto.

- `[data-status-group-header]` with a built-in status enum identifies only a
  list group heading. Adjacent `[data-task-key]` rows, keys, overlay Open labels,
  truncated task titles and colored project/label badges remain excluded.
- The main header's untruncated fixed title, List/Board buttons, sidebar first
  navigation group, non-button section labels, and Plus/Settings actions are
  separate scopes. Folder labels are buttons; project and preset names use
  truncated leaves and dynamic titles. They are not admitted.
- Filter triggers require the shipped `.h-6.border` shape and fixed icon
  identities. Only their static label is eligible: `.truncate` selected values
  remain protected even inside an admitted control. The new-task Labels trigger
  additionally requires its fixed Plus icon and source button shape; selected
  labels replace that icon with colored spans and remain excluded even without
  truncation.
- Status/priority menu items require the 14-by-14 enum SVG shape; label/project
  options instead use colored spans. Sort requires the complete three-item
  Manual/Priority/Due date menu, without user-color or truncated descendants.
  General menuitem/option roles grant nothing. Compact menu buttons are
  excluded from the separate fixed-action button exception.
- Cmdk status/priority options require a fixed Choose status/priority search
  hint and the built-in `data-value` enum. Only the option's direct truncated
  label is admitted. Project, label and preset suggestions remain excluded,
  including their untruncated text. `cmdk-empty` qualifies only without a
  nested Create button (which can contain a typed name).
- Static native hints require reviewed Task title/Due date/Base branch labels
  or fixed source placeholders in the plugin boundary. Only native hint
  attributes are eligible; native titles, values, textarea content, editable
  titles and rich editor placeholders stay protected.
- Form label leaves use the shipped `space-y-1.5 > label.block.text-xs.font-medium`
  shape. Table headings and management tabs are separate from table bodies.
  Manage descriptions and empty states require all three generated tab suffixes
  (`labels`, `presets`, `folders`) and their source-specific paragraph/table
  branches. Names in rows, saved values, provider/model data and errors stay out.
- Properties uses direct aside heading/section-label branches. Activity uses
  its original static aria name, direct h2 and direct empty-state branch.
  Comment entries, authors, agent identities, thread titles, attachments and
  system-event text are excluded. The static comment/attachment action aria
  names are independent attribute grants.
- Portaled dialogs retain the Tasks plugin boundary. Static title/description
  leaves are identified through their aria-labelledby/aria-describedby relation
  and a finite list of source copy. Generated Radix IDs are not hard-coded.
  Mixed New task · project, Delete label/folder titles and descriptions containing
  filenames or thread titles stay excluded. Fixed action buttons and Close's
  direct sr-only leaf qualify separately.
- Toast text is an arbitrary RPC/error message and stays excluded. Its Dismiss
  aria name is eligible. Fixed icon aria names and matching static titles can
  translate without admitting selected names or arbitrary title attributes.

The implementation contains English source-label identity sets, not translations.
Unknown copy remains English. Scope identity compares original owned text/attributes
so the translator's own changes cannot revoke or expand permission. Tests include
user titles, project/label/preset names and comments named Done, Cancel or Save,
compact menu items, native getter traps, unknown nested plugins, marker changes,
host updates and conditional restoration.

## Spaces v0.4.1: menu and edit dialog

Evidence: MIT upstream [v0.4.1](https://github.com/tarasenko-by/bb-plugin-spaces/tree/v0.4.1),
commit `8a12efd80db0253ffed3df30548f308926c674cd`, and live switcher/edit-dialog
DOM. This extends the existing rail exception; it does not admit the navigation
plugin as a whole. `lib/portal-scope.ts`, lines 3–14, gives each overlay its own
`[data-bb-plugin-root][data-bb-plugin="spaces"][data-bb-portaled-overlay]` boundary.

- `app/SpaceSwitcher.tsx`, lines 131–177: the desktop menu has
  `role="menu"`, `.min-w-52.space-y-px`, and aria-labelledby pointing to
  `button[data-testid="spaces-switcher"]` in a Spaces boundary. Only its fixed
  two-item tail qualifies: the final radio label All projects and final menu
  item Edit Spaces…. User-space radios before that tail remain excluded even
  if identically named. The switcher's Space: <name> accessible name and selected
  text remain excluded. The compact menu drawer lacks this proven relationship
  and deliberately stays excluded.
- `app/EditSpacesDialog.tsx`, lines 187–446: the edit dialog requires
  `[data-spaces-sidebar]`, its `.min-h-80` parent, header `.space-y-1.5`, outer
  More label and `.flex-col-reverse` two-button footer. Only static header,
  Add space, Icon/Tint/Projects headings, More copy, Save/Cancel/Close and the
  non-drag drop label qualify. Space rows and project rows remain excluded.
- `Space name`, Move up/down, and finite built-in Icon/Tint aria names have
  separate attribute-only grants. No Spaces title or placeholder attributes
  are admitted. Native values are not read. Delete <name>, project membership
  text, folder descriptions containing the selected name and selected-space
  labels remain excluded.
- The drop label is static only with `.border-border` and without `.border-ring`.
  During dragging it contains a selected user-space name, so that state revokes
  the grant. `components/ui/dialog.tsx`, lines 288–310, supplies desktop Close;
  `responsive-overlay.tsx`, lines 842–890, supplies the reviewed compact edit
  content wrapper. Both edit layouts are tested.

Plugin scopes are cached only during a scan/flush and invalidated before each
mutation reconciliation. The observer watches the additional identity, enum,
portal, icon and relation markers. Scope-affecting mutations rescan the nearest
reviewed plugin root; switcher changes also revisit Spaces portals. Removing
required markers restores owned translations, and restoring markers permits a
new translation. Unknown outer plugins, opt-outs and protected ancestors always
win. No DOM markers are added, no user entities are changed, and no network or
persistence is added to the translator.

## Thread menus: notifications entry and thread row actions

Evidence: the shipped MIT bundles
`builtin-plugins/push-notifications/dist/app.js` and
`builtin-plugins/thread-list/dist/app.js` of BB 0.49.0, plus live DOM of the
thread header menu and the sidebar row menu (right click and the row action
button). Policy: `reviewed-notifications.ts` and `reviewed-thread-menu.ts`;
both feed one scope list in `translator.ts`.

- **Notifications entry.** A `[role="menuitem"][aria-haspopup="menu"]` whose first
  child is one of the plugin's three level icons (`BellDot`,
  `push-notifications/ringing`, `push-notifications/off`; the icon changes with
  the level and may be a masked span, not an svg) and whose label's first text
  node is exactly `Notifications`. Its own submenu is the `[role="menu"]`
  labelled by this item's `id`. The sr-only suffix (`, ` plus the level label)
  is two text nodes, so bare level labels are enough.
- **Thread row menu.** Direct `[role="menuitem"]` children of a
  `[role="menu"][data-bb-plugin="thread-list"]` that also contains `Copy link` or
  `Customize actions`, and only when the item's original text is an exact
  built-in label (`Open in split`, `Copy link`, `Pin`, `Unpin`, `Mark read`,
  `Mark unread`, `Rename`, `Regenerate title`, `Customize actions`, `Archive`,
  `Unarchive`, `Delete`, `View details`). Submenus, `Notify parent, Off`, other
  plugins' entries and menus without the signature stay English.
- The plugin-owned parent menu is only walked through to reach these entries;
  its other text remains protected. Removing a marker restores the original text.
- Not verified live: the `Limited by a parent thread` / `Limited by an ancestor
  thread` hints (needs a thread limited by its parent). They are covered by a
  fixture test only.

## Sidebar fixed labels

Evidence: BB 0.49.0 thread-list plugin bundle and live DOM of the thread
sidebar. Policy: `reviewed-sidebar.ts`, merged into the same scope list as the
menus above. Each scope requires a structural marker and, where text is
translated, the exact original label:

- Spaces new-thread button: `[data-spaces-new-thread-row][data-bb-plugin="spaces"] > div > button[aria-keyshortcuts]`
  whose text is `New thread`; its `aria-label` carries the shortcut suffix.
- Empty state: a `p` right after `svg[data-icon="MessageSquare"]` inside a project
  or visibility group, with the text `No threads`.
- `button[data-testid="sidebar-thread-list-more-trigger"]` with the text `More`
  (and its `More projects` aria-label).
- `[data-sidebar-row-controls] > button[data-thread-actions-trigger]` (aria-label).
- `[data-sidebar-thread-trailing-indicator]` (status aria-labels such as
  `Thread working`).

Rows, links, titles, name labels and provider icon labels are not scopes. The
plugin-owned sidebar is only walked through to reach these controls; everything
else in it stays protected.
