import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Database, FileSpreadsheet, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import DatabaseConfigForm from '../../components/chat/DatabaseConfig';
import CsvUpload from '../../components/chat/CsvUpload';
import HolographicBackground from '../../components/effects/HolographicBackground';
import { DataSource } from './NewDataSourcePage';

export default function EditDataSourcePage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadDataSource = () => {
      setIsLoading(true);
      
      try {
        if (!sourceId) {
          navigate('/chat');
          return;
        }
        
        // Find data source in localStorage
        const storedSources = localStorage.getItem('dataSources');
        if (storedSources) {
          const sources: DataSource[] = JSON.parse(storedSources);
          const source = sources.find(s => 
            (s.type === 'database' && s.config.id === sourceId) || 
            (s.type === 'csv' && s.config.id === sourceId)
          );
          
          if (source) {
            setDataSource(source);
          } else {
            // Data source not found
            navigate('/chat');
          }
        }
      } catch (error) {
        console.error('Error loading data source:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDataSource();
  }, [sourceId, navigate]);

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this data source? This action cannot be undone.')) {
      try {
        // Remove the data source from localStorage
        const storedSources = localStorage.getItem('dataSources');
        if (storedSources) {
          const sources: DataSource[] = JSON.parse(storedSources);
          const updatedSources = sources.filter(s => 
            (s.type === 'database' && s.config.id !== sourceId) || 
            (s.type === 'csv' && s.config.id !== sourceId)
          );
          localStorage.setItem('dataSources', JSON.stringify(updatedSources));
        }
        
        // Navigate back to the chat page
        navigate('/chat');
      } catch (error) {
        console.error('Error deleting data source:', error);
        alert('Failed to delete data source. Please try again.');
      }
    }
  };

  const handleDatabaseUpdate = async (updatedConfig: any) => {
    try {
      setIsProcessing(true);
      
      if (!dataSource || dataSource.type !== 'database') {
        return;
      }
      
      // Get current data sources from localStorage
      const storedSources = localStorage.getItem('dataSources');
      if (storedSources) {
        const sources: DataSource[] = JSON.parse(storedSources);
        
        // Find and update the source
        const updatedSources = sources.map(source => {
          if (source.type === 'database' && source.config.id === sourceId) {
            return {
              ...source,
              config: {
                ...updatedConfig,
                id: sourceId // Keep the same ID
              }
            };
          }
          return source;
        });
        
        // Save updated sources back to localStorage
        localStorage.setItem('dataSources', JSON.stringify(updatedSources));
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Redirect back to the chat page
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error updating database configuration:', error);
      alert('Failed to update database configuration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading data source...</p>
        </div>
      </div>
    );
  }

  if (!dataSource) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-4">Data source not found</p>
          <Button variant="outline" onClick={handleBackToChat}>
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Header */}
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-dark-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToChat}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary-600/20 p-1.5 rounded-md">
              {dataSource.type === 'database' ? (
                <Database size={16} className="text-primary-400" />
              ) : (
                <FileSpreadsheet size={16} className="text-primary-400" />
              )}
            </div>
            <h1 className="text-xl font-medium">
              {dataSource.type === 'database' 
                ? `Edit ${dataSource.config.configName}` 
                : `Edit ${dataSource.config.name}`}
            </h1>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </Button>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {dataSource.type === 'database' && (
            <DatabaseConfigForm 
              onSubmit={handleDatabaseUpdate} 
              existingConfig={dataSource.config}
            />
          )}
          
          {dataSource.type === 'csv' && (
            <div className="glass-panel p-6 text-center">
              <FileSpreadsheet size={36} className="text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">CSV File Information</h3>
              <p className="text-white/70 mb-4">CSV files cannot be edited after upload</p>
              
              <div className="bg-dark-700 rounded-md p-4 text-left mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-white/60">Filename</p>
                    <p className="font-medium">{dataSource.config.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">File Size</p>
                    <p className="font-medium">{(dataSource.config.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-white/60">Upload Date</p>
                  <p className="font-medium">
                    {new Date(dataSource.config.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleBackToChat}>
                  Return to Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Saving changes...</p>
            <p className="text-white/60 text-sm">This will just take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
} 