# Changelog

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
