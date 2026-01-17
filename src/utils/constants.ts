import type { GameConfig } from "../types/game"

export const GAME_CONFIG: GameConfig = {
	initialBpm: 30, // 60 BPM = 1 second per beat
	bpmIncrement: 10,
	maxBpm: 180,
	wordsPerRound: 8,
	beatToleranceMs: 250,
	speechMatchThreshold: 0.5, // Lowered for more forgiving matching
	countdownSeconds: 3
}

export const GRID_ROWS = 2
export const GRID_COLS = 4

export const HIGH_SCORE_KEY = "sayWordsOnBeat_highScore"
