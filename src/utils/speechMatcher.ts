import { GAME_CONFIG } from "./constants"

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = []

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i]
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1]
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j] + 1 // deletion
				)
			}
		}
	}

	return matrix[b.length][a.length]
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
	const maxLength = Math.max(a.length, b.length)
	if (maxLength === 0) return 1
	const distance = levenshteinDistance(a, b)
	return 1 - distance / maxLength
}

/**
 * Normalize a string for comparison
 */
function normalize(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, "") // Remove punctuation
		.replace(/\s+/g, " ") // Normalize whitespace
}

/**
 * Extract the last meaningful word from a transcript
 */
export function extractLastWord(transcript: string): string {
	const normalized = normalize(transcript)
	const words = normalized.split(" ").filter(w => w.length > 0)
	return words[words.length - 1] || ""
}

/**
 * Check if spoken word matches expected word
 */
export function matchWord(
	spoken: string,
	expected: string,
	threshold: number = GAME_CONFIG.speechMatchThreshold
): boolean {
	const normalizedSpoken = normalize(spoken)
	const normalizedExpected = normalize(expected)

	// Quick checks first (fastest)
	if (normalizedSpoken === normalizedExpected) return true
	if (normalizedSpoken.includes(normalizedExpected)) return true
	if (normalizedSpoken.endsWith(normalizedExpected)) return true

	// Extract last word and compare
	const lastWord = extractLastWord(normalizedSpoken)
	if (lastWord === normalizedExpected) return true

	// Only do fuzzy matching if we're close in length (optimization)
	const lengthDiff = Math.abs(lastWord.length - normalizedExpected.length)
	if (lengthDiff <= 2) {
		const similarity = calculateSimilarity(lastWord, normalizedExpected)
		if (similarity >= threshold) return true
	}

	// Check full text similarity only if short
	if (
		normalizedSpoken.length <= normalizedExpected.length + 3 &&
		normalizedSpoken.length <= 8
	) {
		const fullSimilarity = calculateSimilarity(
			normalizedSpoken,
			normalizedExpected
		)
		if (fullSimilarity >= threshold) return true
	}

	return false
}

/**
 * Common speech recognition misheard words mapping
 */
const COMMON_MISHEARS: Record<string, string[]> = {
	one: ["won", "wan", "1"],
	two: ["to", "too", "2"],
	three: ["tree", "free", "3"],
	four: ["for", "fore", "4"],
	five: ["5"],
	six: ["6"],
	seven: ["7"],
	eight: ["ate", "ait", "8"],
	nine: ["9"],
	ten: ["10"],
	blue: ["blew"],
	red: ["read"],
	sun: ["son"],
	no: ["know"],
	right: ["write"],
	duck: ["knock"]
}

/**
 * Number words to digits
 */
const NUMBER_MAPPINGS: Record<string, string> = {
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine",
	"10": "ten"
}

/**
 * Check if spoken word matches expected word considering common mishears
 */
export function matchWordWithMishears(
	spoken: string,
	expected: string,
	threshold: number = GAME_CONFIG.speechMatchThreshold
): boolean {
	// Normalize once for all checks
	const normalizedSpoken = normalize(spoken)
	const normalizedExpected = normalize(expected)

	// Quick exact match first
	if (normalizedSpoken === normalizedExpected) return true

	// Check number mappings (very fast lookup)
	if (NUMBER_MAPPINGS[normalizedSpoken] === normalizedExpected) return true
	if (NUMBER_MAPPINGS[normalizedExpected] === normalizedSpoken) return true

	// Check common mishears (fast array lookup)
	const mishears = COMMON_MISHEARS[normalizedExpected]
	if (mishears && mishears.includes(normalizedSpoken)) return true

	// Fall back to regular matching (more expensive)
	return matchWord(spoken, expected, threshold)
}

/**
 * Check if ANY of the speech alternatives match the expected word
 * Returns the matching alternative if found, null otherwise
 */
export function matchAnyAlternative(
	alternatives: Array<{ transcript: string; confidence: number }>,
	expected: string,
	threshold: number = GAME_CONFIG.speechMatchThreshold
): { transcript: string; confidence: number } | null {
	const normalizedExpected = normalize(expected)

	for (const alt of alternatives) {
		// Try matching the last word first (most common case)
		const lastWord = extractLastWord(alt.transcript)

		if (matchWordWithMishears(lastWord, normalizedExpected, threshold)) {
			console.log(`[Matcher] Match found: "${lastWord}" matches "${expected}"`)
			return alt
		}

		// Try full transcript if last word didn't match
		if (matchWordWithMishears(alt.transcript, normalizedExpected, threshold)) {
			console.log(
				`[Matcher] Match found (full): "${alt.transcript}" matches "${expected}"`
			)
			return alt
		}
	}

	console.log(
		`[Matcher] No match found for "${expected}" in alternatives:`,
		alternatives.map(a => a.transcript).join(", ")
	)
	return null
}
