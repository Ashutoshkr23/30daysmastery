# 30 Days Mastery - Development Plan

## Project Overview
**Name**: 30 Days Mastery
**Goal**: A premium, mobile-first PWA for Banking & SSC aspirants to master specific skills (Speed Maths, English Rules) in strictly structured 30-day challenges.
**Core Value**: "Doable Daily Mastery" - Breaking down overwhelming syllabi into 30 manageable days.

---

## 1. Technology Stack
-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Shadcn UI (Custom Premium Theme)
-   **PWA**: `next-pwa` (Service Workers, Manifest, Offline Support)
-   **State Management**: Zustand (for progress tracking & quiz state)
-   **Persistance**: LocalStorage (MVP) -> Supabase (Future)
-   **Icons**: Lucide React

---

## 2. Architecture & Data Structure
The app will use a "Static First" approach for course content, served via efficient JSON structures.

### Data Models
-   **Course**: Metadata (ID, Title, Description, TotalDays).
-   **Day**: Day Number, Title, UnlockStatus, Modules[].
-   **Module**: Type (`video`, `note`, `quiz`, `mock`), Content/Ref.

### PWA Strategy
-   **Manifest**: Standalone display, theme colors matching "Banking Blue/Purple".
-   **Caching**: Cache course JSONs and core assets for offline access.
-   **Installability**: Prompts for "Add to Home Screen" on day 2 or 3 of usage.

---

## 3. Product Features (MVP)

### A. Landing & Onboarding
-   **Hero Section**: Clear promise ("Master Speed Maths in 30 Days").
-   **Course Selector**: Cards for "Speed Maths" and "English Rules".
-   **Smart Redirect**: If user has started a course, auto-redirect to Dashboard.

### B. Course Dashboard (The "Path")
-   **Design**: Vertical or Horizontal specific timeline.
-   **Status Indicators**:
    -   🟢 **Completed**: Tick mark, fully green.
    -   🟡 **In Progress**: Pulse animation.
    -   🔒 **Locked**: Greyscale/Lock icon (Future usage).

### C. Day View (The Learning Interface)
A focused view for a specific day.
-   **Tabs/Swiper**:
    1.  **Watch**: Video Lesson (YouTube Embed with custom wrapper).
    2.  **Study**: Rich Text Notes (Markdown with Katex for Math).
    3.  **Practice**: Speed Quiz (Timer based).

### D. Quiz Engine
-   **Types**: MCQ (Single Select).
-   **Features**:
    -   Countdown Timer per question/set.
    -   Instant "Correct/Incorrect" feedback.
    -   Explanation card after answer.
    -   Score summary at the end.

---

## 4. Design Guidelines
-   **Theme**: "Premium Education" - Deep Blues, Royal Purples, Clean Whites/Light Greys.
-   **Typography**: Inter (Clean, readable sans-serif).
-   **Micro-interactions**: Button clicks, progress bar fills, card hovering effects.
-   **Mobile First**: Touch targets > 44px, bottom navigation for easy thumb access.

---

## 5. Development Phase Roadmap

### Phase 1: Foundation & Setup
-   [ ] Initialize Next.js with TS & Tailwind.
-   [ ] Setup PWA (Manifest, Icons).
-   [ ] Configure UI Components (Buttons, Cards, Navigation).
-   [ ] Define Global Styles & Themes.

### Phase 2: Core Course Engine
-   [ ] Implement `data-service.ts` for strictly typed JSON fetching.
-   [ ] Create "Course Layout" component.
-   [ ] Build "Day Timeline" UI.

### Phase 3: Learning Modules
-   [ ] Build **Video Player** component (Responsive Embed).
-   [ ] Build **Notes Viewer** (Markdown rendering).
-   [ ] Build **Quiz Runner** (State machine for questions).

### Phase 4: Polish & Launch
-   [ ] Add "Streak" logic.
-   [ ] Persist user progress to LocalStorage.
-   [ ] Final Design Polish (Animations, Transitions).
