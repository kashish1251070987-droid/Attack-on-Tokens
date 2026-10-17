# Persona V2

Persona is a buildless professional-profile prototype created for the **Attack on Tokens** prompt-engineering challenge. Its calm, premium interface deliberately conceals seventeen deterministic hostile and ragebait interactions.

> **Challenge context:** this repository is a fictional adversarial-UX demonstration. Several interactions intentionally contradict their labels. It is not intended to be reused as production UX.

## Quick start

No build step, backend, account or network connection is required.

1. Open a terminal in the repository.
2. Start any static HTTP server:

       python -m http.server 4173

3. Visit http://127.0.0.1:4173/.

Opening index.html directly may work for basic interaction, but a local HTTP server is recommended for consistent browser testing and media playback.

## Feature map

| # | Interaction | Deliberate result |
|---:|---|---|
| 1 | Change Photo | Discards the selected picture, assigns a bundled animal avatar and changes the display name |
| 2 | Edit Name | Opens the biography editor and permanently removes one letter elsewhere after saving |
| 3 | Followers | Pointer entry and clicks reduce the follower count |
| 4 | Follow | Cycles through misleading timed labels without changing its styling |
| 5 | Settings | Leaves the activated toggle unchanged and changes a different one |
| 6 | Authentication | Log In creates an account; Sign Up opens sign-in |
| 7 | Language | Preserves the selected label while applying another language or numeric encoding |
| 8 | Notifications | “Mark all read” reaches zero before a new unread item returns |
| 9 | Recommendation | Dismisses normally, then reappears elsewhere after 1.5 seconds |
| 10 | Feed sorting | Applies deterministic ordering opposite to the visible sort label |
| 11 | Interests | Progress reaches 99%, falls to 73%, then completes |
| 12 | Load More | Adds recycled activity presented as new content |
| 13 | Login language gate | Demands a random equation answer and height before continuing |
| 14 | Binary identity | Converts account names to binary before storing and displaying them |
| 15 | Logout denial | Plays a bundled cartoon while keeping the account signed in |
| 16 | Help and volume | Help asks for help; an unrelated volume control produces nuisance audio |
| 17 | Why gate | Requires a typed explanation before command-style actions continue |

## Design and architecture

- Semantic HTML5 landmarks, forms, dialogs and controls.
- Responsive CSS design system with accessible focus treatment.
- Modular vanilla JavaScript with no framework or build tooling.
- Eight bundled SVG animal avatars and locally bundled logout media.
- Stable data-testid attributes for repeatable browser automation.
- One localStorage namespace: persona_user_state_v2.
- Timer de-duplication for notifications, recommendations and progress effects.
- Deterministic test paths for otherwise random behaviour.

## Repository structure

    .
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── PLAN.md
    ├── README.md
    ├── TEST_REPORT.md
    ├── run_tests.js
    ├── test_results.json
    ├── assets/
    │   ├── animals/
    │   ├── logout-cartoon.svg
    │   └── logout-ragebait.mp4
    └── evidence/

## Persistence and privacy

Application state is stored locally under persona_user_state_v2. Clear that key before isolated clean-state testing.

The demonstration never sends authentication data to a server. Password values are used only for immediate form validation and are never written to localStorage, reports or screenshots.

## Automated verification

The browser suite validates all seventeen interactions, timing boundaries, persistence and core non-interference rules.

Run:

    node run_tests.js

The test environment must expose Playwright and a Chromium-based browser to Node. Results are written to test_results.json and screenshots are saved under evidence/.

See [TEST_REPORT.md](TEST_REPORT.md) for the acceptance matrix and evidence mapping.

## Accessibility boundaries

- Modals provide accessible labels and Escape/close paths.
- Mandatory controls remain keyboard-operable.
- Focus treatment remains visible.
- Decorative animation respects reduced-motion preferences where practical.
- The recommendation dismiss control remains stationary for both pointer and keyboard users.
- No custom or mirrored cursor replaces the browser’s native pointer.

## Browser support

Designed for current Chromium, Edge, Chrome and other modern browsers. The responsive interface supports viewports down to 320 pixels.
