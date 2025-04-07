import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { FileUp, Upload, X, FileText } from 'lucide-react';

interface CsvUploadProps {
  onUpload: (file: File) => void;
}

export default function CsvUpload({ onUpload }: CsvUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`glass-panel p-6 text-center border-2 border-dashed ${
          isDragging ? 'border-primary-400 bg-primary-400/5' : 'border-white/10'
        } rounded-lg cursor-pointer transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        aria-label="Upload CSV file"
        tabIndex={0}
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <FileUp size={36} className="text-primary-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">Upload CSV File</h3>
            <p className="text-sm text-white/60 mb-4">Drag and drop a CSV file or click to browse</p>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload size={14} />
              Select File
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-dark-700 p-3 rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600/20 p-2 rounded-md">
                <FileText size={20} className="text-primary-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-white/60">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Remove file"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="CSV file upload"
          title="Upload CSV file"
        />
      </div>
      
      {selectedFile && (
        <div className="flex justify-end">
          <Button variant="primary" className="gap-2" onClick={handleUpload}>
            <Upload size={16} />
            Upload and Process
          </Button>
        </div>
      )}
    </div>
  );
} 