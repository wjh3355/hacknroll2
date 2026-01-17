# Changelog

## Debug: Speech Recognition Logging

### Added
- Debug logging to `src/hooks/useSpeechRecognition.ts` - Logs all speech events
- Debug logging to `src/components/screens/GameScreen.tsx` - Logs word matching
- `README.md` - Project documentation with usage and debugging instructions

### How to Debug
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Start the game and speak
4. Look for `[Speech]` and `[Game]` prefixed logs

---

## Phase 5: Polish

### Added
- `src/components/game/ScoreDisplay.tsx` - Score display with popup animation on points earned

### Modified
- `src/components/screens/GameScreen.tsx` - Added round notification, integrated ScoreDisplay
- `src/styles/game.css` - Added score popup animation, round notification styles

### Notes
- Score pulses green when points are earned
- "Round X! Speed up!" notification appears when entering a new round
- All animations are smooth and non-blocking

---

## Phase 4: Game Loop

### Modified
- `src/components/screens/CountdownScreen.tsx` - Added microphone permission flow and beat preview sounds
- `src/contexts/GameContext.tsx` - Fixed round transition to auto-generate new words
- `src/components/screens/GameScreen.tsx` - Simplified beat handler
- `src/styles/game.css` - Added microphone permission styles

### Notes
- Game now requests mic permission during countdown
- Shows error screen if mic permission is denied
- Countdown plays beat ticks to help player get in rhythm
- Round transitions now properly generate new words

---

## Phase 3: Speech Recognition

### Added
- `src/hooks/useSpeechRecognition.ts` - Web Speech API wrapper with auto-restart and error handling
- `src/utils/speechMatcher.ts` - Fuzzy matching with Levenshtein distance and common mishears
- `src/components/game/SpeechFeedback.tsx` - Displays transcript, expected word, and result indicators

### Modified
- `src/components/screens/GameScreen.tsx` - Integrated speech recognition with game validation
- `src/styles/game.css` - Added speech feedback styling

### Notes
- Speech recognition uses interim results for lower latency
- Fuzzy matching threshold: 0.7 similarity
- Handles common mishears (e.g., "two" vs "to", "won" vs "one")
- Auto-restarts on `no-speech` errors
- SPACE key still works as fallback for testing

---

## Phase 2: Beat Engine & Audio

### Added
- `src/hooks/useBeatEngine.ts` - High-precision beat timing using requestAnimationFrame
- `src/hooks/useAudioPlayer.ts` - Web Audio API for beat tick, success, and failure sounds
- `src/components/game/BeatIndicator.tsx` - Visual beat pulse indicator

### Modified
- `src/components/screens/GameScreen.tsx` - Integrated beat engine with word highlighting
- `src/styles/game.css` - Added beat indicator styling and test hint styles

### Notes
- Beat engine uses `performance.now()` for precise timing
- Keyboard controls added for testing: SPACE (correct), X (wrong)
- Game now ends if player misses a beat (doesn't respond in time)

---

## Phase 1: Core Setup

### Added
- `src/types/game.ts` - TypeScript interfaces for game state, words, and configuration
- `src/utils/constants.ts` - Game configuration constants (BPM, tolerance, etc.)
- `src/utils/wordBank.ts` - Word lists and random selection function
- `src/contexts/GameContext.tsx` - Global game state with reducer pattern
- `src/components/game/WordCell.tsx` - Individual word cell component
- `src/components/game/WordGrid.tsx` - 2x4 grid layout component
- `src/components/screens/MenuScreen.tsx` - Start menu screen
- `src/components/screens/GameScreen.tsx` - Main game screen
- `src/components/screens/GameOverScreen.tsx` - Game over screen
- `src/styles/game.css` - Game styling
- `src/styles/grid.css` - Word grid styling
- Updated `src/App.tsx` - Integrated game context and screen routing
