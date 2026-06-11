# Accessibility Guidelines — Clinsight

**Standard:** WCAG 2.1 AA, aligned with Apple HIG (44pt) and Android accessibility principles (48dp).

This document is the shared contract for all accessibility work. Shared primitives in `src/shared/` already implement these defaults; feature screens should follow the same patterns.

---

## Touch targets

- Minimum **44×44 pt** (iOS) / **48×48 dp** (Android) for all interactive elements (buttons, inputs, links, toggles).
- Import helpers from `@/shared/accessibility`:

```tsx
import { minTouchTargetStyle, expandHitSlop } from '@/shared/accessibility';

<Pressable
  style={minTouchTargetStyle}
  hitSlop={expandHitSlop(24)}
  accessibilityRole="button"
  accessibilityLabel="View glucose result details"
/>;
```

- Use `hitSlop` only when the visual control must stay smaller (e.g. icon buttons in headers).
- Keep **8dp minimum spacing** between adjacent tappable elements (`MIN_TAP_SPACING`).

---

## Labels

- **No icon-only button without an `accessibilityLabel`.** Screen readers cannot infer meaning from icons alone.
- Use **action + object** labels: `"View glucose result details"`, not `"Open"` or `"Button"`.
- Decorative icons and SVGs: set `accessible={false}` (and `importantForAccessibility="no"` on Android wrappers when needed).
- Modals: set `accessibilityViewIsModal={true}` so focus stays inside the dialog.
- Loading states: use `accessibilityState={{ busy: true }}` and a clear label such as `"Loading"`.

Shared label helpers live in `@/shared/accessibility` (`backButtonLabel`, `closeButtonLabel`, etc.).

---

## Color and contrast

- Body text: **≥ 4.5:1** contrast against its background.
- Large text (≥ 18pt regular, or ≥ 14pt bold): **≥ 3:1**.
- Use theme tokens from `@/shared/theme` — do not hardcode low-contrast grays.
- **Never convey status by color alone.** Pair color with text and/or an icon (e.g. password validation checklist, toast messages with icons).

Verified token pairs are documented in `src/shared/accessibility/contrast.ts`.

---

## Dynamic type and text scaling

- Do **not** set `allowFontScaling={false}` on user-facing text.
- Use `Typography` for all user-facing copy instead of hardcoded `fontSize` on raw `Text`.
- Layout-sensitive UI uses `maxFontSizeMultiplier={2}` (see `MAX_FONT_SIZE_MULTIPLIER`) to avoid broken layouts at extreme system font sizes.

---

## Reduce motion

- Respect the system **Reduce Motion** setting via `useReducedMotion()` from `@/shared/accessibility`.
- When enabled, skip or replace animations with instant state changes (`getAnimationDuration(reducedMotion, ms)` returns `0`).
- Applies to toasts, bottom sheets, onboarding, and loading transitions.

---

## Tab bar (deferred pattern)

When updating tab navigation, set explicit labels:

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarAccessibilityLabel: 'Home tab',
    tabBarIcon: ...
  }}
/>
```

Tab bar height is already 80pt; ensure icons and labels remain tappable at minimum target size.

---

## Testing gate (before PR)

Every accessibility PR must be tested on a **physical device or simulator** with a screen reader enabled:

| Platform | Screen reader                                    |
| -------- | ------------------------------------------------ |
| iOS      | VoiceOver (Settings → Accessibility → VoiceOver) |
| Android  | TalkBack (Settings → Accessibility → TalkBack)   |

**Checklist:**

1. Navigate the changed flow using swipe gestures only (no sighted tapping).
2. Confirm every interactive element has a clear, unique label.
3. Confirm disabled and loading states are announced.
4. Confirm modals trap focus and can be dismissed.
5. Enable Reduce Motion and confirm animations are skipped or simplified.
6. Increase system font size and confirm text remains readable without clipping critical actions.

---

## Team workflow

- Keep changes scoped to your assigned area to reduce merge conflicts.
- Reuse shared primitives (`Button`, `TextInput`, `Typography`, `AppScreenHeader`) — do not reimplement a11y per screen.
- For custom `Pressable`/`TouchableOpacity`, copy the handoff template from the plan or import from `@/shared/accessibility`.
