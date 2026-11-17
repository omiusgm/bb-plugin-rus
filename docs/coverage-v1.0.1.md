# Живой аудит покрытия — v1.0.1

Дата: 17 ноября 2026 года. Проверено на локальном BB 0.49.0, плагин `rus` включён.

## Источники и границы проверки

- Английские строки: официальный [get-bb/bb, desktop-v0.49.0](https://github.com/get-bb/bb/tree/desktop-v0.49.0), коммит `7b26cae79ec978fafd0a5db0e8517e94f12eb8f4`.
- API приложения возвращает `currentVersion: 0.49.0`, `installKind: desktop`, `currentCommit: null`. Использован официальный исходник этой версии. SHA установленного бинарного файла отдельно не подтверждён.
- Старые словари других русификаторов не открывались. Использованы текущий независимый словарь, согласованный глоссарий и английский исходник.
- Один local/headless браузер, viewport 1440 × 1000. Обойдены 26 URL/состояний, в том числе все 17 разделов навигации Settings и настройки самого русификатора.
- На каждом экране после завершения загрузки проверялись отображаемые DOM-подписи и атрибуты `title`, `aria-label`, `placeholder`. Значения полей не собирались. CSS-видимые узлы вне первого viewport тоже учитывались; скрытые/свёрнутые узлы исключались. Виртуализированные строки и закрытые меню отдельно не раскрывались.
- Сообщения треда, код, редакторы, терминалы, имена пользователей/проектов/тредов, даты, счётчики, имена плагинов и продуктов исключены из показателя.
- Главная и экран нового треда в этой версии используют общий compose-маршрут `/`; старый проектный URL перенаправился на него. Это отмечено в таблице и не считается отдельным новым экраном по числу уникальных строк.

## Результат

- Проверено 213 оставшихся английских строк с точным совпадением в официальном исходнике. 44 исключены из показателя по правилам задания.
- Исходная проверяемая группа: **169 уникальных непереведённых подписей**. Из них после изменения **127 подтверждены по-русски**, **36 ещё встречаются по-английски**, **6 не повторились** в том же состоянии и не засчитаны как исправленные.
- Добавлено **83** переводов. Всего в словаре **1852**. Проверка ссылок/плейсхолдеров, **79 тестов**, typecheck и build проходят.
- Это измерение выявленных пропусков на перечисленных экранах, а не процент перевода всего BB. Если одна строка переведена на одном экране, но остаётся английской на другом, она считается оставшейся.

### По экранам

| Экран | Английских подписей до | Подтверждено по-русски | Осталось английских | Не повторилось |
|---|---:|---:|---:|---:|
| / | 11 | 8 | 3 | 0 |
| Новый тред проекта → / | 11 | 8 | 3 | 0 |
| Открытый тред | 14 | 7 | 6 | 1 |
| /settings | 15 | 14 | 1 | 0 |
| /settings/providers | 9 | 8 | 1 | 0 |
| /settings/ai-services | 10 | 10 | 0 | 0 |
| /settings/appearance | 10 | 9 | 1 | 0 |
| /settings/keyboard | 21 | 21 | 0 | 0 |
| /settings/browser | 9 | 9 | 0 | 0 |
| /settings/files | 8 | 8 | 0 | 0 |
| /settings/projects | 9 | 8 | 1 | 0 |
| /settings/machines | 17 | 16 | 1 | 0 |
| /settings/mobile | 27 | 20 | 4 | 3 |
| /settings/environment-variables | 18 | 14 | 4 | 0 |
| /settings/updates | 9 | 7 | 2 | 0 |
| /settings/plugins | 8 | 7 | 1 | 0 |
| /settings/marketplaces | 8 | 7 | 1 | 0 |
| /settings/experiments | 18 | 17 | 1 | 0 |
| /settings/community | 6 | 6 | 0 | 0 |
| /settings/archived | 10 | 10 | 0 | 0 |
| /settings/plugins/rus | 8 | 6 | 2 | 0 |
| /plugins | 28 | 20 | 8 | 0 |
| /skills | 4 | 2 | 0 | 2 |
| /skills/registry | 2 | 2 | 0 | 0 |
| /plugins/automations/automations | 11 | 8 | 3 | 0 |
| /plugins/automations/automations/browse | 12 | 5 | 7 | 0 |

## Экран → строка → причина

Причина относится к v1.0.0: отсутствие ключа или область, которую движок не переводил. Результат — повторная проверка v1.0.1.

| Экран | Английская строка | Причина до исправления | Результат после | Источник |
|---|---|---|---|---|
| /, Новый тред проекта → /, Открытый тред | High | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/plugin-api-docs/src/wireframes.tsx#L2048) |
| /, Новый тред проекта → /, Открытый тред, /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus, /plugins, /skills, /skills/registry, /plugins/automations/automations, /plugins/automations/automations/browse | Sidebar navigation | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/SidebarNavigationProviderSetting.tsx#L10) |
| /, Новый тред проекта → /, Открытый тред, /plugins/automations/automations, /plugins/automations/automations/browse | Archive | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/dialogs/ThreadArchiveDialog.tsx#L118) |
| /, Новый тред проекта → /, Открытый тред, /plugins/automations/automations, /plugins/automations/automations/browse | Thread actions | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/thread-detail/ThreadDetailView.tsx#L1474) |
| /, Новый тред проекта → /, Открытый тред, /plugins/automations/automations, /plugins/automations/automations/browse | Unread thread succeeded | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/plugin-sdk/src/internal/thread-status.ts#L24) |
| /, Новый тред проекта → /, Открытый тред | Prompt actions | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/composer/src/PromptBoxActionsMenu.tsx#L134) |
| /, Новый тред проекта → /, Открытый тред | Start voice input | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/promptbox/VoiceInputTextarea.tsx#L141) |
| /, Новый тред проекта → / | Enter a prompt or attach a file. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/promptbox/NewThreadComposer.tsx#L440) |
| /, Новый тред проекта → /, Открытый тред | Environment | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/pickers/EnvironmentPicker.tsx#L394) |
| /, Новый тред проекта → / | Branch | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/shared-ui/src/components/pickers/BranchPicker.tsx#L287) |
| /, Новый тред проекта → /, Открытый тред | Permission mode | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/pickers/PermissionModePicker.tsx#L79) |
| Открытый тред | Project | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/pickers/ProjectSelector.tsx#L196) |
| Открытый тред | Thinking… | Движок не трогал эту область | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/thread/timeline/TimelineWorkingIndicator.tsx#L21) |
| Открытый тред | Thread context before sending | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/promptbox/banner/ThreadPromptContextBanner.tsx#L1143) |
| Открытый тред | Collapse prompt box | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/composer/src/PromptBoxInternal.tsx#L3440) |
| Открытый тред | Stop run | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/composer/src/PromptBoxInternal.tsx#L3639) |
| /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus | Plugins | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/SettingsSidebar.tsx#L433) |
| /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus | Archived | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/secondary-panel/ThreadMetadataContent.tsx#L436) |
| /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus | Settings | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/layout/AppLayout.tsx#L436) |
| /settings | Steer | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L608) |
| /settings | BB asks before opening links like linear:// in another app. Approvals stay on this device and aren't synced. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ApplicationLinkApprovalsSettings.tsx#L35) |
| /settings | No apps are always allowed. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ApplicationLinkApprovalsSettings.tsx#L46) |
| /settings | Install the bb CLI for use outside bb. You can control bb from any terminal, and so can agents outside bb, such as Claude Code or Codex. Threads in bb already have it. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/CliCommandSettingsSection.tsx#L27) |
| /settings | Not installed | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/onboarding/OnboardingViews.tsx#L344) |
| /settings | Install them into ~/.agents/skills and ~/.claude/skills so agents outside bb can use the bb CLI. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/CliSkillsSettingsSection.tsx#L30) |
| /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus | Search settings | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/SettingsSidebar.tsx#L167) |
| /settings, /settings/providers, /settings/ai-services, /settings/appearance, /settings/keyboard, /settings/browser, /settings/files, /settings/projects, /settings/machines, /settings/mobile, /settings/environment-variables, /settings/updates, /settings/plugins, /settings/marketplaces, /settings/experiments, /settings/community, /settings/archived, /settings/plugins/rus | Search | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/pickers/ModelReasoningPicker.tsx#L1213) |
| /settings | New branch prefix | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/settings-search.ts#L88) |
| /settings | No prefix | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L665) |
| /settings | Microphone | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/promptbox/MicrophonePreferences.tsx#L110) |
| /settings/providers | Default | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProvidersSettingsSection.tsx#L160) |
| /settings/providers | Collapse finished turns | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProvidersSettingsSection.tsx#L453) |
| /settings/providers | When a turn finishes, fold its work into one Worked for row and keep the final answer visible. Turn off collapsing to keep every step of a finished turn visible. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProvidersSettingsSection.tsx#L456) |
| /settings/ai-services | Choose services for thread titles, commit messages, and voice input. Automatic prefers bb cloud, then other available services. A service you choose stays selected. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/AiServicesSettingsSection.tsx#L206) |
| /settings/ai-services | Thread titles | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/AiServicesSettingsSection.tsx#L37) |
| /settings/ai-services | Commit messages | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/AiServicesSettingsSection.tsx#L44) |
| /settings/ai-services | Voice input | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/AiServicesSettingsSection.tsx#L51) |
| /settings/appearance | Palette | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L755) |
| /settings/appearance | Favicon color | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L329) |
| /settings/appearance | Sidebar thread list | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/SidebarThreadListSetting.tsx#L9) |
| /settings/appearance | Composer | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/CodeRendererSettings.tsx#L30) |
| /settings/keyboard | Defaults: | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L380) |
| /settings/keyboard | Web | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L348) |
| /settings/keyboard | Desktop | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L368) |
| /settings/keyboard | Default: | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L380) |
| /settings/keyboard | Search prompts | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/prompt-library/app.tsx#L726) |
| /settings/keyboard | Monaco: fold recursively | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L83) |
| /settings/keyboard | Monaco: unfold all | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L86) |
| /settings/keyboard | Monaco: unfold recursively | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L89) |
| /settings/keyboard | Monaco: unfold at cursor | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L92) |
| /settings/keyboard | Monaco: sort selected lines ascending | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L95) |
| /settings/keyboard | Monaco: sort selected lines descending | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L101) |
| /settings/keyboard | Monaco: copy path of current file | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L107) |
| /settings/keyboard | Monaco: copy relative path of current file | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/monaco-editor/lib/editor-commands.ts#L112) |
| /settings/keyboard | Search keyboard shortcuts | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L755) |
| /settings/keyboard | Search shortcuts | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/KeyboardSettingsSection.tsx#L757) |
| /settings/browser | Browsers | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/BrowserSettingsSection.tsx#L240) |
| /settings/browser | Bring signed-in sessions from a browser on this machine into the BB browser, so previews and agent tabs open already logged in. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/BrowserSettingsSection.tsx#L241) |
| /settings/browser | Only available in the BB desktop app. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/BrowserSettingsSection.tsx#L257) |
| /settings/files | Directory default | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L383) |
| /settings/files | File default | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L389) |
| /settings/projects | Repositories bb can work in. Drag to change the order projects appear in the sidebar. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProjectsSettingsSection.tsx#L44) |
| /settings/projects | Add a project | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProjectsSettingsSection.tsx#L293) |
| /settings/projects | No git remote | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ProjectsSettingsSection.tsx#L184) |
| /settings/machines | How machines connect | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachinesSettingsSection.tsx#L406) |
| /settings/machines | All your machines connect to one central bb server, where your threads and settings are stored. Choose a machine that can stay awake and online to run the server. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachinesSettingsSection.tsx#L408) |
| /settings/machines | server | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachinesSettingsSection.tsx#L145) |
| /settings/machines | Online | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/machines/machine-status.ts#L42) |
| /settings/machines | Full Access | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/plugin-sdk/src/testing/app.tsx#L1297) |
| /settings/machines | Machine access | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineAccessSettings.tsx#L122) |
| /settings/machines, /settings/mobile | Choose how your devices reach this bb server. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineAccessSettings.tsx#L153) |
| /settings/machines, /settings/mobile | Manage | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/tasks/shell/sidebar.tsx#L360) |
| /settings/machines, /settings/mobile | Ready | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/onboarding/OnboardingViews.tsx#L545) |
| /settings/machines | About the bb server | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachinesSettingsSection.tsx#L397) |
| /settings/machines, /settings/mobile | Connection method | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineAccessSettings.tsx#L224) |
| /settings/mobile | Mobile apps | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L24) |
| /settings/mobile | Use bb from your phone | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L26) |
| /settings/mobile | Accessing bb from your phone | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L29) |
| /settings/mobile | Pair your phone | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/connect/app.tsx#L720) |
| /settings/mobile | Scan or enter a code. | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/connect/app.tsx#L723) |
| /settings/mobile | Add mobile device | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/connect/app.tsx#L744) |
| /settings/mobile | Available through TestFlight | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L40) |
| /settings/mobile | Install | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/onboarding/OnboardingViews.tsx#L322) |
| /settings/mobile | Join iOS TestFlight | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L61) |
| /settings/mobile | Direct download for Android phones | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L71) |
| /settings/mobile | Download the APK and open it on your phone to install. Allow installation from your browser if prompted. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L75) |
| /settings/mobile | Google Play access is under review. For now, return here for updates. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L79) |
| /settings/mobile | Version | Движок не трогал эту область | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L108) |
| /settings/mobile | Updated | Нет в словаре | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L112) |
| /settings/mobile | Download size | Нет в словаре | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L122) |
| /settings/mobile | Download Android APK | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L138) |
| /settings/mobile | Mobile app downloads | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MobileAppSection.tsx#L22) |
| /settings/environment-variables | Global variables are available to BB-managed processes on every connected machine. Project variables override them for work in that project. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L272) |
| /settings/environment-variables | Showing variables for | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L52) |
| /settings/environment-variables | Automatic | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L505) |
| /settings/environment-variables | GitHub is not logged in. Run gh auth login on the server, or add your own GH_TOKEN. | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L515) |
| /settings/environment-variables | Add variable | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L370) |
| /settings/environment-variables | Import from .env | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentImportDialog.tsx#L36) |
| /settings/environment-variables | Save variables | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L401) |
| /settings/environment-variables | Scope | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L56) |
| /settings/environment-variables | Automatic variable name | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L465) |
| /settings/environment-variables | Automatic GH_TOKEN value | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L471) |
| /settings/environment-variables | Not available | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L477) |
| /settings/environment-variables | Automatic GH_TOKEN | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MachineEnvironmentSettings.tsx#L496) |
| /settings/updates, /plugins | In progress | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/machines/ServerMoveOverlayView.tsx#L32) |
| /settings/updates | Server | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/UpdatesSettingsSection.tsx#L2270) |
| /settings/updates | Bulk update actions | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/UpdatesSettingsSection.tsx#L1716) |
| /settings/plugins | The plugins installed on this bb host. Turn one on or off, apply updates, or open it for settings and details. | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/plugins-collection-copy.ts#L5) |
| /settings/plugins | Search installed plugins | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/PluginsOverview.tsx#L252) |
| /settings/marketplaces | Official | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MarketplacesSettingsSection.tsx#L170) |
| /settings/marketplaces | Marketplace source | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/MarketplacesSettingsSection.tsx#L115) |
| /settings/experiments | Become an early adopter | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1223) |
| /settings/experiments | Get new experiments turned on by default sooner and help us try out features before they reach everyone. Turn this off anytime; experiments you switch yourself keep your choice. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1226) |
| /settings/experiments | Early adopter | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/settings-search.ts#L258) |
| /settings/experiments | Clear notifications once a thread is read | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1128) |
| /settings/experiments | When you read a thread on any device, remove its notifications from your phones and tablets and from open bb windows and tabs. Phones need an app version that supports it. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1130) |
| /settings/experiments | Faster plugin styles | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1133) |
| /settings/experiments | Load each plugin's stylesheet so it only matches that plugin's own UI, which makes style updates cheaper on pages with many plugins. Plugins built with an old portal-scope helper keep the slower stylesheet. Applies after a reload. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1135) |
| /settings/experiments | Resume interrupted threads after a restart | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1148) |
| /settings/experiments | When an update, crash or restart cuts off a running thread or stops a background command a thread is waiting on, bb resumes the thread a few seconds after it comes back and tells the agent what was cut off. Messages you queued meanwhile send after it. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1150) |
| /settings/experiments | Pushed timeline updates | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1173) |
| /settings/experiments | Send an open thread's timeline changes over the live connection instead of reloading the latest window after each update. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1175) |
| /settings/experiments | Update when idle | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/views/SettingsView.tsx#L1178) |
| /settings/archived | Archived threads | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ArchivedThreadsSettingsSection.tsx#L189) |
| /settings/archived | Find and restore archived threads from across your projects. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ArchivedThreadsSettingsSection.tsx#L192) |
| /settings/archived | Search archived threads | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ArchivedThreadsSettingsSection.tsx#L203) |
| /settings/archived | Search archived threads… | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/settings/ArchivedThreadsSettingsSection.tsx#L206) |
| /settings/plugins/rus | Plugin details | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/PluginSettings.tsx#L560) |
| /settings/plugins/rus | Configuration | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/PluginSettings.tsx#L637) |
| /plugins | Discover plugins for bb. Install one, or describe your own and build it from a prompt. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/plugins-collection-copy.ts#L2) |
| /plugins | Plugin | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/BrowseHeroCarousel.tsx#L25) |
| /plugins | Todo | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/MiniAppScenes.tsx#L19) |
| /plugins | Review | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/MiniAppScenes.tsx#L21) |
| /plugins | View all | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/management/BrowsePluginsTab.tsx#L394) |
| /plugins | Find, identify, organize, or archive threads. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L52) |
| /plugins | Change what people see or do inside an open thread. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L57) |
| /plugins | Add, choose, configure, route, or coordinate who runs a thread. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L74) |
| /plugins | Understand or control token, context-window, and provider-quota use. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L85) |
| /plugins | Personalize how bb looks and feels. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L47) |
| /plugins | Browse, open, preview, or edit files and document vaults. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L101) |
| /plugins | Plan, track, route, schedule, or automate work. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L128) |
| /plugins | Work with repositories, builds, changes, pull requests, issues, and reviews. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L96) |
| /plugins | Inspect or control the computers bb runs on. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L117) |
| /plugins | Control durable knowledge or standing context available to agents. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L63) |
| /plugins | Know when work finished, failed, or needs attention. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L90) |
| /plugins | Work with shells and command-line programs inside bb. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L112) |
| /plugins | Create and manage where threads run, locally or in the cloud. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L107) |
| /plugins | Understand, inspect, build, or debug bb and its plugin surfaces. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L123) |
| /plugins | Protect credentials or prevent unsafe code. | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/domain/src/plugin-catalog-category.ts#L68) |
| /plugins | What you can build with bb plugins | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/BrowseHeroCarousel.tsx#L19) |
| /plugins | Plugin examples | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/BrowseHeroCarousel.tsx#L23) |
| /plugins | Chief of staff | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/browse-hero/browse-hero-archetypes.ts#L28) |
| /plugins | Search plugins | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/management/PluginBrowseControls.tsx#L95) |
| /plugins | Disable Keep Awake | Нет в словаре | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/keep-awake/server.ts#L179) |
| /plugins | Resize thread and right panel | Движок не трогал эту область | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/secondary-panel/ThreadSecondaryPanel.tsx#L1171) |
| /skills | Loading | Движок не трогал эту область | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/app-update/AppUpdateHost.tsx#L166) |
| /skills | Loading more… | Движок не трогал эту область | Не повторилась; не засчитана как исправленная | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/shared-ui/src/components/ui/resource-pagination.tsx#L309) |
| /skills, /skills/registry | Search skills | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/tools/SkillsBrowse.tsx#L170) |
| /plugins/automations/automations, /plugins/automations/automations/browse | Manage scheduled bb work across projects and folders. Automations run recurring or one-time tasks without manual prompting. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L666) |
| /plugins/automations/automations, /plugins/automations/automations/browse | Installed | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/plugin/management/PluginCatalogInstallControl.tsx#L124) |
| /plugins/automations/automations, /plugins/automations/automations/browse | Browse | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/apps/app/src/components/dialogs/ProjectMachineSetupDialog.tsx#L288) |
| /plugins/automations/automations, /plugins/automations/automations/browse | New automation | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L679) |
| /plugins/automations/automations | No automations installed. | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L619) |
| /plugins/automations/automations | Search automations | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L707) |
| /plugins/automations/automations | Filters | Движок не трогал эту область | Подтверждено по-русски | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/packages/shared-ui/src/components/ui/resource/toolbar.tsx#L655) |
| /plugins/automations/automations/browse | runs every weekday morning, checks failed main-branch CI, and opens fixer threads only for new failures | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L66) |
| /plugins/automations/automations/browse | checks weekly for stale dependencies and opens an update thread when risk is low | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L73) |
| /plugins/automations/automations/browse | checks the release branch hourly, summarizes blocking checks, and alerts only when the status changes | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L80) |
| /plugins/automations/automations/browse | checks daily for stale worktrees and opens cleanup threads only after they exceed the team's retention window | Нет в словаре | Есть английский вариант | [исходник](https://github.com/get-bb/bb/blob/7b26cae79ec978fafd0a5db0e8517e94f12eb8f4/plugins/automations/overview-view.tsx#L87) |

