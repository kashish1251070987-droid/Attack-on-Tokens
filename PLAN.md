# Persona V2 Implementation Plan

## Objective

Build a premium professional-profile interface whose visual credibility conceals eighteen deterministic hostile and ragebait interactions. All behavior is local, fictional, persistent where required, and independently testable.

## Architecture

- Semantic HTML5 for landmarks, forms, modals and controls.
- Modern responsive CSS with design tokens, glass surfaces and accessible focus treatment.
- Vanilla JavaScript for state, timers, random selection and rendering.
- One localStorage namespace: persona_user_state_v2.
- Eight bundled SVG animal avatars and one locally generated MP4 cartoon; no network dependencies.

## Files

- index.html — interface and modal structure.
- styles.css — visual system, responsive layout and motion preferences.
- script.js — rendering, persistence and all twelve laws.
- assets/animals/ — eight local animal portraits.
- evidence/ — browser verification screenshots.
- README.md and TEST_REPORT.md — usage and evidence record.

## State model

The stored object contains avatar, displayName, biography, follower count, setting states, mock account metadata without passwords, language label and actual output mode, notification state, recommendation visibility and position, feed sorting, interests, appended feed count and corruption-target text.

Follow-label state and active timers reset on reload for predictable demonstrations.

## Event map

1. Change Photo chooses a different animal and name, then persists both.
2. Edit Name opens biography; save changes biography and deletes one eligible letter.
3. Follower pointer entry and click decrement once per valid event.
4. Follow advances through Following, timed Unfollowed and Followed successfully.
5. A settings activation changes exactly one different setting.
6. Log In opens account creation; Sign Up opens sign-in.
7. Language selection preserves the chosen label while applying a different language or numeric encoding.
8. Mark all notifications read; one unread notification returns after 900 ms.
9. Recommendation dismiss control evades once, disappears, then returns elsewhere after 1.5 s.
10. Feed-sort labels apply deliberately opposite deterministic ordering.
11. Interest saving animates 0→99, pauses, falls to 73, then reaches 100 before commit.
12. Load More waits 800 ms and appends two recycled cards per activation.
13. Login language selection opens a random math challenge and requires height before continuing.
14. A typed account name receives a live binary preview and is stored/displayed as binary after submission.
15. Logout opens a looping cartoon with sound and deliberately leaves the account signed in.
16. Help speaks “Help me please”; an unrelated volume control produces synthesized nuisance tones.
17. A capturing interaction guard asks for a typed reason before every command-style action, then safely replays that action once.
18. A fixed fake cursor mirrors mouse coordinates as `(viewport width − x, viewport height − y)` while the native pointer is hidden.

## Failure prevention

- Timer handles are cleared before creating replacements.
- Password values never enter application state or storage.
- Random choices exclude current values.
- Language conversion never touches IDs, values, URLs or accessible names.
- Recommendation and notification insertion de-duplicate by stable IDs.
- Loading and saving controls prevent overlapping sequences.
- Modal close and Escape paths remain available.
- The Why gate excludes its own form controls to prevent recursive interception and keeps submitted explanations session-only.
- Automated regression runs use an explicit query flag to bypass the Why gate; dedicated user-mode tests verify the gate and reverse cursor separately.

## Verification

Run every law in an isolated clean state where appropriate, inspect localStorage, verify timing boundaries, compare card metadata and capture named evidence screenshots. The final report records expected and actual outcomes for all twelve laws.

