import type { Word } from "../types/game"

// Word to emoji mapping
const WORD_EMOJI_MAP: Record<string, string> = {
	// B sounds
	bird: "🐦",
	bear: "🐻",
	ball: "⚽",
	bus: "🚌",
	book: "📖",
	box: "📦",
	big: "🔺",
	blue: "🔵",
	// D sounds
	dog: "🐶",
	duck: "🦆",
	dance: "💃",
	down: "⬇️",
	// C/K sounds
	cat: "🐱",
	car: "🚗",
	cup: "☕",
	cold: "🧊",
	key: "🔑",
	// S sounds
	sun: "☀️",
	star: "⭐",
	snow: "❄️",
	sing: "🎤",
	soft: "🔇",
	six: "6️⃣",
	seven: "7️⃣",
	small: "🔻",
	stop: "🛑",
	slow: "🐌",
	// T sounds
	tree: "🌳",
	two: "2️⃣",
	three: "3️⃣",
	talk: "💬",
	// R sounds
	red: "🔴",
	run: "🏃",
	rain: "🌧️",
	rock: "🪨",
	right: "➡️",
	// F sounds
	fish: "🐟",
	frog: "🐸",
	four: "4️⃣",
	five: "5️⃣",
	fast: "⚡",
	// W sounds
	walk: "🚶",
	wind: "💨",
	white: "⚪",
	// G sounds
	go: "🏃",
	green: "🟢",
	gold: "🟡",
	gray: "⚫",
	// L sounds
	left: "⬅️",
	lion: "🦁",
	loud: "🔊",
	// Others
	jump: "🦘",
	hat: "🎩",
	in: "📥",
	out: "📤",
	yes: "✅",
	no: "❌",
	moon: "🌙",
	one: "1️⃣",
	eight: "8️⃣",
	up: "⬆️",
	pink: "🩷",
	black: "⚫",
	hot: "🔥"
}

// Groups of words that sound similar (start with same sound)
const SOUND_ALIKE_GROUPS = [
	["bird", "bear", "ball", "bus", "book", "box", "big", "blue"],
	["dog", "duck", "dance", "down"],
	["cat", "car", "cup", "cold", "key"],
	[
		"sun",
		"star",
		"snow",
		"sing",
		"soft",
		"six",
		"seven",
		"small",
		"stop",
		"slow"
	],
	["tree", "two", "three", "talk"],
	["red", "run", "rain", "rock", "right"],
	["fish", "frog", "four", "five", "fast"],
	["walk", "wind", "white"],
	["go", "green", "gold", "gray"],
	["left", "lion", "loud"]
]

// Simple, common words that are easy to recognize by speech API
export const WORD_BANK = Object.keys(WORD_EMOJI_MAP)

// Pattern definitions for 4-word rows (will be repeated for 2x4 grid)
const PATTERNS = [
	[0, 1, 0, 1], // ABAB
	[0, 0, 1, 1], // AABB
	[0, 1, 1, 0], // ABBA
	[0, 1, 1, 1], // ABBB
	[1, 1, 0, 1], // BBAB
	[0, 1, 0, 0], // ABAA
	[1, 0, 1, 1], // BABB
	[0, 0, 0, 1] // AAAB
]

export const getRandomWords = (count: number): Word[] => {
	// Pick a random sound-alike group
	const group =
		SOUND_ALIKE_GROUPS[Math.floor(Math.random() * SOUND_ALIKE_GROUPS.length)]

	// Pick two random words from that group
	const shuffled = [...group].sort(() => Math.random() - 0.5)
	const wordA = shuffled[0]
	const wordB = shuffled[1]

	// Pick a random pattern
	const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]

	// Repeat pattern for both rows (2x4 grid = 8 words)
	const fullPattern = [...pattern, ...pattern]

	// Apply the pattern
	return fullPattern.slice(0, count).map((wordIndex, index) => {
		const word = wordIndex === 0 ? wordA : wordB
		return {
			id: `word-${index}-${Date.now()}`,
			text: word,
			emoji: WORD_EMOJI_MAP[word],
			position: index,
			status: "pending" as const
		}
	})
}