## Что ещё осталось английским

| Экран | Строка | Почему оставлена |
|---|---|---|
| /settings/appearance | Sidebar navigation | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins/automations/automations/browse, Открытый тред, /plugins/automations/automations, Новый тред проекта → /, / | Archive | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| /plugins/automations/automations/browse, Открытый тред, /plugins/automations/automations, Новый тред проекта → /, / | Thread actions | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| /plugins/automations/automations/browse, Открытый тред, /plugins/automations/automations, Новый тред проекта → /, / | Unread thread succeeded | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| Открытый тред | Environment | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| Открытый тред | Project | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| Открытый тред | Thread context before sending | Защищённая область треда/поля ввода или подпись рядом с пользовательскими названиями. |
| /settings | Not installed | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/providers | Default | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/projects | No git remote | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/machines, /settings/mobile | Connection method | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/mobile | Pair your phone | Защищённая область плагина connect; интерфейс авторизации и данные подключения не расширялись. |
| /settings/mobile | Scan or enter a code. | Защищённая область плагина connect; интерфейс авторизации и данные подключения не расширялись. |
| /settings/mobile | Add mobile device | Защищённая область плагина connect; интерфейс авторизации и данные подключения не расширялись. |
| /settings/environment-variables | Showing variables for | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/environment-variables | Automatic | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/environment-variables | GitHub is not logged in. Run gh auth login on the server, or add your own GH_TOKEN. | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/environment-variables | Scope | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/updates, /plugins | In progress | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/updates | Server | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/plugins | The plugins installed on this bb host. Turn one on or off, apply updates, or open it for settings and details. | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/marketplaces | Official | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/experiments | Early adopter | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/plugins/rus | Plugin details | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /settings/plugins/rus | Configuration | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | Plugin | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | Todo | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | Review | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | View all | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | What you can build with bb plugins | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | Plugin examples | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins | Resize thread and right panel | Область не вошла в проверенное статичное исключение движка; без общего ослабления защиты. |
| /plugins/automations/automations/browse | runs every weekday morning, checks failed main-branch CI, and opens fixer threads only for new failures | Текст шаблона автоматизации; рабочее содержимое коллекции не изменяется. |
| /plugins/automations/automations/browse | checks weekly for stale dependencies and opens an update thread when risk is low | Текст шаблона автоматизации; рабочее содержимое коллекции не изменяется. |
| /plugins/automations/automations/browse | checks the release branch hourly, summarizes blocking checks, and alerts only when the status changes | Текст шаблона автоматизации; рабочее содержимое коллекции не изменяется. |
| /plugins/automations/automations/browse | checks daily for stale worktrees and opens cleanup threads only after they exceed the team's retention window | Текст шаблона автоматизации; рабочее содержимое коллекции не изменяется. |

