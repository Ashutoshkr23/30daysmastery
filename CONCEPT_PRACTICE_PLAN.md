# Per-Concept Practice Implementation Plan

## Overview
Add "Practice" buttons to concept and memory cards that launch focused practice sessions for that specific concept only, creating a tighter learning loop.

---

## Current vs Proposed Flow

### Current Flow ❌
1. Read all concept cards
2. Read all memory cards  
3. Exit to lobby
4. Click "Speed Drill"
5. Practice ALL concepts mixed together

### Proposed Flow ✅
1. Read concept card → **Practice JUST that concept** (10-15 questions)
2. Read memory card → **Practice JUST those tables** (10-15 questions)
3. Repeat for each concept
4. Optional: Mixed practice in Speed Drill

---

## Benefits

- ✅ **Immediate reinforcement** - Practice right after learning
- ✅ **Focused learning** - Master one concept at a time
- ✅ **Better retention** - Spaced repetition per concept
- ✅ **Less overwhelming** - Small chunks vs. everything mixed
- ✅ **Clear progress tracking** - See mastery per concept

---

## Implementation Steps

### Phase 1: Data Structure Updates

#### 1.1 Update Course JSON Schema
**File:** `src/data/courses/speed-maths.json`

Add `practiceConfig` to concept and memory cards:

```json
{
  "type": "concept",
  "title": "Complement to 10 Trick",
  "content": "...",
  "practiceConfig": {
    "generator": "gen_add_complement_10",
    "questionCount": 10,
    "passingScore": 7,
    "timeLimit": 60
  }
}
```

#### 1.2 Update TypeScript Types
**File:** `src/types/course.ts`

```typescript
interface PracticeConfig {
  generator: string;
  questionCount: number;
  passingScore: number;
  timeLimit?: number;
}

interface ConceptCard {
  type: 'concept';
  title: string;
  content: string;
  practiceConfig?: PracticeConfig;
}

interface MemoryCard {
  type: 'memory';
  title: string;
  items: string[];
  practiceConfig?: PracticeConfig;
}
```

---

### Phase 2: UI Components

#### 2.1 Add Practice Button to StudyCardDeck
**File:** `src/components/modules/StudyCardDeck.tsx`

Add button at bottom of concept/memory cards:
```tsx
{card.practiceConfig && (
  <PremiumButton 
    onClick={() => startConceptPractice(card.practiceConfig)}
    className="w-full mt-4"
  >
    Practice This Concept (10 questions)
  </PremiumButton>
)}
```

#### 2.2 Create ConceptPractice Component
**New File:** `src/components/modules/ConceptPractice.tsx`

Features:
- Takes `PracticeConfig` as prop
- Generates questions using specified generator
- Shows progress (Question 3/10)
- Timer (optional)
- Submit answer → immediate feedback
- Results screen with score
- "Back to Study" button

#### 2.3 Update DayView to Handle Practice Mode
**File:** `src/components/modules/DayView.tsx`

Add state for practice mode:
```typescript
const [practiceMode, setPracticeMode] = useState<PracticeConfig | null>(null);

if (practiceMode) {
  return <ConceptPractice 
    config={practiceMode} 
    onComplete={(score) => {
      // Save progress
      setPracticeMode(null);
    }}
  />;
}
```

---

### Phase 3: Practice Session Logic

#### 3.1 Question Generation
**File:** `src/lib/questionGenerators.ts`

Ensure all generators are exported and accessible:
```typescript
export const generatorMap = {
  'gen_add_complement_10': gen_add_complement_10,
  'gen_add_near_doubles': gen_add_near_doubles,
  // ... all generators
};
```

#### 3.2 Practice Session State
**New File:** `src/hooks/useConceptPractice.ts`

```typescript
export function useConceptPractice(config: PracticeConfig) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  
  // Generate questions on mount
  // Handle answer submission
  // Calculate score
  // Return state and handlers
}
```

---

### Phase 4: Progress Tracking

#### 4.1 Database Schema
**New Migration:** `supabase/migrations/concept_practice.sql`

```sql
CREATE TABLE concept_practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  day_number INT,
  concept_title TEXT,
  generator_name TEXT,
  score INT,
  total_questions INT,
  time_taken INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.2 Save Practice Results
**File:** `src/lib/actions/practice.ts`

```typescript
export async function saveConceptPractice(data: {
  dayNumber: number;
  conceptTitle: string;
  generatorName: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
}) {
  // Save to database
  // Update user progress
}
```

#### 4.3 Show Concept Mastery
Display on concept cards:
```tsx
<div className="text-xs text-green-500">
  ✓ Mastered (9/10 correct)
</div>
```

---

### Phase 5: UX Enhancements

#### 5.1 Practice Button States
- **Not attempted:** "Practice This Concept"
- **In progress:** "Continue Practice (5/10)"
- **Completed:** "Practice Again (Last: 8/10)"

#### 5.2 Immediate Feedback
After each answer:
- ✅ Correct: Green flash + "Correct!"
- ❌ Wrong: Red flash + "Correct answer: X"
- Auto-advance after 1 second

#### 5.3 Results Screen
Show:
- Score: 8/10 (80%)
- Time taken: 45 seconds
- Accuracy per question type
- "Practice Again" or "Back to Study"

---

## File Changes Summary

### New Files
- `src/components/modules/ConceptPractice.tsx`
- `src/hooks/useConceptPractice.ts`
- `supabase/migrations/concept_practice.sql`
- `src/lib/actions/practice.ts`

### Modified Files
- `src/data/courses/speed-maths.json` - Add practiceConfig to all cards
- `src/types/course.ts` - Add PracticeConfig interface
- `src/components/modules/StudyCardDeck.tsx` - Add practice button
- `src/components/modules/DayView.tsx` - Handle practice mode
- `src/lib/questionGenerators.ts` - Export generator map

---

## Implementation Order

### Day 1: Data & Types
1. Update TypeScript types
2. Add practiceConfig to Day 1 in JSON
3. Export generator map

### Day 2: Core Components
1. Create ConceptPractice component
2. Create useConceptPractice hook
3. Add practice button to StudyCardDeck

### Day 3: Integration & Testing
1. Wire up DayView practice mode
2. Test with Day 1 concepts
3. Add immediate feedback animations

### Day 4: Progress Tracking
1. Create database migration
2. Implement save practice results
3. Show mastery indicators on cards

### Day 5: Polish & Rollout
1. Add to all 30 days
2. Test edge cases
3. Deploy to production

---

## Open Questions

1. **Question count per practice?**
   - Suggestion: 10 questions (quick win)
   - Alternative: 15 questions (more thorough)

2. **Mandatory or optional?**
   - Suggestion: Optional (better UX)
   - Alternative: Mandatory (ensures mastery)

3. **Keep Speed Drill?**
   - Suggestion: Yes, for mixed practice
   - Alternative: Replace entirely

4. **Time limit?**
   - Suggestion: No timer (less pressure)
   - Alternative: 60 seconds (gamification)

5. **Passing score requirement?**
   - Suggestion: No requirement (practice is learning)
   - Alternative: Must get 7/10 to proceed

---

## Success Metrics

Track these after implementation:
- % of users who use per-concept practice
- Average score per concept
- Time spent per concept
- Completion rate improvement
- User retention after this feature

---

## Future Enhancements

- **Adaptive difficulty:** Harder questions if user scores high
- **Spaced repetition:** Remind to practice weak concepts
- **Leaderboard:** Compare concept mastery with others
- **Achievements:** "Master of Complement to 10"
- **Practice streaks:** "5 days practicing daily"

---

Ready to implement tomorrow! 🚀
