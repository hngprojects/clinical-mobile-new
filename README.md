# React Native Starter

Production-ready Expo starter for HNG teams using **Vertical Slice Architecture**. Clone and ship — the structure scales, the defaults work out of the box.

## Stack

| Layer           | Choice                                            |
| --------------- | ------------------------------------------------- |
| Framework       | Expo SDK 55 + Expo Router v4                      |
| Language        | TypeScript (strict)                               |
| Package manager | pnpm (hoisted)                                    |
| Navigation      | File-based routing with guarded route groups      |
| State           | Zustand v5 (one store per feature slice)          |
| Data fetching   | TanStack Query v5 + Axios                         |
| Forms           | React Hook Form v7 + Zod v3                       |
| Storage         | expo-secure-store (tokens) · AsyncStorage (prefs) |
| Theming         | Custom ThemeContext · light design tokens         |
| Linting         | ESLint (eslint-config-expo flat)                  |
| Formatting      | Prettier                                          |
| CI              | GitHub Actions → APK → Appetize + artifact        |

---

## Quick start

```bash
git clone <repo-url>
cd react-native-starter
pnpm install
pnpm start
```

**Demo credentials** (no backend needed): `jeffery@logickoder.dev` / `Password1`

> **Expo Go caveat (SDK 55):** The Expo Go versions on the App Store and Google Play may lag behind SDK 55 releases. See [expo/expo#43699](https://github.com/expo/expo/issues/43699).
>
> - **Android** — run `pnpm start` then choose **"Open on Android"** from the dev menu. This downloads the latest Expo Go build directly to the device, bypassing the Play Store version.
> - **iOS** — use the [Expo Go TestFlight build](https://testflight.apple.com/join/E2NifhGI) (SDK 55 compatible) instead of the App Store version.
> - **Recommended** — use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) to avoid Expo Go version constraints entirely.

---

## Project structure

```
src/
├── app/                    # Expo Router routes (thin screen files only)
│   ├── _layout.tsx         # Root layout — navigation guards live here
│   ├── (onboarding)/       # First-launch onboarding flow
│   ├── (auth)/             # Login + register screens
│   └── (main)/             # Authenticated app (bottom tabs)
│
├── features/               # Vertical slices — one folder per domain
│   ├── auth/               # JWT auth: api, store, hooks, forms, schemas
│   ├── onboarding/         # 3-slide pager with skip/complete tracking
│   └── home/               # Main screen with logout
│
├── shared/                 # Cross-cutting concerns (no feature deps)
│   ├── api/                # Axios client + interceptors + TanStack wrappers
│   ├── components/         # Button, TextInput, FormField, Screen, Typography…
│   ├── constants/          # Storage keys, env vars
│   ├── hooks/              # useAppReady
│   ├── storage/            # Typed AsyncStorage + SecureStore wrappers
│   ├── store/              # createStore factory (Zustand)
│   └── theme/              # Colors, typography, spacing, ThemeContext
│
└── providers/
    └── AppProviders.tsx    # QueryClientProvider + ThemeProvider composition
```

---

## Navigation flow

```
App launch → useAppReady() hydrates stores from persistent storage
                │
                ├─ onboarding not complete  →  (onboarding) group
                ├─ onboarding done, not logged in  →  (auth) group
                └─ logged in  →  (main) group
```

Guards are reactive — completing onboarding or logging in causes the root layout to re-evaluate and navigate automatically. No `router.replace()` calls in screen components.

---

## Adding a new feature slice

1. **Create the folder**

   ```
   src/features/my-feature/
   ├── api/          my-feature.api.ts · my-feature.types.ts
   ├── components/   MyFeatureScreen.tsx
   ├── hooks/        useMyFeature.ts
   ├── store/        my-feature.store.ts
   ├── schemas/      my-feature.schemas.ts   (if forms needed)
   └── index.ts      (barrel export — public API)
   ```

2. **Use shared patterns**

   ```ts
   // Store
   import { createStore } from '@/shared/store/factory';
   export const useMyFeatureStore = createStore<State & Actions>((set) => ({ ... }));

   // Data fetching
   import { useApiQuery, useApiMutation } from '@/shared/api/hooks';
   export function useMyData() {
     return useApiQuery(['my-data'], myFeatureApi.getData);
   }

   // Forms
   import { FormField } from '@/shared/components';
   <FormField control={control} name="title" label="Title" />
   ```

3. **Add a route** (thin file — no logic)

   ```ts
   // src/app/(main)/my-feature.tsx
   import { MyFeatureScreen } from '@/features/my-feature';
   export default MyFeatureScreen;
   ```

4. **Add a tab** (optional)

   ```ts
   // src/app/(main)/_layout.tsx — add inside <Tabs>
   <Tabs.Screen name="my-feature" options={{ title: 'My Feature' }} />
   ```

**Rule:** import only from `@/features/my-feature` (the barrel), never from deep paths inside another feature.

---

## Theming

```ts
const { colors, spacing, typography } = useTheme();

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.h2, color: colors.text },
});
```

The app uses the light design palette only.

---

## Auth

The auth slice ships with a dummy implementation — no backend required to run the full flow. Replace `authApi.login` / `authApi.register` / `authApi.refreshTokens` in [src/features/auth/api/auth.api.ts](src/features/auth/api/auth.api.ts) with real Axios calls.

The Axios client auto-attaches `Authorization: Bearer <token>` to every request and handles 401 → token refresh → retry transparently via interceptors in [src/shared/api/client.ts](src/shared/api/client.ts).

---

## Scripts

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `pnpm start`        | Start Expo dev server              |
| `pnpm android`      | Open on Android emulator           |
| `pnpm ios`          | Open on iOS simulator              |
| `pnpm test`         | Run Jest tests                     |
| `pnpm test:watch`   | Jest in watch mode                 |
| `pnpm typecheck`    | TypeScript compile check (no emit) |
| `pnpm lint`         | ESLint with zero-warning policy    |
| `pnpm lint:fix`     | ESLint auto-fix                    |
| `pnpm format`       | Prettier format all files          |
| `pnpm format:check` | Prettier check (CI-safe)           |

---

## CI — Android build

Push to `main` (or open a PR) → GitHub Actions:

1. Installs deps with pnpm (cached)
2. Runs `expo prebuild --platform android`
3. Builds debug APK with Gradle (Gradle cache enabled)
4. Uploads APK as a workflow artifact (7-day retention)
5. Uploads to Appetize.io and posts a preview link in the job summary

**Required secret:** `APPETIZE_API_TOKEN` (from your [Appetize dashboard](https://appetize.io)). Appetize step is skipped gracefully if the secret is missing.

---

## Naming conventions

| Entity           | Pattern                        | Example                       |
| ---------------- | ------------------------------ | ----------------------------- |
| Store hook       | `use[Feature]Store`            | `useProfileStore`             |
| Feature hook     | `use[Action]`                  | `useUpdateProfile`            |
| Screen component | `[Feature]Screen`              | `ProfileScreen`               |
| API function     | camelCase verb                 | `updateProfile()`             |
| Zod schema       | `[action]Schema`               | `updateProfileSchema`         |
| Storage key      | `STORAGE_KEYS.[FEATURE]_[KEY]` | `STORAGE_KEYS.PROFILE_AVATAR` |

---

Made with ❤️ by [Jeffery Orazulike](https://logickoder.dev) and the HNG projects team.
