import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Mic, MicOff, Send, Loader2, ChevronLeft } from 'lucide-react';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { Link } from 'react-router-dom';

// Define necessary interfaces for speech recognition
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  onstart: () => void;
  onaudiostart: () => void;
  onsoundstart: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onsoundend: () => void;
  onaudioend: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

// Mock API function to simulate sending data to backend
const sendToBackend = async (text: string) => {
  // Simulate network delay
  console.log('Sending to backend:', text);
  
  try {
    // Real implementation would use fetch to call your backend API
    // Example using OpenAI's API directly (not recommended for production)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || 'YOUR_API_KEY'}` // Use environment variable
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful data visualization assistant named Aura.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Successfully processed by OpenAI',
      data: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to mock response if API fails
    return {
      success: true,
      message: 'API call failed, using mock response for: ' + text,
      data: {
        processed: true,
        fallback: true,
        response: "I'm Aura, your data visualization assistant. I understand you said: " + text,
        timestamp: new Date().toISOString()
      }
    };
  }
};

export default function SpeechTest() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Add state for available microphone devices
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [visualFeedbackEnabled, setVisualFeedbackEnabled] = useState(true);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioData = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Add retry mechanism state variables
  const [networkRetries, setNetworkRetries] = useState(0);
  const [maxRetries] = useState(3);
  const [isRetrying, setIsRetrying] = useState(false);

  // Add offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Add WebSocket connection test state
  const [wsConnectionStatus, setWsConnectionStatus] = useState<'untested' | 'connected' | 'failed'>('untested');
  const [wsTestInProgress, setWsTestInProgress] = useState(false);
  const wsTestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Initialize speech recognition with better error handling and mic permission checks
  useEffect(() => {
    // Handle offline status
    const handleOnlineStatus = () => {
      addLog(`Connection status changed: ${navigator.onLine ? 'online' : 'offline'}`);
      if (!navigator.onLine) {
        setError('You are currently offline. Speech recognition requires internet connectivity.');
        if (isListening) {
          // Stop listening if currently active
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {
              // Ignore errors on stop
            }
          }
          setIsListening(false);
          stopAudioLevelMonitoring();
        }
      }
    };

    // Add network status event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      addLog('Speech recognition not supported');
      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }

    // Function to request microphone permissions explicitly
    const requestMicrophonePermission = async () => {
      try {
        addLog('Requesting microphone permission...');
        // This will prompt for microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        addLog('Microphone permission granted');
        // Stop the tracks immediately as we just wanted permission
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
        addLog('Microphone permission denied');
        return false;
      }
    };

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition with more robust settings
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;
    recognition.maxAlternatives = 3; // Get multiple alternatives to improve accuracy

    // Set up all event handlers
    recognition.onstart = () => {
      addLog('Recognition started');
      setIsListening(true);
    };

    recognition.onaudiostart = () => {
      addLog('Audio capturing started');
    };

    recognition.onsoundstart = () => {
      addLog('Sound detected');
    };

    recognition.onspeechstart = () => {
      addLog('Speech detected');
    };

    // Handle results with more detailed logging
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      
      addLog(`Got ${event.results.length} results`);

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        if (result.isFinal) {
          final += transcript + ' ';
          addLog(`Final transcript: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
        } else {
          interim += transcript;
          addLog(`Interim: "${transcript}"`);
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + final);
      }
      
      setTranscript(final || interim);
    };

    recognition.onspeechend = () => {
      addLog('Speech ended');
    };

    recognition.onsoundend = () => {
      addLog('Sound ended');
    };

    recognition.onaudioend = () => {
      addLog('Audio capturing ended');
    };

    // Handle errors with more detailed debugging
    recognition.onerror = (event: { error: string }) => {
      const errorMessage = `Recognition error: ${event.error}`;
      addLog(errorMessage);
      
      // Provide user-friendly error messages
      switch (event.error) {
        case 'no-speech':
          setError('No speech was detected. Please try speaking louder or check your microphone.');
          break;
        case 'audio-capture':
          setError('Failed to capture audio. Please check if your microphone is connected and working.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          break;
        case 'network':
          // Handle network error with retry logic
          addLog(`Network error (attempt ${networkRetries + 1}/${maxRetries})`);
          
          if (networkRetries < maxRetries) {
            // Increment retry counter
            setNetworkRetries(prev => prev + 1);
            setIsRetrying(true);
            
            // Show user-friendly message
            setError(`Network error. Retrying (${networkRetries + 1}/${maxRetries})... Please check your internet connection.`);
            
            // Wait and retry
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  addLog(`Retrying speech recognition after network error...`);
                  recognitionRef.current.start();
                  setIsRetrying(false);
                } catch (e) {
                  addLog('Failed to restart after network error');
                  setError('Failed to reconnect. Please try again manually.');
                  setIsListening(false);
                  setIsRetrying(false);
                }
              }
            }, 2000); // Wait 2 seconds before retry
            
            // Prevent setting isListening to false
            return;
          } else {
            // Max retries reached
            setError('Network error occurred. Please check your internet connection and try again later.');
            setNetworkRetries(0); // Reset for next attempt
            setIsRetrying(false);
          }
          break;
        case 'aborted':
          addLog('Speech recognition aborted');
          // Don't show an error for intentional aborts
          break;
        default:
          setError(`Error: ${event.error}`);
      }
      
      setIsListening(false);
    };

    // Handle end of recognition with better restart logic
    recognition.onend = () => {
      addLog('Recognition ended');
      
      // Auto-restart if still in listening mode
      if (isListening) {
        try {
          // Add a small delay before restarting to prevent rapid restarts
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognitionRef.current.start();
              addLog('Recognition auto-restarted');
            }
          }, 300);
        } catch (e) {
          addLog('Failed to auto-restart recognition');
          setIsListening(false);
          setError('Failed to restart speech recognition. Please try again.');
        }
      } else {
        setIsListening(false);
      }
    };

    // Cleanup with event listeners
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      
      if (recognition) {
        // Ensure we're cleaning up all listeners to prevent memory leaks
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.onstart = null;
        recognition.onaudiostart = null;
        recognition.onsoundstart = null;
        recognition.onspeechstart = null;
        recognition.onspeechend = null;
        recognition.onsoundend = null;
        recognition.onaudioend = null;
        
        try {
          recognition.stop();
          addLog('Recognition stopped during cleanup');
        } catch (e) {
          // Ignore errors on stop
        }
      }
    };
  }, [selectedLanguage, isListening]);

  // Fetch available microphone devices
  useEffect(() => {
    const getMicrophoneDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            // Stop the stream as we just wanted permission
            stream.getTracks().forEach(track => track.stop());
            
            // Now enumerate devices
            navigator.mediaDevices.enumerateDevices()
              .then(devices => {
                const mics = devices.filter(device => device.kind === 'audioinput');
                setMicrophoneDevices(mics);
                addLog(`Found ${mics.length} microphone devices`);
                
                // Select the default microphone if available
                if (mics.length > 0) {
                  const defaultMic = mics.find(mic => mic.deviceId === 'default') || mics[0];
                  setSelectedMicrophoneId(defaultMic.deviceId);
                  addLog(`Selected default microphone: ${defaultMic.label || 'Unnamed Microphone'}`);
                }
              });
          });
      } catch (err) {
        setError('Failed to access microphone devices. Please check your browser permissions.');
        addLog('Error accessing microphone devices');
      }
    };
    
    getMicrophoneDevices();
    
    return () => {
      // Clean up audio context when component unmounts
      if (audioContext.current) {
        audioContext.current.close();
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Start audio level monitoring
  const startAudioLevelMonitoring = async () => {
    try {
      // If we already have an active audio context, clean it up
      if (audioContext.current) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        
        if (microphone.current) {
          microphone.current.disconnect();
        }
        
        if (analyser.current) {
          analyser.current.disconnect();
        }
        
        await audioContext.current.close();
        audioContext.current = null;
      }
      
      // Create new audio context
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get audio stream from selected microphone
      const constraints = {
        audio: selectedMicrophoneId 
          ? { deviceId: { exact: selectedMicrophoneId } } 
          : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create analyzer
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      // Connect microphone to analyzer
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      microphone.current.connect(analyser.current);
      
      // Prepare data array for analyzer
      const bufferLength = analyser.current.frequencyBinCount;
      audioData.current = new Uint8Array(bufferLength);
      
      // Start monitoring loop
      const updateAudioLevel = () => {
        if (!analyser.current || !audioData.current) return;
        
        analyser.current.getByteFrequencyData(audioData.current);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < audioData.current.length; i++) {
          sum += audioData.current[i];
        }
        const average = sum / audioData.current.length;
        setAudioLevel(average);
        
        // Continue monitoring
        animationFrameId.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      addLog('Audio level monitoring started');
    } catch (err) {
      console.error('Error starting audio monitoring:', err);
      setError('Failed to monitor audio levels. Please check microphone permissions.');
      addLog('Error in audio monitoring');
    }
  };

  // Stop audio level monitoring
  const stopAudioLevelMonitoring = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    if (audioContext.current && microphone.current) {
      microphone.current.disconnect();
    }
    
    setAudioLevel(0);
    addLog('Audio level monitoring stopped');
  };

  // Handle microphone selection change
  const handleMicrophoneChange = (deviceId: string) => {
    setSelectedMicrophoneId(deviceId);
    addLog(`Changed microphone to ID: ${deviceId}`);
    
    // Restart audio monitoring with new microphone
    if (isListening) {
      stopAudioLevelMonitoring();
      startAudioLevelMonitoring();
    }
  };

  // Function to test WebSocket connectivity to common domains
  // Speech recognition often uses WebSockets, so this can help diagnose issues
  const testWebSocketConnection = () => {
    if (wsTestInProgress) return;
    setWsTestInProgress(true);
    addLog('Testing WebSocket connectivity...');
    
    // Try to establish a WebSocket connection to Echo service
    const ws = new WebSocket('wss://echo.websocket.events');
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Set timeout for connection
    timeoutId = setTimeout(() => {
      addLog('WebSocket connection attempt timed out');
      ws.close();
      setWsConnectionStatus('failed');
      setWsTestInProgress(false);
    }, 5000);
    
    // Handle successful connection
    ws.onopen = () => {
      if (timeoutId) clearTimeout(timeoutId);
      addLog('WebSocket connection successful');
      setWsConnectionStatus('connected');
      setWsTestInProgress(false);
      
      // Close the connection after success
      ws.close();
    };
    
    // Handle connection error
    ws.onerror = (e) => {
      if (timeoutId) clearTimeout(timeoutId);
      addLog('WebSocket connection failed');
      setWsConnectionStatus('failed');
      setWsTestInProgress(false);
    };
  };

  // Add useEffect for periodic WebSocket testing
  useEffect(() => {
    // Initial test
    if (navigator.onLine) {
      testWebSocketConnection();
    }
    
    // Set up periodic testing if in listening mode
    if (isListening) {
      wsTestIntervalRef.current = setInterval(() => {
        if (navigator.onLine) {
          testWebSocketConnection();
        }
      }, 60000); // Test every minute while listening
    }
    
    return () => {
      if (wsTestIntervalRef.current) {
        clearInterval(wsTestIntervalRef.current);
        wsTestIntervalRef.current = null;
      }
    };
  }, [isListening]);

  // Update network check to include WebSocket test
  const checkNetworkAndStart = () => {
    // First, do a simple connectivity check
    fetch('https://www.google.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache'
    })
      .then(() => {
        // Basic connectivity looks good, now test WebSocket
        if (wsConnectionStatus !== 'connected') {
          testWebSocketConnection();
          // Set a short timeout to allow WebSocket test to update
          setTimeout(() => {
            if (wsConnectionStatus === 'failed') {
              setError('Network appears to be blocking WebSocket connections needed for speech recognition. Try a different network.');
              addLog('WebSocket connectivity check failed');
              stopAudioLevelMonitoring();
              return;
            }
            
            // Start recognition regardless of WebSocket status (might work anyway)
            try {
              recognitionRef.current!.start();
              setIsListening(true);
              addLog('Started listening');
            } catch (e) {
              setError('Failed to start speech recognition. Try refreshing the page.');
              addLog('Error starting recognition');
              stopAudioLevelMonitoring();
            }
          }, 500);
        } else {
          // WebSocket already confirmed connected
          try {
            recognitionRef.current!.start();
            setIsListening(true);
            addLog('Started listening');
          } catch (e) {
            setError('Failed to start speech recognition. Try refreshing the page.');
            addLog('Error starting recognition');
            stopAudioLevelMonitoring();
          }
        }
      })
      .catch(err => {
        // Network issue detected
        setError('Network appears to be unavailable. Speech recognition requires internet connectivity.');
        addLog('Network connectivity check failed');
        stopAudioLevelMonitoring();
      });
  };

  // Send transcript to backend
  const sendTranscript = async () => {
    if (!finalTranscript.trim()) {
      setError('Nothing to send. Please speak first.');
      return;
    }

    setIsProcessing(true);
    addLog(`Sending: "${finalTranscript}"`);
    
    try {
      const response = await sendToBackend(finalTranscript);
      addLog('Successfully sent to backend');
      setResponses(prev => [...prev, JSON.stringify(response, null, 2)]);
      
      // If there's a response from the AI, speak it using text-to-speech
      if (response.data && typeof response.data === 'string') {
        speakResponse(response.data);
      } else if (response.data && response.data.response) {
        speakResponse(response.data.response);
      }
      
      setFinalTranscript('');
    } catch (error) {
      setError('Failed to send to backend. Please try again.');
      addLog('Error sending to backend');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to speak the response using text-to-speech
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      
      // Get available voices and try to find a suitable one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes(selectedLanguage.split('-')[0]) && voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      addLog('Speaking response');
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setResponses([]);
  };

  // Available languages
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ja-JP', name: 'Japanese' },
  ];

  // Update toggle listening to use network check
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized. Please try refreshing the page.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      addLog('Stopped listening');
      stopAudioLevelMonitoring();
      // Reset retry counter when stopping
      setNetworkRetries(0);
    } else {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      
      // First request microphone permission explicitly
      const constraints = {
        audio: selectedMicrophoneId 
          ? { deviceId: { exact: selectedMicrophoneId } } 
          : true
      };
      
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          // Stop the stream as we just wanted permission
          stream.getTracks().forEach(track => track.stop());
          
          // Start audio level monitoring
          if (visualFeedbackEnabled) {
            startAudioLevelMonitoring();
          }
          
          // Now check network and start speech recognition
          checkNetworkAndStart();
        })
        .catch(err => {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          addLog('Microphone permission denied');
        });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      <div className="container mx-auto max-w-3xl px-4 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Link to="/chat" className="text-primary-400 hover:text-primary-300 flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Chat
          </Link>
          <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-500">
            Web Speech API Test
          </h1>
          <div className="flex items-center text-xs space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <span>{navigator.onLine ? 'Online' : 'Offline'}</span>
            </div>
            
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${
                  wsConnectionStatus === 'connected' ? 'bg-green-500' : 
                  wsConnectionStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
              ></div>
              <span>
                {wsConnectionStatus === 'connected' ? 'WebSockets: OK' : 
                  wsConnectionStatus === 'failed' ? 'WebSockets: Blocked' : 'WebSockets: Unknown'}
              </span>
            </div>
            
            {wsTestInProgress && (
              <div className="text-yellow-400 animate-pulse">Testing...</div>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={testWebSocketConnection} 
              disabled={wsTestInProgress || !navigator.onLine}
              className="text-xs px-2 py-1 h-6"
            >
              Test Connection
            </Button>
          </div>
        </div>
        
        {/* Network status warning */}
        {!navigator.onLine && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-md p-3 mb-4 text-white">
            <p className="font-medium">Offline Mode</p>
            <p className="text-sm">You are currently offline. Speech recognition requires an internet connection to work. Please check your connectivity.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4 text-white">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Microphone Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Select Microphone</label>
              <select
                value={selectedMicrophoneId}
                onChange={(e) => handleMicrophoneChange(e.target.value)}
                className="p-2 w-full rounded bg-dark-800 border border-white/10 text-white"
                aria-label="Select microphone device"
              >
                {microphoneDevices.length === 0 ? (
                  <option value="">No microphones found</option>
                ) : (
                  microphoneDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))
                )}
              </select>
              
              <div className="text-xs text-white/50 mt-1">
                {microphoneDevices.length === 0 
                  ? 'No microphones detected. Please check browser permissions.' 
                  : `${microphoneDevices.length} microphone(s) available`}
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Microphone Level</label>
              <div className="flex items-center">
                <div className="flex-1 bg-dark-700 h-6 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-300" 
                    style={{ width: `${Math.min(audioLevel * 100 / 255, 100)}%` }}
                  />
                </div>
                <div className="ml-2 text-xs font-mono w-10 text-right">
                  {Math.round(audioLevel * 100 / 255)}%
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="visualFeedback"
                  checked={visualFeedbackEnabled}
                  onChange={() => setVisualFeedbackEnabled(!visualFeedbackEnabled)}
                  className="mr-2"
                />
                <label htmlFor="visualFeedback" className="text-sm">Enable visual audio feedback</label>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-white/70">
            <p>Not working? Try these troubleshooting steps:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Ensure your browser has permission to use the microphone</li>
              <li>Try selecting a different microphone if available</li>
              <li>Check if your microphone is muted in your system settings</li>
              <li>Speak clearly and a bit louder than normal</li>
              <li>Try refreshing the page if recognition stops responding</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className={`flex-1 ${isListening ? 'animate-pulse' : ''}`}
            disabled={!navigator.onLine || wsConnectionStatus === 'failed'}
          >
            {isListening ? (
              <><MicOff className="mr-2 h-4 w-4" /> Stop Listening</>
            ) : (
              <><Mic className="mr-2 h-4 w-4" /> Start Listening</>
            )}
          </Button>
          
          <Button
            onClick={sendTranscript}
            disabled={isProcessing || !finalTranscript.trim()}
            variant="primary"
            className="flex-1"
          >
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Send to Backend</>
            )}
          </Button>
        </div>
        
        <div className="mb-4 flex space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 rounded bg-dark-800 border border-white/10 text-white"
            aria-label="Select recognition language"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <Button onClick={clearLogs} variant="outline" size="sm">
            Clear Logs
          </Button>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-lg font-medium mb-2">Transcript</h3>
          
          <div className="bg-dark-700 rounded p-3 mb-3 flex-1 overflow-auto">
            {finalTranscript ? (
              <p className="text-white whitespace-pre-wrap">{finalTranscript}</p>
            ) : (
              <p className="text-white/50 italic">No transcript yet. Start speaking...</p>
            )}
            
            {interimTranscript && (
              <p className="text-blue-400 italic mt-2">{interimTranscript}...</p>
            )}
          </div>
          
          {isListening && (
            <div className="flex items-center text-sm text-primary-400 animate-pulse">
              <Mic className="h-4 w-4 mr-2" />
              <span>Listening...</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 h-64 overflow-auto">
            <h3 className="text-lg font-medium mb-2">Event Log</h3>
            
            {logs.length === 0 ? (
              <p className="text-white/50 italic">No events yet</p>
            ) : (
              <div className="space-y-1 text-xs font-mono">
                {logs.map((log, i) => (
                  <div key={i} className="text-white/70">{log}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 h-64 overflow-auto">
            <h3 className="text-lg font-medium mb-2">Backend Responses</h3>
            
            {responses.length === 0 ? (
              <p className="text-white/50 italic">No responses yet</p>
            ) : (
              <div className="space-y-4">
                {responses.map((response, i) => {
                  try {
                    const parsedResponse = JSON.parse(response);
                    return (
                      <div key={i} className="bg-dark-900 p-3 rounded">
                        <div className="text-xs text-green-400 font-mono mb-2">{parsedResponse.message}</div>
                        <div className="text-white text-sm">
                          {typeof parsedResponse.data === 'string' 
                            ? parsedResponse.data
                            : parsedResponse.data.response || JSON.stringify(parsedResponse.data)}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return (
                      <pre key={i} className="text-xs text-green-400 bg-dark-900 p-2 rounded overflow-auto">
                        {response}
                      </pre>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 