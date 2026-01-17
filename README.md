# Say Words On Beat

A rhythm-based word game where you must say words in sync with a beat. Test your timing, reflexes, and speech coordination!

## How to Play

1. Click **Start Game** on the menu
2. Allow microphone access when prompted
3. After the 3-2-1 countdown, the game begins
4. **Say each word when it lights up** (highlighted in blue)
5. Stay on beat - the tick sound helps you keep rhythm
6. Game ends if you:
   - Say the wrong word
   - Miss a beat (stay silent)
7. Complete 8 words to advance to the next round (faster BPM!)

## Features

- **2x4 word grid** with animated highlights
- **Beat engine** with precise timing using `requestAnimationFrame`
- **Speech recognition** via Web Speech API
- **Fuzzy matching** to handle speech recognition variations
- **Difficulty progression** - BPM increases each round (60 → 180)
- **Scoring system** - 100 points per word + round bonuses
- **High score persistence** via localStorage

## Controls

- **Voice**: Say the highlighted word
- **Space bar**: Manual input (for testing/fallback)

## Tech Stack

- React 19 + TypeScript
- Vite
- Web Speech API
- Web Audio API

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Browser Support

Best experience in **Google Chrome** (required for Web Speech API).

Safari has limited support. Firefox does not support the Web Speech API.

## Debugging

Open browser DevTools Console to see speech recognition logs:
- `[Speech] Recognition started` - API started listening
- `[Speech] Transcript: ...` - What was detected
- `[Game] Spoken word: ... | Expected: ...` - Matching comparison

## License

MIT
