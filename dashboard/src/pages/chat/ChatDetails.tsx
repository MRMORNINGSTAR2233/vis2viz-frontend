import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, FileUp, ChartBar, ChevronLeft, MoreVertical, Download, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  visualization?: {
    type: string;
    imageUrl: string;
  };
}

export default function ChatDetails() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
            const sources: DataSource[] = JSON.parse(storedSources);
            const source = sources.find(s => 
              (s.type === 'database' && s.config.id === sourceId) || 
              (s.type === 'csv' && s.config.id === sourceId)
            );
            
            if (source) {
              setDataSource(source);
              // Set title based on data source
              setTitle(source.type === 'database' 
                ? `Chat with ${source.config.configName}` 
                : `Chat with ${source.config.name}`);
              
              // Add welcome message
              const welcomeMessage: Message = {
                id: '1',
                content: source.type === 'database'
                  ? `I'm connected to your ${source.config.type} database "${source.config.database}". What would you like to visualize?`
                  : `I've loaded your CSV file "${source.config.fileName}". What would you like to visualize from this data?`,
                sender: 'bot',
                timestamp: new Date(),
              };
              
              setMessages([welcomeMessage]);
            } else {
              // Data source not found
              navigate('/chat');
            }
          }
        } else if (chatId && chatId !== 'new') {
          // Load existing chat
          // This would typically come from an API, but for this demo we'll use example data
          setTitle(chatId === '1' ? 'Data Visualization Project' : 
                 chatId === '2' ? 'Marketing Analytics' : 
                 chatId === '3' ? 'Sales Dashboard' : 'New Chat');
          
          // Sample messages for existing chats
          setMessages([
            {
              id: '1',
              content: 'How do I create a visualization for my sales data across different regions?',
              sender: 'user',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
              id: '2',
              content: 'I can help you visualize your regional sales data. What specific aspects would you like to highlight in your visualization? For example, are you interested in comparing total sales, growth rates, or product-specific performance across regions?',
              sender: 'bot',
              timestamp: new Date(Date.now() - 1000 * 60 * 29),
            },
            {
              id: '3',
              content: 'I want to compare total sales across regions and also show the quarterly trend for each region.',
              sender: 'user',
              timestamp: new Date(Date.now() - 1000 * 60 * 25),
            },
            {
              id: '4',
              content: 'I\'ve created a visualization that combines a bar chart for total regional sales comparison with line charts showing quarterly trends for each region. The visualization allows you to see both the overall comparison and temporal patterns simultaneously.',
              sender: 'bot',
              timestamp: new Date(Date.now() - 1000 * 60 * 24),
              visualization: {
                type: 'combination chart',
                imageUrl: 'https://via.placeholder.com/800x400',
              },
            },
          ]);
        } else {
          // New chat without data source
          setTitle('New Chat');
          setMessages([
            {
              id: '1',
              content: 'Welcome to Auralytics! I can help you visualize and analyze your data. To get started, please tell me what you want to explore.',
              sender: 'bot',
              timestamp: new Date(),
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
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulate bot response (would be replaced with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: dataSource 
          ? `I'm analyzing your request against the ${dataSource.type === 'database' ? 'database' : 'CSV data'}. Let me generate a visualization for you...`
          : 'I\'m analyzing your request. Let me generate a visualization for you...',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      
      // For demo purposes, add a visualization after a delay
      if (inputMessage.toLowerCase().includes('chart') || 
          inputMessage.toLowerCase().includes('plot') || 
          inputMessage.toLowerCase().includes('graph') || 
          inputMessage.toLowerCase().includes('visual')) {
        setTimeout(() => {
          const visualizationResponse: Message = {
            id: (Date.now() + 2).toString(),
            content: 'Here\'s the visualization you requested:',
            sender: 'bot',
            timestamp: new Date(),
            visualization: {
              type: 'data visualization',
              imageUrl: 'https://via.placeholder.com/800x400',
            },
          };
          setMessages(prev => [...prev, visualizationResponse]);
        }, 3000);
      }
    }, 1000);
  };

  // Handle back button for mobile
  const handleBack = () => {
    navigate('/chat');
  };

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
          <Button variant="ghost" size="icon" className="rounded-full">
            <Download size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical size={16} />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 rounded-md bg-primary-600">
                  <AvatarFallback className="font-bold text-white">AI</AvatarFallback>
                </Avatar>
              )}
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-secondary-600">
                  <AvatarFallback className="font-bold text-white">AK</AvatarFallback>
                </Avatar>
              )}
              
              <div className="space-y-2">
                <div 
                  className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-dark-700 text-white border border-white/5'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {message.visualization && (
                  <div className="p-2 rounded-lg bg-dark-700 border border-white/5">
                    <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                      <ChartBar size={12} />
                      <span>{message.visualization.type}</span>
                    </div>
                    <img 
                      src={message.visualization.imageUrl} 
                      alt="Visualization" 
                      className="rounded w-full max-h-80 object-contain"
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Download size={12} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-white/40">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <Separator />
      
      {/* Input Area */}
      <div className="p-4">
        <div className="relative flex items-center">
          <Button variant="ghost" size="icon" className="absolute left-2">
            <FileUp size={18} className="text-white/50" />
          </Button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={dataSource 
              ? `Ask about your ${dataSource.type === 'database' ? 'database' : 'CSV'} data...` 
              : "Type your message..."}
            className="w-full h-12 pl-12 pr-12 bg-dark-700 rounded-full border border-white/10 focus:outline-none focus:border-primary-400 transition-colors"
          />
          
          <Button 
            variant="primary" 
            size="icon" 
            className="absolute right-2 rounded-full h-8 w-8"
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
} 