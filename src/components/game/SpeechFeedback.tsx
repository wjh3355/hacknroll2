interface SpeechFeedbackProps {
  isListening: boolean;
  transcript: string;
  error: string | null;
  expectedWord: string;
  lastResult: 'correct' | 'wrong' | 'missed' | null;
}

export function SpeechFeedback({
  isListening,
  transcript,
  error,
  expectedWord,
  lastResult,
}: SpeechFeedbackProps) {
  return (
    <div className="speech-feedback">
      {error ? (
        <div className="speech-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="listening-status">
            {isListening ? (
              <span className="listening-indicator">🎤 Listening...</span>
            ) : (
              <span className="not-listening">🎤 Not listening</span>
            )}
          </div>

          {transcript && (
            <div className="transcript">
              You said: <strong>{transcript}</strong>
            </div>
          )}

          <div className="expected-word">
            Say: <strong className="highlight">{expectedWord}</strong>
          </div>

          {lastResult && (
            <div className={`result-indicator ${lastResult}`}>
              {lastResult === 'correct' && '✓ Correct!'}
              {lastResult === 'wrong' && '✗ Wrong!'}
              {lastResult === 'missed' && '⏱ Too slow!'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
