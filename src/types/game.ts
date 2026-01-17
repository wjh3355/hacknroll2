export type GameState = "menu" | "countdown" | "playing" | "gameOver"

export interface Word {
	id: string
	text: string
	emoji: string
	position: number
	status: "pending" | "correct" | "wrong" | "missed"
}

export interface GameConfig {
	initialBpm: number
	bpmIncrement: number
	maxBpm: number
	wordsPerRound: number
	beatToleranceMs: number
	speechMatchThreshold: number
	countdownSeconds: number
}

export interface GameSession {
	state: GameState
	currentRound: number
	currentBpm: number
	score: number
	currentWordIndex: number
	words: Word[]
	lastSpokenWord: string | null
	highScore: number
}

export type GameAction =
	| { type: "START_COUNTDOWN" }
	| { type: "START_PLAYING" }
	| { type: "ADVANCE_WORD"; correct: boolean; spokenWord: string | null }
	| { type: "END_GAME" }
	| { type: "NEXT_ROUND" }
	| { type: "SET_WORDS"; words: Word[] }
	| { type: "RESET" }
	| { type: "UPDATE_HIGH_SCORE"; score: number }
