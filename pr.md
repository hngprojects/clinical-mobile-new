# Description

Integrated the Insights Menu Screen with the backend API to consume real medical case data instead of using mock/dummy data. Cases now fetch from `/api/v1/cases?offset=0&limit=50`, display relative timestamps that auto-update every minute, and support pull-to-refresh for manual reloads. Navigation to chat-review now uses actual case IDs from the API.

# Changes Proposed

## What were you told to do?

- Consume the `/api/v1/cases` API endpoint on the Insights screen
- Display real case data in the insights list
- Show relative time (e.g., "x mins ago") instead of fixed dates
- Allow users to reload/refresh the insights list
- Fix the back navigation from chat-review to return to Insights instead of Home

## What did you do?

1. **Created API layer** (`src/features/insights/api/cases.api.ts`):
   - Added typed response interface for `/api/v1/cases` endpoint
   - Implemented `listCases()` function to fetch cases with offset/limit params

2. **Created feature hook** (`src/features/insights/hooks/useInsightCases.ts`):
   - Wrapped the API call with `useApiQuery` for React Query integration
   - Mapped case objects to insight list items (id, title as "Case {id}", subtitle as relative time)
   - Implemented relative time formatter ("43 mins ago", "2 hours ago", "1 day ago", etc.)
   - Added auto-refresh every 60 seconds to recalculate relative times
   - Exposed `refetch` for manual pull-to-refresh

3. **Updated list state hook** (`src/features/insights/hooks/useInsightList.ts`):
   - Modified to accept initial items from API instead of only using dummy data
   - Changed to `useLayoutEffect` for syncing API data before paint to prevent empty-state flash

4. **Updated Insights screen** (`src/features/insights/components/InsightScreen.tsx`):
   - Wired in `useInsightCases()` hook to consume API data
   - Added loading state display during initial fetch
   - Integrated pull-to-refresh capability with `FlatList` `refreshing` and `onRefresh` props
   - Passed API-backed items to the local list hook

5. **Fixed case navigation** (`src/features/insights/components/InsightListRenderItem.tsx`):
   - Changed from hardcoded `?demo=true` to using actual `caseId` param in route
   - Now navigates to chat-review with real case data

## Types of changes

- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would change existing functionality)
- [ ] Chore (changes that do not relate to a fix or feature and don't modify src or test files)

# Screenshots (REQUIRED)

> API data now displays on the Insights screen with real case IDs and relative timestamps that auto-update every minute. Pull-to-refresh is enabled for manual data reload. Case clicks now route with real case IDs instead of demo mode.

# Checklist

- [x] My code follows the code style of this project
- [x] This PR does not contain plagiarized content
- [x] The title and description of the PR are clear and explain the approach
- [x] I am opening this PR against the **dev** branch
- [x] My commit messages match the requested style
- [x] My code passes lint, typecheck, and tests locally
