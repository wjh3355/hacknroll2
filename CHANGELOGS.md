# Changelog

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
