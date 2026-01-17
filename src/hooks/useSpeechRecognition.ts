import { useCallback, useEffect, useRef, useState } from "react"

export interface SpeechAlternative {
	transcript: string
	confidence: number
}

interface SpeechRecognitionOptions {
	onResult: (
		transcript: string,
		isFinal: boolean,
		alternatives: SpeechAlternative[]
	) => void
	onError: (error: string) => void
	continuous?: boolean
	interimResults?: boolean
}

interface SpeechRecognitionReturn {
	isListening: boolean
	isSupported: boolean
	transcript: string
	start: () => void
	stop: () => void
	reset: () => void
	error: string | null
}

// Type definitions for Web Speech API
interface ISpeechRecognition extends EventTarget {
	continuous: boolean
	interimResults: boolean
	lang: string
	maxAlternatives: number
	onstart: ((this: ISpeechRecognition, ev: Event) => void) | null
	onresult:
		| ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void)
		| null
	onerror:
		| ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void)
		| null
	onend: ((this: ISpeechRecognition, ev: Event) => void) | null
	start: () => void
	stop: () => void
	abort: () => void
}

interface ISpeechRecognitionEvent extends Event {
	results: ISpeechRecognitionResultList
	resultIndex: number
}

interface ISpeechRecognitionResultList {
	length: number
	[index: number]: ISpeechRecognitionResult
}

interface ISpeechRecognitionResult {
	isFinal: boolean
	length: number
	[index: number]: ISpeechRecognitionAlternative
}

interface ISpeechRecognitionAlternative {
	transcript: string
	confidence: number
}

interface ISpeechRecognitionErrorEvent extends Event {
	error: string
	message: string
}

// Get the SpeechRecognition constructor
const getSpeechRecognition = (): (new () => ISpeechRecognition) | null => {
	if (typeof window === "undefined") return null

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const win = window as any
	return win.SpeechRecognition || win.webkitSpeechRecognition || null
}

export function useSpeechRecognition({
	onResult,
	onError,
	continuous = true,
	interimResults = true
}: SpeechRecognitionOptions): SpeechRecognitionReturn {
	const [isListening, setIsListening] = useState(false)
	const [transcript, setTranscript] = useState("")
	const [error, setError] = useState<string | null>(null)

	const recognitionRef = useRef<ISpeechRecognition | null>(null)
	const shouldRestartRef = useRef(false)
	const isListeningRef = useRef(false)
	const isSupported = !!getSpeechRecognition()

	// Use refs for callbacks to avoid recreating recognition on every render
	const onResultRef = useRef(onResult)
	const onErrorRef = useRef(onError)

	// Keep refs updated
	useEffect(() => {
		onResultRef.current = onResult
		onErrorRef.current = onError
	}, [onResult, onError])

	const start = useCallback(() => {
		const SpeechRecognitionClass = getSpeechRecognition()
		if (!SpeechRecognitionClass) {
			setError("Speech recognition not supported")
			onErrorRef.current("Speech recognition not supported in this browser")
			return
		}

		// If already listening, don't restart
		if (recognitionRef.current && shouldRestartRef.current) {
			console.log("[Speech] Already listening, skipping start")
			return
		}

		// Stop any existing recognition
		if (recognitionRef.current) {
			recognitionRef.current.abort()
		}

		const recognition = new SpeechRecognitionClass()
		recognition.continuous = continuous
		recognition.interimResults = interimResults
		recognition.lang = "en-US"
		recognition.maxAlternatives = 3

		recognition.onstart = () => {
			console.log("[Speech] Recognition started")
			isListeningRef.current = true
			setIsListening(true)
			setError(null)
			// Set shouldRestart here, after successfully starting
			shouldRestartRef.current = true
		}

		recognition.onresult = (event: ISpeechRecognitionEvent) => {
			console.log("[Speech] onresult fired, results:", event.results.length)
			const result = event.results[event.results.length - 1]
			const isFinal = result.isFinal

			// Collect ALL alternatives
			const alternatives: SpeechAlternative[] = []
			for (let i = 0; i < result.length; i++) {
				alternatives.push({
					transcript: result[i].transcript.trim().toLowerCase(),
					confidence: result[i].confidence
				})
			}

			const transcriptText = alternatives[0]?.transcript || ""

			console.log(
				"[Speech] Alternatives:",
				alternatives
					.map(a => `"${a.transcript}" (${(a.confidence * 100).toFixed(1)}%)`)
					.join(", ")
			)
			console.log("[Speech] Final:", isFinal)

			setTranscript(transcriptText)
			console.log("[Speech] Calling onResultRef.current with:", transcriptText)
			if (onResultRef.current) {
				onResultRef.current(transcriptText, isFinal, alternatives)
				console.log("[Speech] onResultRef.current called successfully")
			} else {
				console.log("[Speech] WARNING: onResultRef.current is null!")
			}
		}

		recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
			console.log("[Speech] Error:", event.error, event.message)

			switch (event.error) {
				case "no-speech":
					// User didn't say anything - this is fine, just restart
					break
				case "audio-capture":
					setError("Microphone not accessible")
					onErrorRef.current("Microphone not accessible")
					shouldRestartRef.current = false
					break
				case "not-allowed":
					setError("Microphone permission denied")
					onErrorRef.current("Microphone permission denied")
					shouldRestartRef.current = false
					break
				case "network":
					setError("Network error")
					onErrorRef.current(
						"Network error - speech recognition may be unavailable"
					)
					break
				case "aborted":
					// Recognition was aborted - this is intentional
					break
				default:
					// Try to recover from other errors
					setError(event.error)
			}
		}

		recognition.onend = () => {
			console.log(
				"[Speech] Recognition ended, shouldRestart:",
				shouldRestartRef.current
			)
			isListeningRef.current = false
			setIsListening(false)

			// Auto-restart if we should still be listening
			// Only check inside timeout to avoid race conditions with stop()
			setTimeout(() => {
				// Check we still want to restart and aren't already listening
				if (
					shouldRestartRef.current &&
					!isListeningRef.current &&
					recognitionRef.current
				) {
					try {
						console.log("[Speech] Restarting recognition...")
						recognitionRef.current.start()
					} catch (e) {
						console.log("[Speech] Failed to restart:", e)
					}
				} else if (shouldRestartRef.current) {
					console.log("[Speech] Skip restart - already listening or stopped")
				}
			}, 100)
		}

		recognitionRef.current = recognition as ISpeechRecognition

		try {
			recognition.start()
		} catch (e) {
			console.log("Failed to start speech recognition:", e)
			setError("Failed to start speech recognition")
		}
	}, [continuous, interimResults])

	const stop = useCallback(() => {
		console.log("[Speech] Stop called")
		shouldRestartRef.current = false
		isListeningRef.current = false
		if (recognitionRef.current) {
			recognitionRef.current.abort()
			recognitionRef.current = null
		}
		setIsListening(false)
	}, [])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			shouldRestartRef.current = false
			if (recognitionRef.current) {
				recognitionRef.current.abort()
			}
		}
	}, [])

	const reset = useCallback(() => {
		console.log("[Speech] Reset called - restarting recognition")
		if (recognitionRef.current && shouldRestartRef.current) {
			try {
				recognitionRef.current.abort()
				// The onend handler will automatically restart it
			} catch (e) {
				console.log("[Speech] Failed to reset:", e)
			}
		}
	}, [])

	return {
		isListening,
		isSupported,
		transcript,
		start,
		stop,
		reset,
		error
	}
}
