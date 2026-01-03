# Premium Feature Implementation Plan

The goal is to implement "Paid-Worthy" features that drive engagement, retention, and perceived value. The focus is on **Gamification**, **Deep Analytics**, and **Social Proof**.

## User Review Required
-   **XP Balancing**: Initial XP values (10 XP/question) need monitoring.
-   **Streak Logic**: Confirm if "Streak Freeze" logic is desired now or later. (Targeting *later* for simplicity, focusing on reliable DB syncing first).

## Proposed Changes

### Phase 1: The Gamification Engine (Server-Side XP & Leaderboards)
*Move state from "Local Storage" to "Postgres" to make it real and competitive.*

#### [MODIFY] [supabase_schema.sql](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/supabase_schema.sql)
-   Add `total_xp`, `level`, and `weekly_xp` to `profiles`.
-   Add `badges` array or jsonb column to `profiles`.

#### [NEW] [actions/gamification.ts](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/lib/actions/gamification.ts)
-   `addXp(userId, amount, source)`: Securely add XP on server.
-   `getLeaderboard(period)`: Fetch top 50 users by XP.

#### [MODIFY] [progress-store.ts](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/store/progress-store.ts)
-   Sync local optimistically updated XP with server values on load.

### Phase 2: "The Mirror" (Deep Analytics)
*Give users professional-grade insights into their performance.*

#### [NEW] [AnalyticsView.tsx](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/components/modules/AnalyticsView.tsx)
-   **Activity Heatmap**: A GitHub-style contribution calendar for "Days Studied".
-   **Accuracy Radar**: A spider chart showing strength in different sub-topics (e.g., Speed Math vs. Grammar vs. Logic).

#### [MODIFY] [CompetitionArena.tsx](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/components/modules/CompetitionArena.tsx)
-   Track "Time per Question" and push to a new `analytics_logs` table (or similar).

### Phase 3: "The Hall of Fame" (Social & Badges)
*Reward achievements visible to others.*

#### [NEW] [Badges.tsx](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/components/ui/Badges.tsx)
-   Component to render "Glassmorphic" badges (e.g., "7 Day Streak", "Math Whiz").

#### [MODIFY] [Leaderboard.tsx](file:///c:/Users/ASHUTOSH/Desktop/30daysmastery/src/components/modules/Leaderboard.tsx)
-   Connect to real data.
-   Show "You are top X%" notification.

## Verification Plan

### Manual Verification
-   **XP Sync**: Complete a quiz, refresh page, check if XP persists from DB.
-   **Leaderboard**: Create a second dummy account, earn XP, check if ranking updates.
-   **Analytics**: Verify the Heatmap lights up for today's date after activity.
