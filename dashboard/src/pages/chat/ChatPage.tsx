import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Plus, Database, FileSpreadsheet, Mic, MicOff, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  dataSourceId: string;
}

// Define a SpeechRecognition interface
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

// Define SpeechRecognition constructor interface
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
  };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

// Alternative approach using a direct import
const LOTTIE_URL = "https://assets2.lottiefiles.com/dotlotties/dlf10_wbz8jeit.lottie";

export default function ChatPage() {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([
    { 
      id: '1', 
      title: 'Data Visualization Project', 
      preview: 'How do I create a combined bar and line chart?',
      date: '2h ago',
      dataSourceId: 'sample_data'
    },
    { 
      id: '2', 
      title: 'Marketing Analytics', 
      preview: 'Can you analyze this campaign performance data?',
      date: 'Yesterday',
      dataSourceId: 'sample_data'
    },
    { 
      id: '3', 
      title: 'Sales Dashboard', 
      preview: 'I need a visualization for regional sales data',
      date: '3d ago',
      dataSourceId: 'sample_data'
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Load data sources from localStorage (in a real app, this would be from an API)
    const storedDataSources = localStorage.getItem('dataSources');
    if (storedDataSources) {
      try {
        const parsedSources = JSON.parse(storedDataSources);
        // Filter out any malformed data sources
        const validSources = parsedSources.filter(source => 
          source && source.type && source.config && 
          (source.type === 'database' ? source.config.configName && source.config.id : 
           source.type === 'csv' ? source.config.name && source.config.id : false)
        );
        setDataSources(validSources);
      } catch (error) {
        console.error('Error parsing data sources:', error);
        setDataSources([]);
      }
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      
      setTranscript(transcriptText);
      
      // Check for activation phrase
      if (result.isFinal) {
        const lowerText = transcriptText.toLowerCase();
        
        if (lowerText.includes('aura arise') || lowerText.includes('aurora rise')) {
          setIsActivated(true);
          setShowAnimation(true);
          recognition.stop();
          
          // Show animation and welcome message
          setTimeout(() => {
            setWelcomeMessage(true);
            
            // Speak welcome message
            const utterance = new SpeechSynthesisUtterance('I am Aura, how can I help you?');
            utterance.pitch = 1.2;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
            
            // Navigate to active chat after a delay
            setTimeout(() => {
              navigate('/chat/new');
            }, 3000);
          }, 2000);
        } else {
          setSearchQuery(transcriptText);
        }
      }
    };

    // Handle errors
    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      if (isListening && !isActivated) {
        recognition.start();
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, isActivated, navigate]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleNewChat = () => {
    navigate('/chat/data-source');
  };

  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Animation overlay when activated */}
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-dark-900/60">
          <div className="text-center w-80">
            {/* Use the simpler animation */}
            <div style={{ height: '300px', width: '300px' }} className="mx-auto relative">
              <DotLottieReact
                src={LOTTIE_URL}
                loop={!welcomeMessage}
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Fallback if animation doesn't load */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-400 to-secondary-600 opacity-80 blur-md animate-pulse"></div>
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-primary-300 to-secondary-500"></div>
              </div>
            </div>
            
            {welcomeMessage && (
              <div className="mt-4 animate-fadeIn">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
                  I am Aura
                </h2>
                <p className="text-lg text-white/90">How can I help you?</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 mb-3">
              Auralytics
            </h1>
            <p className="text-lg text-white/70">
              Voice-powered data visualization
            </p>
            
            {/* Test button - remove in production */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setShowAnimation(true);
                setTimeout(() => {
                  setWelcomeMessage(true);
                  const utterance = new SpeechSynthesisUtterance('I am Aura, how can I help you?');
                  utterance.pitch = 1.2;
                  utterance.rate = 0.9;
                  window.speechSynthesis.speak(utterance);
                }, 2000);
              }}
            >
              Test Animation
            </Button>
          </div>
          
          {/* Voice Search Bar */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="flex items-center bg-dark-700 rounded-full border border-white/10 pr-2 overflow-hidden focus-within:border-primary-400 transition-colors">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-3.5 text-white/50" />
                <input 
                  type="text" 
                  value={searchQuery || transcript}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Say 'Aura Arise' to activate..."
                  className="w-full h-12 pl-12 pr-4 bg-transparent rounded-full focus:outline-none text-white"
                />
              </div>
              
              <Button 
                variant={isListening ? "secondary" : "ghost"} 
                size="icon" 
                className={`rounded-full h-9 w-9 ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
            </div>
            
            {transcript && !isActivated && (
              <div className="absolute mt-2 left-0 right-0 p-3 bg-dark-700/90 rounded-md border border-white/10 backdrop-blur-sm shadow-lg animate-fadeIn">
                <p className="text-white/80 italic">"{transcript}"</p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Button
              variant="outline"
              className="h-16 rounded-xl border-white/10 bg-dark-700/30 backdrop-blur-sm hover:bg-dark-700/60 flex items-center gap-3"
              onClick={handleNewChat}
            >
              <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                <Search size={20} className="text-primary-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">Connect Data</div>
                <div className="text-xs text-white/60">Database or CSV</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 rounded-xl border-white/10 bg-dark-700/30 backdrop-blur-sm hover:bg-dark-700/60 flex items-center gap-3"
              onClick={() => navigate('/chat/new')}
            >
              <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                <ArrowRight size={20} className="text-primary-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">New Chat</div>
                <div className="text-xs text-white/60">Start from scratch</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center text-sm text-white/50 mt-8">
            Say "Aura Arise" to activate voice assistant
          </div>
        </div>
      </main>
    </div>
  );
} 