import { useState } from 'react';
import { Button } from '../ui/button';
import { Database, Save } from 'lucide-react';

interface DatabaseConfig {
  type: 'mysql' | 'postgres';
  configName: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface DatabaseConfigProps {
  onSubmit: (config: DatabaseConfig) => void;
  existingConfig?: DatabaseConfig;
}

export default function DatabaseConfigForm({ onSubmit, existingConfig }: DatabaseConfigProps) {
  const [config, setConfig] = useState<DatabaseConfig>(
    existingConfig || {
      type: 'mysql',
      configName: '',
      host: 'localhost',
      port: '',
      username: '',
      password: '',
      database: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database size={18} className="text-primary-400" />
          <h3 className="text-lg font-medium">Database Configuration</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="type">
              Database Type
            </label>
            <select
              id="type"
              name="type"
              value={config.type}
              onChange={handleChange}
              className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
            >
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="configName">
              Configuration Name
            </label>
            <input
              id="configName"
              name="configName"
              type="text"
              placeholder="My Database"
              value={config.configName}
              onChange={handleChange}
              className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="host">
                Host
              </label>
              <input
                id="host"
                name="host"
                type="text"
                placeholder="localhost"
                value={config.host}
                onChange={handleChange}
                className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="port">
                Port
              </label>
              <input
                id="port"
                name="port"
                type="text"
                placeholder="3306"
                value={config.port}
                onChange={handleChange}
                className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="root"
              value={config.username}
              onChange={handleChange}
              className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={handleChange}
              className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1" htmlFor="database">
              Database Name
            </label>
            <input
              id="database"
              name="database"
              type="text"
              placeholder="my_database"
              value={config.database}
              onChange={handleChange}
              className="w-full bg-dark-700 border border-white/10 rounded-md h-10 px-3 text-white focus:outline-none focus:border-primary-400"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" variant="primary" className="gap-2">
          <Save size={16} />
          Save Configuration
        </Button>
      </div>
    </form>
  );
} 