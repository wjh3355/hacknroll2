import { useState } from 'react';
import { useSpeechRecognition, type SpeechAlternative } from '../../hooks/useSpeechRecognition';

export function TestScreen() {
   const [transcripts, setTranscripts] = useState<Array<{
      text: string;
      isFinal: boolean;
      alternatives: SpeechAlternative[];
      timestamp: number;
   }>>([]);
   const [error, setError] = useState<string | null>(null);

   const handleResult = (transcript: string, isFinal: boolean, alternatives: SpeechAlternative[]) => {
      setTranscripts(prev => [...prev, {
         text: transcript,
         isFinal,
         alternatives,
         timestamp: Date.now()
      }].slice(-20)); // Keep last 20 results
   };

   const handleError = (err: string) => {
      setError(err);
   };

   const {
      isListening,
      isSupported,
      transcript,
      start,
      stop,
      reset,
      error: recognitionError,
   } = useSpeechRecognition({
      onResult: handleResult,
      onError: handleError,
   });

   return (
      <div style={{
         padding: '20px',
         maxWidth: '800px',
         margin: '0 auto',
         fontFamily: 'monospace'
      }}>
         <h1>Speech Recognition Test</h1>

         <div style={{ marginBottom: '20px' }}>
            <button onClick={() => window.location.href = '/'} style={{ marginRight: '10px' }}>
               ← Back to Game
            </button>
            <button onClick={start} disabled={isListening} style={{ marginRight: '10px' }}>
               Start Listening
            </button>
            <button onClick={stop} disabled={!isListening} style={{ marginRight: '10px' }}>
               Stop
            </button>
            <button onClick={reset} disabled={!isListening} style={{ marginRight: '10px' }}>
               Reset
            </button>
            <button onClick={() => setTranscripts([])}>
               Clear History
            </button>
         </div>

         <div style={{ marginBottom: '20px' }}>
            <strong>Status:</strong> {isSupported ? (isListening ? '🎤 Listening...' : '⏸️ Stopped') : '❌ Not Supported'}
            <br />
            <strong>Current Transcript:</strong> {transcript || '(none)'}
         </div>

         {(error || recognitionError) && (
            <div style={{
               padding: '10px',
               backgroundColor: '#fee',
               border: '1px solid #c00',
               borderRadius: '4px',
               marginBottom: '20px'
            }}>
               <strong>Error:</strong> {error || recognitionError}
            </div>
         )}

         <h2>Recognition History</h2>
         <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: '#f9f9f9'
         }}>
            {transcripts.length === 0 ? (
               <p style={{ color: '#666' }}>No transcripts yet. Click "Start Listening" and say something!</p>
            ) : (
               transcripts.map((item, idx) => (
                  <div
                     key={idx}
                     style={{
                        marginBottom: '15px',
                        padding: '10px',
                        backgroundColor: item.isFinal ? '#e8f5e9' : '#fff3e0',
                        border: item.isFinal ? '1px solid #4caf50' : '1px solid #ff9800',
                        borderRadius: '4px'
                     }}
                  >
                     <div style={{ marginBottom: '5px' }}>
                        <span style={{
                           fontWeight: 'bold',
                           color: item.isFinal ? '#2e7d32' : '#e65100'
                        }}>
                           {item.isFinal ? '✓ FINAL' : '⋯ INTERIM'}
                        </span>
                        {' '}
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                           ({new Date(item.timestamp).toLocaleTimeString()})
                        </span>
                     </div>
                     <div style={{ fontSize: '1.1em', marginBottom: '8px', color: '#333' }}>
                        "{item.text}"
                     </div>
                     {item.alternatives.length > 1 && (
                        <details>
                           <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
                              {item.alternatives.length} alternatives
                           </summary>
                           <div style={{ marginTop: '5px', paddingLeft: '10px' }}>
                              {item.alternatives.map((alt, altIdx) => (
                                 <div key={altIdx} style={{ marginBottom: '3px', color: '#555' }}>
                                    {altIdx + 1}. "{alt.transcript}"
                                    <span style={{ color: '#666', fontSize: '0.9em' }}>
                                       {' '}(confidence: {(alt.confidence * 100).toFixed(1)}%)
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </details>
                     )}
                  </div>
               ))
            )}
         </div>

         <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
            <h3>Usage:</h3>
            <ul>
               <li>Click "Start Listening" to begin</li>
               <li>Speak into your microphone</li>
               <li>Green boxes = final results (what the browser is confident about)</li>
               <li>Orange boxes = interim results (still processing)</li>
               <li>Click on "alternatives" to see other possible interpretations</li>
            </ul>
         </div>
      </div>
   );
}