### Исключённые строки

Эти строки не входят в численное сравнение и намеренно не превращались в массовый перевод данных.

| Строка | Причина |
|---|---|
| Claude Code | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| Codex | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| Ask User Question | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| bb account | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| bb connect | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| BB guide | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| Git | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| GitHub PR Status | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| Workflows | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| bb CLI | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| to see available devices. | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| 1 machine | Счётчик или часть динамического счётчика. Нужны правила числительных и полный контекст. |
| 1 thread | Счётчик или часть динамического счётчика. Нужны правила числительных и полный контекст. |
| macOS | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| iOS | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| TestFlight | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| , then join the bb beta to install the app on your iPhone. | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| Android | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| (build | Неполная часть динамической строки с номером версии и сборки; строка целиком не входит в область статического перевода. |
| MB | Единица измерения внутри динамического значения размера файла; числовые значения и их форматирование исключены. |
| bb | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| An https manifest URL, | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| , or | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| on the bb server’s machine. | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| BB Official | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| plugins · | Счётчик или часть динамического счётчика. Нужны правила числительных и полный контекст. |
| Discord | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| GitHub | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| threads | Счётчик или часть динамического счётчика. Нужны правила числительных и полный контекст. |
| Plugin Guide | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| Turn bb into | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| a kanban board | Неполная изменяемая часть составного заголовка карусели («Turn bb into …»). Изолированный перевод нарушит грамматику. |
| Trending agent skills from | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| skills.sh | Имя продукта, платформы, плагина, автора или сайта. Сохраняется в оригинале. |
| . Install one and every agent you use in bb can run it. | Неполный фрагмент составной строки с отдельной ссылкой, кодом или динамической частью. Изолированный перевод нарушит грамматику. |
| ACP providers | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Claude Code provider | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Codex provider | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Concurrency limit | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Custom instructions | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Keep Awake | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Provider retry | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Provider usage | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |
| Push notifications | В проверенном интерфейсе это имя плагина. Сохраняется в оригинале; существующая запись независимого словаря в этой подзадаче не изменялась. |

### Составные и динамические подписи

За пределами группы точных статичных ключей остаются составные подписи с подстановками. В частности:

- `Open thread N` и описания открытия N-го треда; имена и значения сочетаний в `Record shortcut for …`, `Clear shortcut for …`, `Reset shortcut for …`.
- Пример адреса в описании перенаправления localhost и пример префикса ветки: строки собираются с текущими данными устройства/настройки.
- Разрезанные ссылками/кодом фразы каталогов, изменяемая часть заголовка карусели, версии, размеры загрузок и счётчики.
- Метаданные внешних каталогов навыков/плагинов и рабочее содержимое автоматизаций. Их нельзя считать английскими строками ядра только по внешнему виду.

Динамическая строка не добавлялась в словарь под конкретное значение пользователя. Правила интерполяции для таких фраз этим релизом не вводились.

## Снимки до/после

| Экран | v1.0.0 | v1.0.1 |
|---|---|---|
| Клавиатура | [до](v1.0.1-before-keyboard.jpg) | [после](v1.0.1-after-keyboard.jpg) |
| Внешний вид | [до](v1.0.1-before-appearance.jpg) | [после](v1.0.1-after-appearance.jpg) |
| Общие | [до](v1.0.1-before-general.jpg) | [после](v1.0.1-after-general.jpg) |

Снимки проверены перед публикацией: в них нет переписки, значений секретов, личных путей и названий пользовательских проектов/тредов.

## Проверка безопасности границ

Каждое расширение покрыто тестами. Проверены исходные значения/defaultValue и текст textarea, защищённые предки, пользовательские имена рядом с системными подписями, модель рядом с reasoning, задания/промпты автоматизаций, возврат оригиналов при смене маркеров и отключении. Подсказки native-полей переводятся отдельно; значение поля не читается и не изменяется.

Автоматические DOM-тесты не доказывают корректность будущей разметки BB. После обновления приложения нужен новый живой аудит.
