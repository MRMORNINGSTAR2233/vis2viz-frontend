import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Send, ChartBar, ChevronLeft, MoreVertical, Download, 
  Database, FileSpreadsheet, Mic, MicOff, Globe, Check, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';
import DataVisualization, { VisualizationData } from '../../components/chat/DataVisualization';
import { nanoid } from 'nanoid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Label
} from "../../components/ui/label"
import {
  StopCircleIcon,
  MicIcon
} from "lucide-react"

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

interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  createdAt: string;
  visualization?: VisualizationData;
}

interface LanguageOption {
  code: string;
  name: string;
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

export default function ChatDetails() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({ code: 'en-US', name: 'English (US)' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Language options
  const languageOptions: LanguageOption[] = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' },
  ];

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
    recognition.lang = selectedLanguage.code;

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      
      if (result.isFinal) {
        setTranscript(prev => prev + ' ' + transcriptText);
      } else {
        setTranscript(transcriptText);
      }
    };

    // Handle errors
    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [selectedLanguage, isListening]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage.code;
    }
  }, [selectedLanguage]);

  // Handle start/stop listening
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

  // Handle language change
  const changeLanguage = (language: LanguageOption) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
  };

  // Handle data source loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Check if we're creating a new chat with a specific data source
        const searchParams = new URLSearchParams(location.search);
        const sourceId = searchParams.get('source');
        
        if (sourceId) {
          // Find the data source in localStorage
          const storedSources = localStorage.getItem('dataSources');
          if (storedSources) {
            try {
              const sources: DataSource[] = JSON.parse(storedSources);
              const source = sources.find(s => 
                s && s.config && (
                  (s.type === 'database' && s.config?.id === sourceId) || 
                  (s.type === 'csv' && s.config?.id === sourceId)
                )
              );
              
              if (source) {
                setDataSource(source);
                // Set title based on data source
                setTitle(source.type === 'database' 
                  ? `Chat with ${source.config?.configName || 'Database'}` 
                  : `Chat with ${source.config?.name || 'CSV File'}`);
                
                // Add welcome message
                const welcomeMessage: Message = {
                  id: '1',
                  content: source.type === 'database'
                    ? `I'm connected to your ${source.config?.type || 'database'} database "${source.config?.database || 'unnamed'}". What would you like to visualize?`
                    : `I've loaded your CSV file "${source.config?.fileName || 'unnamed'}". What would you like to visualize from this data?`,
                  role: 'bot',
                  createdAt: new Date().toISOString(),
                };
                
                setMessages([welcomeMessage]);
              } else {
                // Data source not found
                console.warn(`Data source with ID ${sourceId} not found`);
                navigate('/chat');
              }
            } catch (error) {
              console.error('Error parsing data sources:', error);
              navigate('/chat');
            }
          } else {
            console.warn('No data sources found in localStorage');
            navigate('/chat');
          }
        } else if (chatId && chatId !== 'new') {
          // Load existing chat
          // This would typically come from an API, but for this demo we'll use example data
          setTitle(chatId === '1' ? 'Data Visualization Project' : 
                 chatId === '2' ? 'Marketing Analytics' : 
                 chatId === '3' ? 'Sales Dashboard' : 'New Chat');
          
          // Sample messages for existing chats with visualization data
          setMessages([
            {
              id: '1',
              content: 'How do I create a visualization for my sales data across different regions?',
              role: 'user',
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            },
            {
              id: '2',
              content: 'I can help you visualize your regional sales data. What specific aspects would you like to highlight in your visualization? For example, are you interested in comparing total sales, growth rates, or product-specific performance across regions?',
              role: 'bot',
              createdAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
            },
            {
              id: '3',
              content: 'I want to compare total sales across regions and also show the quarterly trend for each region.',
              role: 'user',
              createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            },
            {
              id: '4',
              content: 'I\'ve created a visualization that combines a bar chart for total regional sales comparison with line charts showing quarterly trends for each region.',
              role: 'bot',
              createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
              visualization: {
                type: 'bar',
                title: 'Regional Sales Comparison',
                description: 'Total sales by region with quarterly breakdown',
                data: [
                  { region: 'North', sales: 4300, Q1: 1200, Q2: 900, Q3: 1000, Q4: 1200 },
                  { region: 'South', sales: 3800, Q1: 800, Q2: 1100, Q3: 950, Q4: 950 },
                  { region: 'East', sales: 5200, Q1: 1400, Q2: 1300, Q3: 1250, Q4: 1250 },
                  { region: 'West', sales: 4100, Q1: 1000, Q2: 1050, Q3: 1100, Q4: 950 },
                ],
                config: {
                  dataKeys: ['sales'],
                  xAxisDataKey: 'region',
                  colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']
                },
                footer: 'Data updated daily'
              }
            },
          ]);
        } else {
          // New chat without data source
          setTitle('New Chat');
          setMessages([
            {
              id: '1',
              content: 'Welcome to Auralytics! I can help you visualize and analyze your data using voice commands. To get started, click the microphone button and tell me what you want to explore.',
              role: 'bot',
              createdAt: new Date().toISOString(),
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [chatId, location.search, navigate]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const handleSendMessage = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }

    if (transcript.trim() === '') return;

    const newMessage: Message = {
      id: nanoid(),
      content: transcript.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setTranscript('');

    // Simulate bot response
    setTimeout(() => {
      const botResponseText = 'This is a sample response to your voice input: "' + transcript.trim() + '"';
      
      const botResponse: Message = {
        id: nanoid(),
        content: botResponseText,
        role: 'bot',
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      
      // Speak the bot's response automatically
      speakText(botResponseText);

      // If the transcript mentions visualization, charts, or graphs, add a visualization
      if (transcript.toLowerCase().includes('visual') || 
          transcript.toLowerCase().includes('chart') || 
          transcript.toLowerCase().includes('graph')) {
        setTimeout(() => {
          handleGenerateVisualization();
        }, 1000);
      }
    }, 1000);
  };

  // Handle visualization edits
  const handleVisualizationEdit = (messageId: string, editedData: VisualizationData) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.visualization) {
        return {
          ...message,
          visualization: editedData
        };
      }
      return message;
    }));
  };

  // Handle back button for mobile
  const handleBack = () => {
    navigate('/chat');
  };

  const handleGenerateVisualization = () => {
    const visualizationText = 'Here\'s a sample visualization based on your query:';
    const visualizationResponse: Message = {
      id: nanoid(),
      content: visualizationText,
      role: 'bot',
      createdAt: new Date().toISOString(),
      visualization: {
        type: 'bar',
        title: 'Sample Visualization',
        description: 'Generated based on voice input',
        data: [
          { category: 'A', value: 4000 },
          { category: 'B', value: 3000 },
          { category: 'C', value: 2000 },
          { category: 'D', value: 2780 },
          { category: 'E', value: 1890 },
          { category: 'F', value: 2390 },
        ],
        config: {
          dataKeys: ['value'],
          xAxisDataKey: 'category'
        }
      }
    };
    
    setMessages(prev => [...prev, visualizationResponse]);
    
    // Also speak the visualization announcement
    speakText(visualizationText + ' I\'ve created a bar chart showing the distribution of values across different categories.');
  };

  // Function to speak text using the Web Speech API
  const speakText = (text: string, messageId?: string) => {
    if (!isTtsEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0;  // Speed - 1.0 is normal speed
    utterance.pitch = 1.1; // Slightly higher pitch for assistant voice
    utterance.volume = 1.0; // Full volume
    
    // Set the language to match the selected language for speech recognition
    utterance.lang = selectedLanguage.code;
    
    // Optional: Select a specific voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes(selectedLanguage.code.split('-')[0]) && voice.name.includes('Female')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Events
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (messageId) setCurrentlySpeakingId(messageId);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // Load available voices when the component mounts
  useEffect(() => {
    // Some browsers need to wait for voices to load
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        // Just trigger loading of voices
        window.speechSynthesis.getVoices();
      };
      
      // Chrome requires waiting for the voiceschanged event
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices(); // For other browsers
    }
  }, []);

  // Add cleanup for speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech when navigating away or closing the page
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Modify the useEffect for speaking messages to only trigger for new messages
  useEffect(() => {
    // Only speak if TTS is enabled and not loading
    if (!isTtsEnabled || isLoading) return;
    
    // Check if messages array has changed and has at least one message
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only speak if the latest message is from the bot (Aura)
      if (latestMessage.role === 'bot') {
        // Add small delay to allow UI to render first
        setTimeout(() => {
          speakText(latestMessage.content, latestMessage.id);
        }, 500);
      }
    }
  }, [messages, isLoading, isTtsEnabled]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Header */}
      <header className="border-b border-white/5 p-3 backdrop-blur-sm bg-dark-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={handleBack}>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-2">
            {dataSource && (
              <div className="bg-primary-600/20 p-1.5 rounded-md">
                {dataSource.type === 'database' ? (
                  <Database size={16} className="text-primary-400" />
                ) : (
                  <FileSpreadsheet size={16} className="text-primary-400" />
                )}
              </div>
            )}
            <h1 className="text-lg font-medium">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              title="Change language"
            >
              <Globe size={16} />
            </Button>
            
            {showLanguageSelector && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-700 border border-white/10 z-10">
                <div className="rounded-md max-h-60 overflow-auto">
                  {languageOptions.map((language) => (
                    <button
                      key={language.code}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-600 flex items-center justify-between ${
                        language.code === selectedLanguage.code ? 'bg-primary-600/20 text-primary-400' : 'text-white'
                      }`}
                      onClick={() => changeLanguage(language)}
                    >
                      {language.name}
                      {language.code === selectedLanguage.code && (
                        <Check size={14} className="text-primary-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Download size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical size={16} />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                  title={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                >
                  {isTtsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isTtsEnabled ? "Disable voice" : "Enable voice"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'bot' && (
                <Avatar className="h-8 w-8 rounded-md bg-primary-600">
                  <AvatarFallback className="font-bold text-white">AI</AvatarFallback>
                </Avatar>
              )}
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-secondary-600">
                  <AvatarFallback className="font-bold text-white">AK</AvatarFallback>
                </Avatar>
              )}
              
              <div className={`space-y-2 ${message.visualization ? 'w-full max-w-[800px]' : ''}`}>
                <div className="flex items-start gap-2">
                  <div 
                    className={`p-3 rounded-lg flex-1 ${
                      message.role === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-dark-700 text-white border border-white/5'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {/* Add speak button for bot messages */}
                  {message.role === 'bot' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-7 w-7 rounded-full transition-all ${
                        isSpeaking && currentlySpeakingId === message.id 
                          ? 'bg-primary-600/20 text-primary-400 animate-pulse' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => {
                        setCurrentlySpeakingId(message.id);
                        speakText(message.content);
                      }}
                      title="Read aloud"
                    >
                      <Volume2 size={14} />
                    </Button>
                  )}
                </div>
                
                {message.visualization && (
                  <div className="rounded-lg bg-dark-700/50 backdrop-blur-sm border border-white/5">
                    <div className="text-xs text-white/60 p-2 flex items-center gap-1 border-b border-white/5">
                      <ChartBar size={12} />
                      <span>Data Visualization</span>
                    </div>
                    <div className="p-2">
                      <DataVisualization 
                        visualizationData={message.visualization} 
                        onEditComplete={(editedData) => handleVisualizationEdit(message.id, editedData)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-white/40">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Voice transcript */}
        {transcript && (
          <div className="flex justify-end">
            <div className="bg-primary-600/20 text-white/80 p-3 rounded-lg max-w-[80%] text-sm italic">
              {transcript}...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <Separator />
      
      {/* Voice-Only Input Area */}
      <div className="border-t border-white/5 p-4">
        <div className="flex flex-col space-y-4">
          {transcript && (
            <div className="p-2 bg-dark-800 rounded-md text-white/80 italic">
              {transcript}
            </div>
          )}
          
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsListening(!isListening)}
                variant={isListening ? "secondary" : "outline"}
                size="icon"
                className={`${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isListening ? <StopCircleIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
              </Button>
              
              {isListening && (
                <span className="text-xs text-white/60 animate-pulse">
                  Listening...
                </span>
              )}
              
              <Button
                onClick={handleGenerateVisualization} 
                variant="outline" 
                size="sm"
                className="ml-2"
              >
                Generate Sample Chart
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="language" className="text-xs text-white/60">
                        Language:
                      </Label>
                      <Select value={selectedLanguage.code} onValueChange={(value: string) => changeLanguage(languageOptions.find(l => l.code === value) || languageOptions[0])}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((language) => (
                            <SelectItem key={language.code} value={language.code}>{language.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select language for speech recognition</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
                
              <Button 
                onClick={handleSendMessage} 
                variant="primary" 
                disabled={!transcript.trim()}
              >
                <Send size={18} className="h-4 w-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 