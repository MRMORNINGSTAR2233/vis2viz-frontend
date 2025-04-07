import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, FileSpreadsheet } from 'lucide-react';
import { Tabs } from '../../components/ui/tabs';
import DatabaseConfigForm from '../../components/chat/DatabaseConfig';
import CsvUpload from '../../components/chat/CsvUpload';
import HolographicBackground from '../../components/effects/HolographicBackground';

// Types
export interface DatabaseConfig {
  id?: string;
  type: 'mysql' | 'postgres';
  configName: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export interface CsvSource {
  id?: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
}

export type DataSource = {
  type: 'database';
  config: DatabaseConfig;
} | {
  type: 'csv';
  config: CsvSource;
};

export default function NewDataSourcePage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle database config submission
  const handleDatabaseSubmit = async (config: DatabaseConfig) => {
    try {
      setIsProcessing(true);
      
      // In a real app, this would call an API to save the config
      console.log('Database configuration:', config);
      
      // Create a unique ID for this connection
      const newDataSource: DataSource = {
        type: 'database',
        config: {
          ...config,
          id: `db_${Date.now()}`
        }
      };
      
      // Save to local storage (in a real app, this would be saved to a backend)
      const dataSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      dataSources.push(newDataSource);
      localStorage.setItem('dataSources', JSON.stringify(dataSources));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new chat with this data source
      navigate(`/chat/new?source=${newDataSource.config.id}`);
    } catch (error) {
      console.error('Error saving database configuration:', error);
      alert('Failed to save database configuration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle CSV upload
  const handleCsvUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // In a real app, this would upload the file to a server
      console.log('CSV file:', file);
      
      // Create a CSV source entry
      const csvSource: CsvSource = {
        id: `csv_${Date.now()}`,
        name: file.name.replace('.csv', ''),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date()
      };
      
      // Create a data source entry
      const newDataSource: DataSource = {
        type: 'csv',
        config: csvSource
      };
      
      // Save to local storage (in a real app, this would be saved to a backend)
      const dataSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      dataSources.push(newDataSource);
      localStorage.setItem('dataSources', JSON.stringify(dataSources));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new chat with this data source
      navigate(`/chat/new?source=${csvSource.id}`);
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      alert('Failed to upload CSV file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const tabs = [
    {
      value: 'database',
      label: 'Database Connection',
      content: <DatabaseConfigForm onSubmit={handleDatabaseSubmit} />
    },
    {
      value: 'csv',
      label: 'CSV Upload',
      content: <CsvUpload onUpload={handleCsvUpload} />
    }
  ];
  
  return (
    <div className="h-full flex flex-col">
      <HolographicBackground color="purple" opacity={0.1} />
      
      {/* Header */}
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-dark-800/30">
        <h1 className="text-xl font-medium">Connect Data Source</h1>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Choose a Data Source</h2>
            <p className="text-white/70">
              Select a data source to connect to. You can either connect to a database or upload a CSV file.
            </p>
          </div>
          
          <div className="glass-panel rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-lg border border-white/10 hover:border-primary-400/50 bg-dark-800/50 transition-colors">
                <Database size={36} className="text-primary-400 mb-2" />
                <h3 className="font-medium mb-1">Database Connection</h3>
                <p className="text-sm text-white/60">Connect to MySQL or PostgreSQL databases</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg border border-white/10 hover:border-primary-400/50 bg-dark-800/50 transition-colors">
                <FileSpreadsheet size={36} className="text-primary-400 mb-2" />
                <h3 className="font-medium mb-1">CSV Upload</h3>
                <p className="text-sm text-white/60">Upload and analyze CSV files</p>
              </div>
            </div>
            
            <Tabs defaultValue="database" tabs={tabs} />
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Processing your data...</p>
            <p className="text-white/60 text-sm">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
} 