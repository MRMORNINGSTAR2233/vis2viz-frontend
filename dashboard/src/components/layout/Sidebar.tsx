import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Database, 
  User, 
  FileSpreadsheet, 
  Settings 
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
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [recentChats, setRecentChats] = useState([
    { id: '1', title: 'Data Visualization Project' },
    { id: '2', title: 'Marketing Analytics' },
    { id: '3', title: 'Sales Dashboard' }
  ]);

  useEffect(() => {
    // In a real application, this would come from an API
    // Here we're loading from localStorage
    const storedSources = localStorage.getItem('dataSources');
    if (storedSources) {
      try {
        const parsedSources = JSON.parse(storedSources);
        // Transform the stored data into our DataSource format
        const formattedSources: DataSource[] = parsedSources.map((source: any) => {
          if (source.type === 'database') {
            return {
              id: source.config.id,
              name: source.config.configName,
              type: 'database',
              dbType: source.config.type,
              database: source.config.database
            } as DatabaseSource;
          } else {
            return {
              id: source.config.id,
              name: source.config.name,
              type: 'csv',
              fileName: source.config.fileName,
              fileSize: source.config.fileSize
            } as CsvSource;
          }
        });
        setDataSources(formattedSources);
      } catch (error) {
        console.error('Error parsing stored data sources:', error);
      }
    }
  }, []);

  return (
    <div 
      className={`flex flex-col h-screen bg-dark-800 border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-[70px]' : 'w-[260px]'
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
      
      {/* Data source section */}
      <div className="p-4">
        <Button
          variant="primary"
          className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
          onClick={() => navigate('/chat/data-source')}
        >
          <Plus size={18} />
          {!collapsed && <span>New Connection</span>}
        </Button>
      </div>
      
      <Separator />
      
      {/* Data Sources */}
      <div className={`flex-grow overflow-y-auto p-2 ${collapsed ? '' : 'space-y-3'}`}>
        {!collapsed && dataSources.length > 0 && (
          <div className="text-xs text-white/50 px-2 py-1">
            Data Sources
          </div>
        )}

        {dataSources.map((source) => (
          <Link
            key={source.id}
            to={`/chat/new?source=${source.id}`}
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-dark-700 text-sm transition-colors"
          >
            {source.type === 'database' ? (
              <Database size={16} className="text-primary-400 shrink-0" />
            ) : (
              <FileSpreadsheet size={16} className="text-primary-400 shrink-0" />
            )}
            {!collapsed && (
              <span className="truncate">{source.name}</span>
            )}
          </Link>
        ))}
        
        {/* Recent Chats Header */}
        {!collapsed && (
          <div className="text-xs text-white/50 px-2 py-1">
            Recent Chats
          </div>
        )}
        
        {/* Recent Chats */}
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
      </div>
      
      <Separator />
      
      {/* Profile Section */}
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