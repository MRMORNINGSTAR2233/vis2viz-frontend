import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import HolographicBackground from '../../components/effects/HolographicBackground';

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatItem[]>([
    { 
      id: '1', 
      title: 'Data Visualization Project', 
      preview: 'How do I create a combined bar and line chart?',
      date: '2h ago'
    },
    { 
      id: '2', 
      title: 'Marketing Analytics', 
      preview: 'Can you analyze this campaign performance data?',
      date: 'Yesterday'
    },
    { 
      id: '3', 
      title: 'Sales Dashboard', 
      preview: 'I need a visualization for regional sales data',
      date: '3d ago'
    },
  ]);

  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Header */}
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-dark-800/30">
        <h1 className="text-xl font-medium">My Chats</h1>
      </header>

      {/* Search and New Chat */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-2.5 top-2.5 text-white/50" />
          <input 
            type="text" 
            placeholder="Search conversations..."
            className="w-full h-10 pl-9 pr-4 bg-dark-700 rounded-md border border-white/5 focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          <span>New Chat</span>
        </Button>
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

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/60 p-8">
            <MessageSquare size={48} className="mb-4 text-primary-400/60" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-sm mb-6">Start a new chat to begin visualizing your data</p>
            <Button variant="primary">Start New Chat</Button>
          </div>
        )}
      </div>
    </div>
  );
} 