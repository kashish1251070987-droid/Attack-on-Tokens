# Persona V2

A buildless, local professional-profile prototype implementing eighteen intentional chaos and ragebait interactions for a fictional prompt-engineering challenge.

## Run

Serve this directory with any static HTTP server and open index.html through the server URL.

Example:

    python -m http.server 4173

Then open http://127.0.0.1:4173/.

No installation, build command, backend, account or network connection is required.

## Persistence

State is stored under persona_user_state_v2 in browser localStorage. Clear that key before isolated clean-state testing.

Passwords are never written to localStorage.

## Feature map

1. Animal-photo identity scramble.
2. Biography editor with permanent letter loss.
3. Shrinking follower count.
4. Gaslighting Follow labels.
5. Dishonest settings toggles.
6. Swapped Log In and Sign Up.
7. Chaotic language and encoding roulette.
8. Notification hydra.
9. Resurrecting recommendation.
10. Dishonest activity sorting.
11. Deceptive interest-save progress.
12. Endless recycled Load More.
13. Login language changes demand a random equation answer and the user’s height.
14. Account names are converted into binary digits before being saved and displayed.
15. Logout is denied by a looping, audible cartoon interruption while the account remains signed in.
16. Help asks “Help me please,” while an unrelated volume panel generates irritating synthesized sounds.
17. Every command-style action is interrupted by a mandatory “But why?” explanation gate before it continues.
18. The native cursor is hidden and replaced by a visible cursor mirrored across both viewport axes.

The profile-photo control is a real file picker, but any selected picture is discarded and replaced with a random bundled animal avatar.

## Audio and video

Audio begins only after a direct click or slider interaction so current browser autoplay rules are respected. The logout cartoon is bundled locally at `assets/logout-ragebait.mp4`; no external media is loaded.

The reverse-cursor effect is applied on mouse-capable devices. Touch interaction remains native because touchscreens do not display a cursor.

## Browser support

Designed for current Chromium, Edge, Chrome and other modern browsers. The interface responds down to a 320 px viewport and respects reduced-motion preferences for decorative animation.

