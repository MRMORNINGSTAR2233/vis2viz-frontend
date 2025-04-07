import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Plus, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  dataSourceId: string;
}

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

  useEffect(() => {
    // Load data sources from localStorage (in a real app, this would be from an API)
    const storedDataSources = localStorage.getItem('dataSources');
    if (storedDataSources) {
      setDataSources(JSON.parse(storedDataSources));
    }
  }, []);

  const handleNewChat = () => {
    navigate('/chat/data-source');
  };

  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Header */}
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-dark-800/30">
        <h1 className="text-xl font-medium">Data Sources & Chats</h1>
      </header>

      {/* Search and New Chat */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-2.5 top-2.5 text-white/50" />
          <input 
            type="text" 
            placeholder="Search data sources and conversations..."
            className="w-full h-10 pl-9 pr-4 bg-dark-700 rounded-md border border-white/5 focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>
        <Button variant="primary" className="gap-2" onClick={handleNewChat}>
          <Plus size={16} />
          <span>New Connection</span>
        </Button>
      </div>

      {/* Data Sources List */}
      {dataSources.length > 0 && (
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-lg font-medium mb-3">Your Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {dataSources.map((source) => (
              <div 
                key={source.type === 'database' ? source.config.id : source.config.id}
                className="glass-panel p-4 rounded-lg hover:bg-dark-700/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {source.type === 'database' ? (
                    <>
                      <div className="bg-primary-600/20 rounded-md p-2">
                        <Database size={20} className="text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{source.config.configName}</h3>
                        <p className="text-xs text-white/60">{source.config.type} • {source.config.database}</p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => navigate(`/chat/new?source=${source.config.id}`)}
                          >
                            New Chat
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => navigate(`/chat/data-source/edit/${source.config.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary-600/20 rounded-md p-2">
                        <FileSpreadsheet size={20} className="text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{source.config.name}</h3>
                        <p className="text-xs text-white/60">
                          {source.config.fileName} • {(source.config.fileSize / 1024).toFixed(2)} KB
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => navigate(`/chat/new?source=${source.config.id}`)}
                          >
                            New Chat
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            <div 
              className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-400/50 transition-colors"
              onClick={handleNewChat}
            >
              <Plus size={24} className="text-primary-400 mb-2" />
              <h3 className="font-medium">Add Data Source</h3>
              <p className="text-xs text-white/60 mt-1">Connect a database or upload CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Chats */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-medium mb-3">Recent Conversations</h2>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chats.map((chat) => (
          <Link 
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="block p-4 rounded-lg glossy-card hover:bg-dark-700/70 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary-600/20 rounded-md p-2">
                <MessageSquare size={20} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium truncate">{chat.title}</h3>
                  <span className="text-xs text-white/60">{chat.date}</span>
                </div>
                <p className="text-sm text-white/70 truncate">{chat.preview}</p>
              </div>
            </div>
          </Link>
        ))}

        {chats.length === 0 && dataSources.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center text-white/60 p-8">
            <Database size={48} className="mb-4 text-primary-400/60" />
            <h3 className="text-lg font-medium mb-2">No data sources connected</h3>
            <p className="text-sm mb-6">Connect a database or upload a CSV file to start visualizing your data</p>
            <Button variant="primary" onClick={handleNewChat}>Connect Data Source</Button>
          </div>
        )}
        
        {chats.length === 0 && dataSources.length > 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center text-white/60 p-8">
            <MessageSquare size={48} className="mb-4 text-primary-400/60" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-sm mb-6">Start a new chat with one of your data sources</p>
            <Button variant="primary" onClick={handleNewChat}>Start New Chat</Button>
          </div>
        )}
      </div>
    </div>
  );
} 