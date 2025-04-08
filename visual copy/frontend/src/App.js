import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import QueryForm from './components/QueryForm';
import VisualizationContainer from './components/VisualizationContainer';
import DataTable from './components/DataTable';
import SchemaViewer from './components/SchemaViewer';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [schema, setSchema] = useState(null);

  // Fetch database schema on component mount
  React.useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await axios.get('/api/schema');
      setSchema(response.data.schema);
    } catch (err) {
      console.error('Error fetching schema:', err);
      setError('Failed to fetch database schema');
    }
  };

  const handleQuery = async (query, resetContext) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/query', {
        query,
        reset_context: resetContext,
        visualization_format: 'd3'
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error processing query:', err);
      setError(err.response?.data?.detail || 'An error occurred while processing your query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Visual Data Explorer</h1>
        <p>Transform natural language queries into interactive visualizations</p>
      </header>
      
      <main className="app-content">
        <div className="query-section">
          <QueryForm onSubmit={handleQuery} loading={loading} />
          {schema && <SchemaViewer schema={schema} />}
        </div>
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="results-section">
            <div className="query-info">
              <h3>Query Information</h3>
              <p><strong>Natural Language Query:</strong> {result.query}</p>
              <p><strong>SQL Query:</strong> <code>{result.sql_query}</code></p>
              <p><strong>Rows Returned:</strong> {result.row_count}</p>
              <p><strong>Visualization Type:</strong> {result.visualization_type}</p>
            </div>
            
            <VisualizationContainer 
              data={result.data} 
              spec={result.d3_spec} 
              visualizationType={result.visualization_type} 
            />
            
            <DataTable data={result.data} columns={result.columns} />
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by CrewAI, FastAPI, React, and D3.js</p>
      </footer>
    </div>
  );
}

export default App;
