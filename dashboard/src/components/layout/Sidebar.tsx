import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, MessageSquare, FileUp, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [recentChats, setRecentChats] = useState([
    { id: '1', title: 'Data Visualization Project' },
    { id: '2', title: 'Marketing Analytics' },
    { id: '3', title: 'Sales Dashboard' }
  ]);

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
      
      {/* File Upload Section */}
      <div className="p-4">
        <Button
          variant="outline"
          className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
        >
          <FileUp size={18} />
          {!collapsed && <span>Upload Files</span>}
        </Button>
      </div>
      
      <Separator />
      
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          variant="primary"
          className={`w-full justify-start gap-2 ${collapsed ? 'px-2' : ''}`}
        >
          <Plus size={18} />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>
      
      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className={`text-xs text-white/50 mb-2 px-2 ${collapsed ? 'hidden' : ''}`}>
          Recent Chats
        </div>
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