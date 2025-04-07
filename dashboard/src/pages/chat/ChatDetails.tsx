import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, FileUp, ChartBar, ChevronLeft, MoreVertical, Download, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';
import DataVisualization, { VisualizationData } from '../../components/chat/DataVisualization';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  visualization?: VisualizationData | VisualizationData[];
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
          
          // Sample messages for existing chats with visualization data
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
              content: 'I\'ve created a visualization that combines a bar chart for total regional sales comparison with line charts showing quarterly trends for each region.',
              sender: 'bot',
              timestamp: new Date(Date.now() - 1000 * 60 * 24),
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
          // Generate visualization based on prompt
          let visualization: VisualizationData | undefined;
          
          if (inputMessage.toLowerCase().includes('bar')) {
            visualization = {
              type: 'bar',
              title: 'Monthly Revenue',
              description: 'Revenue breakdown by month',
              data: [
                { month: 'Jan', revenue: 4000, expenses: 2400 },
                { month: 'Feb', revenue: 3000, expenses: 1398 },
                { month: 'Mar', revenue: 2000, expenses: 9800 },
                { month: 'Apr', revenue: 2780, expenses: 3908 },
                { month: 'May', revenue: 1890, expenses: 4800 },
                { month: 'Jun', revenue: 2390, expenses: 3800 },
              ],
              config: {
                dataKeys: ['revenue', 'expenses'],
                xAxisDataKey: 'month',
                colors: ['#8884d8', '#82ca9d']
              },
              footer: 'Data updated daily'
            };
          } else if (inputMessage.toLowerCase().includes('line')) {
            visualization = {
              type: 'line',
              title: 'Product Performance Trend',
              description: 'Monthly performance of products',
              data: [
                { month: 'Jan', product1: 4000, product2: 2400, product3: 1800 },
                { month: 'Feb', product1: 3000, product2: 1398, product3: 2800 },
                { month: 'Mar', product1: 2000, product2: 9800, product3: 3200 },
                { month: 'Apr', product1: 2780, product2: 3908, product3: 4100 },
                { month: 'May', product1: 1890, product2: 4800, product3: 2300 },
                { month: 'Jun', product1: 2390, product2: 3800, product3: 2500 },
              ],
              config: {
                dataKeys: ['product1', 'product2', 'product3'],
                xAxisDataKey: 'month',
                colors: ['#8884d8', '#82ca9d', '#ffc658']
              }
            };
          } else if (inputMessage.toLowerCase().includes('pie')) {
            visualization = {
              type: 'pie',
              title: 'Revenue Distribution by Category',
              data: [
                { name: 'Electronics', value: 400 },
                { name: 'Clothing', value: 300 },
                { name: 'Home & Kitchen', value: 200 },
                { name: 'Books', value: 100 },
                { name: 'Others', value: 150 }
              ],
              config: {
                dataKeys: ['value'],
                xAxisDataKey: 'name'
              }
            };
          } else if (inputMessage.toLowerCase().includes('retention') || inputMessage.toLowerCase().includes('cohort')) {
            visualization = {
              type: 'retention',
              title: 'User Cohort Retention',
              data: [
                {"cohort":"Jan","month0":100,"month1":88.8,"month2":79.5,"month3":74.2,"month4":68.2,"month5":65.4,"month6":59.4,"totalUsers":2854},
                {"cohort":"Feb","month0":100,"month1":89.2,"month2":80.6,"month3":72.1,"month4":65.3,"month5":62.3,"month6":55.7,"totalUsers":2960},
                {"cohort":"Mar","month0":100,"month1":90.1,"month2":82.3,"month3":75.4,"month4":68.9,"month5":64.1,"month6":0,"totalUsers":3112},
                {"cohort":"Apr","month0":100,"month1":87.3,"month2":78.4,"month3":71.8,"month4":65.2,"month5":0,"month6":0,"totalUsers":2841},
                {"cohort":"May","month0":100,"month1":85.7,"month2":76.8,"month3":69.9,"month4":0,"month5":0,"month6":0,"totalUsers":2975},
                {"cohort":"Jun","month0":100,"month1":86.4,"month2":77.3,"month3":0,"month4":0,"month5":0,"month6":0,"totalUsers":3214},
                {"cohort":"Jul","month0":100,"month1":88.2,"month2":0,"month3":0,"month4":0,"month5":0,"month6":0,"totalUsers":3156}
              ],
              config: {
                colorScale: 'purple'
              }
            };
          } else if (inputMessage.toLowerCase().includes('area')) {
            visualization = {
              type: 'area',
              title: 'Website Traffic Analysis',
              description: 'Daily traffic sources',
              data: [
                { day: 'Mon', organic: 4000, direct: 2400, referral: 1800 },
                { day: 'Tue', organic: 3000, direct: 1398, referral: 2800 },
                { day: 'Wed', organic: 2000, direct: 3800, referral: 3200 },
                { day: 'Thu', organic: 2780, direct: 3908, referral: 1908 },
                { day: 'Fri', organic: 1890, direct: 4800, referral: 2300 },
                { day: 'Sat', organic: 2390, direct: 2800, referral: 1500 },
                { day: 'Sun', organic: 3490, direct: 1300, referral: 1100 },
              ],
              config: {
                dataKeys: ['organic', 'direct', 'referral'],
                xAxisDataKey: 'day'
              }
            };
          } else {
            // Default to bar chart
            visualization = {
              type: 'bar',
              title: 'Data Visualization',
              description: 'Generated visualization based on your request',
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
            };
          }
          
          const visualizationResponse: Message = {
            id: (Date.now() + 2).toString(),
            content: 'Here\'s the visualization you requested:',
            sender: 'bot',
            timestamp: new Date(),
            visualization: visualization
          };
          setMessages(prev => [...prev, visualizationResponse]);
        }, 3000);
      }
    }, 1000);
  };

  // Handle visualization edits
  const handleVisualizationEdit = (messageId: string, editedData: VisualizationData) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.visualization) {
        return {
          ...message,
          visualization: Array.isArray(message.visualization) 
            ? message.visualization.map(v => (v.title === editedData.title ? editedData : v))
            : editedData
        };
      }
      return message;
    }));
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
              
              <div className={`space-y-2 ${message.visualization ? 'w-full max-w-[800px]' : ''}`}>
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