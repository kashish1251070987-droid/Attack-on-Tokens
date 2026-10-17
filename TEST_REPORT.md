# Persona V2 Test Report

Status: **17/17 automated browser tests passed** on October 17, 2026.

The test runner opened the real local application in headless Chrome, exercised the DOM, timers, pointer events and `localStorage`, and captured full-page screenshots in `evidence/`.

| # | Requirement | Verified result | Status | Evidence |
|---|---|---|---|---|
| 1 | Animal-photo scramble | Photo became a random animal, name changed, and both persisted | PASS | `evidence/01-photo-and-name-changed.png` |
| 2 | Biography letter loss | Biography saved while exactly one alphabetic character disappeared elsewhere | PASS | `evidence/02-biography-letter-loss.png` |
| 3 | Followers | Pointer entry and click each reduced the count once without double-firing | PASS | `evidence/03-followers-shrunk.png` |
| 4 | Follow labels | Follow → Following → Unfollowed → Followed successfully, with stable styling | PASS | `evidence/04-follow-gaslighting.png` |
| 5 | Settings | The clicked control stayed unchanged while exactly one different setting changed | PASS | `evidence/05-dishonest-settings.png` |
| 6 | Swapped authentication | Log In opened account creation; Sign Up opened sign-in; no password was stored | PASS | `evidence/06-swapped-auth.png` |
| 7 | Language roulette | Selected label remained visible while the interface used a different language/encoding | PASS | `evidence/07-language-roulette.png` |
| 8 | Notification hydra | Badge followed 3 → 0 → 1 after the required delay | PASS | `evidence/08-notification-hydra.png` |
| 9 | Recommendation | Stationary dismiss control removed the card, which then returned in a different position | PASS | `evidence/09-recommendation-resurrected.png` |
| 10 | Sorting | Visible labels applied the specified opposite deterministic order | PASS | `evidence/10-dishonest-sort.png` |
| 11 | Interest progress | Progress visibly reached 99%, dropped to 73%, reached 100%, then persisted | PASS | `evidence/11-interest-progress-complete.png` |
| 12 | Load More | Each activation waited about 800 ms and appended exactly two recycled cards | PASS | `evidence/12-load-more.png` |
| 13 | Login language gate | Changing language from the account screen required a random equation and height, then returned to the form | PASS | `evidence/13-login-language-gate.png` |
| 14 | Logout denial | Logout launched the bundled looping cartoon and kept the account signed in | PASS | `evidence/14-logout-cartoon-denial.png` |
| 15 | Audible Help | Help triggered the “Help me please” speech event and matching feedback | PASS | `evidence/15-help-me-please.png` |
| 16 | Irrelevant volume | Moving the unrelated volume control changed its readout and triggered synthesized nuisance audio | PASS | `evidence/16-irrelevant-volume.png` |
| 17 | Why gate | Log In was blocked, its action named, and only replayed after a typed explanation | PASS | `evidence/17-why-every-action.png` |

Run the suite again with `node run_tests.js` after making changes. The machine must expose Playwright and a Chromium-based browser to Node.

