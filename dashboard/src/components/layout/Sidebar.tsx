import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Database, 
  FileSpreadsheet, 
  Settings,
  Pencil,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface DataSourceBase {
  id: string;
  name: string;
  type: 'database' | 'csv';
}

interface DatabaseSource extends DataSourceBase {
  type: 'database';
  dbType: 'mysql' | 'postgres';
  database: string;
}

interface CsvSource extends DataSourceBase {
  type: 'csv';
  fileName: string;
  fileSize: number;
}

type DataSource = DatabaseSource | CsvSource;

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDataSource, setActiveDataSource] = useState<DataSource | null>(null);
  const [recentChats, setRecentChats] = useState([
    { id: '1', title: 'Data Visualization Project' },
    { id: '2', title: 'Marketing Analytics' },
    { id: '3', title: 'Sales Dashboard' }
  ]);
  
  // Check if we're in an active chat with a data source
  const isInActiveChat = location.pathname.includes('/chat/') && 
    (location.pathname.startsWith('/chat/new') || !location.pathname.endsWith('/chat')) &&
    location.search.includes('source=');

  // Find active data source from URL when in a chat
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sourceId = searchParams.get('source');
    
    // Only load active data source when in a chat with source parameter
    if (sourceId && isInActiveChat) {
      // Find the data source in localStorage
      const storedSources = localStorage.getItem('dataSources');
      if (storedSources) {
        try {
          const parsedSources = JSON.parse(storedSources);
          const source = parsedSources.find((s: any) => 
            s && s.config && (
              (s.type === 'database' && s.config?.id === sourceId) || 
              (s.type === 'csv' && s.config?.id === sourceId)
            )
          );
          
          if (source && source.config) {
            // Format the source data 
            let formattedSource;
            if (source.type === 'database') {
              formattedSource = {
                id: source.config?.id || `db-${Date.now()}`,
                name: source.config?.configName || 'Unnamed Database',
                type: 'database',
                dbType: source.config?.type || 'mysql',
                database: source.config?.database || 'Unknown'
              } as DatabaseSource;
            } else {
              formattedSource = {
                id: source.config?.id || `csv-${Date.now()}`,
                name: source.config?.name || 'Unnamed CSV',
                type: 'csv',
                fileName: source.config?.fileName || 'unknown.csv',
                fileSize: source.config?.fileSize || 0
              } as CsvSource;
            }
            setActiveDataSource(formattedSource);
          } else {
            console.warn(`Data source with ID ${sourceId} not found or has invalid format`);
            setActiveDataSource(null);
          }
        } catch (error) {
          console.error('Error loading active data source:', error);
          setActiveDataSource(null);
        }
      }
    } else {
      setActiveDataSource(null);
    }
  }, [location, isInActiveChat]);

  const handleEditSource = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/chat/data-source/edit/${id}`);
  };

  const handleDeleteSource = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this data source?')) {
      // Remove from localStorage
      const storedSources = localStorage.getItem('dataSources');
      if (storedSources) {
        const sources = JSON.parse(storedSources);
        const updatedSources = sources.filter((s: any) => 
          (s.type === 'database' && s.config.id !== id) || 
          (s.type === 'csv' && s.config.id !== id)
        );
        localStorage.setItem('dataSources', JSON.stringify(updatedSources));
        
        // If we deleted the active source, navigate back to chat
        if (activeDataSource && activeDataSource.id === id) {
          navigate('/chat');
        }
      }
    }
  };
  
  const handleBackToSourceList = () => {
    navigate('/chat');
  };

  const handleNewDataSource = () => {
    navigate('/chat/data-source');
  };

  const handleNewChat = () => {
    if (activeDataSource) {
      // If in active chat mode, start a new chat with the same data source
      navigate(`/chat/new?source=${activeDataSource.id}`);
    } else {
      // If in regular mode, go to data source selection
      navigate('/chat/data-source');
    }
  };

  const renderChatsList = () => (
    <>
      {!collapsed && recentChats.length > 0 && (
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Recent Chats
          </span>
        </div>
      )}
      
      <div className="space-y-1">
        {recentChats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-dark-700 text-sm transition-colors"
          >
            <MessageSquare size={16} className="text-primary-400 shrink-0" />
            {!collapsed && (
              <span className="truncate">{chat.title}</span>
            )}
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <div 
      className={`flex flex-col h-screen bg-dark-800 border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-[70px]' : 'w-[280px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
            Auralytics
          </span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      <Separator />
      
      {/* Content based on whether we're in an active chat with a data source */}
      {isInActiveChat && activeDataSource ? (
        /* Display active data source when in a chat */
        <div className="flex-grow flex flex-col">
          {/* Back button */}
          <div className="p-4">
            <Button
              variant="outline"
              className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
              onClick={handleBackToSourceList}
            >
              <ArrowLeft size={18} />
              {!collapsed && <span>Back to Chat</span>}
            </Button>
          </div>
          
          {/* New Chat button (with same data source) */}
          <div className="px-4 pb-4">
            <Button
              variant="primary"
              className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
              onClick={handleNewChat}
            >
              <Plus size={18} />
              {!collapsed && <span>New Chat</span>}
            </Button>
          </div>
          
          <Separator />
          
          {/* Current data source details */}
          <div className="p-4">
            {!collapsed && (
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                Current Data Source
              </div>
            )}
            
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-start gap-3">
                {activeDataSource.type === 'database' ? (
                  <Database size={16} className="text-primary-400 shrink-0 mt-0.5" />
                ) : (
                  <FileSpreadsheet size={16} className="text-primary-400 shrink-0 mt-0.5" />
                )}
                
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{activeDataSource.name}</div>
                    <div className="text-xs text-white/50 truncate">
                      {activeDataSource.type === 'database' 
                        ? `${activeDataSource.dbType} • ${activeDataSource.database}` 
                        : `${activeDataSource.fileName}`}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-full"
                        onClick={(e) => handleEditSource(activeDataSource.id, e)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={(e) => handleDeleteSource(activeDataSource.id, e)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Chat history in active chat view */}
          <div className="flex-grow overflow-y-auto px-2 py-1">
            {renderChatsList()}
          </div>
        </div>
      ) : (
        /* Regular sidebar - only show new chat button and chat history */
        <>
          {/* New Chat button */}
          <div className="p-4">
            <Button
              variant="primary"
              className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
              onClick={handleNewDataSource}
            >
              <Plus size={18} />
              {!collapsed && <span>New Chat</span>}
            </Button>
          </div>
          
          {/* Recent Chats */}
          <div className="flex-grow overflow-y-auto px-2 py-1">
            {renderChatsList()}
          </div>
        </>
      )}
      
      <Separator />
      
      {/* Profile Section - Always show */}
      <div className="p-4">
        <Link to="/profile" className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9 rounded-md bg-gradient-to-br from-primary-500 to-secondary-600">
              <AvatarImage src="" />
              <AvatarFallback className="font-bold text-white">AK</AvatarFallback>
            </Avatar>
          </div>
          
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Akshay Kumar</span>
              <span className="text-xs text-white/60 truncate">akshay@example.com</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
} 