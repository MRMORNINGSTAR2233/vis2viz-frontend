import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { Edit2, Download, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '../ui/button';

// Types for visualization data
export interface VisualizationData {
  type: string;
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  config?: {
    dataKeys?: string[];
    xAxisDataKey?: string;
    colors?: string[];
    colorScale?: string;
    [key: string]: unknown;
  };
  footer?: string;
}

// Define types for retention data
interface RetentionItem {
  cohort: string;
  [key: string]: string | number;
}

interface DataVisualizationProps {
  visualizationData: VisualizationData | VisualizationData[];
  onEditComplete?: (editedData: VisualizationData) => void;
}

export default function DataVisualization({ 
  visualizationData, 
  onEditComplete 
}: DataVisualizationProps) {
  const [data, setData] = useState<VisualizationData[]>(
    Array.isArray(visualizationData) ? visualizationData : [visualizationData]
  );
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const d3Container = useRef<HTMLDivElement>(null);

  // Special cases that require custom D3 rendering
  const customD3Charts = ['retention', 'heatmap', 'network', 'sankey'];

  // Handle data updates
  useEffect(() => {
    setData(Array.isArray(visualizationData) ? visualizationData : [visualizationData]);
  }, [visualizationData]);

  // Render retention matrix with D3
  useEffect(() => {
    // Only render retention chart with D3 when there's a retention chart in data
    const retentionData = data.find(d => d.type === 'retention');
    
    if (retentionData && d3Container.current) {
      renderRetentionChart(retentionData, d3Container.current);
    }
  }, [data]);

  // Function to render retention chart with D3
  const renderRetentionChart = (chartData: VisualizationData, container: HTMLDivElement) => {
    // Clear previous chart
    d3.select(container).selectAll('*').remove();
    
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .text(chartData.title);
    
    // Get data
    const data = chartData.data as RetentionItem[];
    
    // Find month columns dynamically
    const monthColumns = Object.keys(data[0])
      .filter(key => key.startsWith('month') && key !== 'month')
      .sort((a, b) => {
        const numA = parseInt(a.replace('month', ''));
        const numB = parseInt(b.replace('month', ''));
        return numA - numB;
      });
    
    // Create scales
    const x = d3.scaleBand()
      .domain(monthColumns)
      .range([0, width])
      .padding(0.01);
    
    const y = d3.scaleBand()
      .domain(data.map(d => d.cohort))
      .range([0, height])
      .padding(0.01);
    
    // Create color scale
    const colorScale = chartData.config?.colorScale || 'purple';
    const color = d3.scaleSequential()
      .interpolator(colorScale === 'purple' ? d3.interpolatePurples : d3.interpolateBlues)
      .domain([0, 100]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        const month = parseInt(d.toString().replace('month', ''));
        return `M${month}`;
      }))
      .selectAll('text')
      .style('fill', '#fff')
      .style('text-anchor', 'middle');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#fff');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .text('Months Since Acquisition');
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .text('Cohort');
    
    // Create the cells
    svg.selectAll('rect')
      .data(data.flatMap(d => 
        monthColumns.map(month => ({
          cohort: d.cohort,
          month,
          value: Number(d[month])
        }))
      ))
      .enter()
      .append('rect')
      .attr('x', d => x(d.month) as number)
      .attr('y', d => y(d.cohort) as number)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => color(d.value))
      .style('stroke', '#222')
      .style('stroke-width', 1);
    
    // Add text to cells
    svg.selectAll('text.cell')
      .data(data.flatMap(d => 
        monthColumns.map(month => ({
          cohort: d.cohort,
          month,
          value: Number(d[month])
        }))
      ))
      .enter()
      .append('text')
      .attr('class', 'cell')
      .attr('x', d => (x(d.month) as number) + x.bandwidth() / 2)
      .attr('y', d => (y(d.cohort) as number) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', d => d.value > 50 ? '#000' : '#fff')
      .text(d => `${d.value}%`);
    
    // Add legend
    const legendWidth = 300;
    const legendHeight = 20;
    
    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
      .tickValues([0, 25, 50, 75, 100])
      .tickFormat(d => `${d}%`);
    
    const legend = svg.append('g')
      .attr('transform', `translate(${(width - legendWidth) / 2},${height + 60})`);
    
    const defs = legend.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'retention-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
    
    // Add gradient colors
    const colorStops = [0, 25, 50, 75, 100];
    colorStops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', `${stop}%`)
        .attr('stop-color', color(stop));
    });
    
    // Add gradient rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#retention-gradient)');
    
    // Add legend axis
    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('fill', '#fff')
      .style('font-size', '10px');
  };

  // Function to handle download
  const handleDownload = (index: number) => {
    if (customD3Charts.includes(data[index].type) && d3Container.current) {
      // Export SVG for D3 charts
      const svgElement = d3Container.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `${data[index].title.replace(/\s+/g, '_')}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } else {
      // For Recharts, we'd need to implement SVG export
      alert('Download functionality for this chart type is not implemented yet');
    }
  };

  // Function to enter edit mode
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedTitle(data[index].title);
    setEditedDescription(data[index].description || '');
    setEditMode(true);
  };

  // Function to save edits
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newData = [...data];
      newData[editingIndex] = {
        ...newData[editingIndex],
        title: editedTitle,
        description: editedDescription
      };
      
      setData(newData);
      setEditMode(false);
      setEditingIndex(null);
      
      // Call the callback if provided
      if (onEditComplete && newData[editingIndex]) {
        onEditComplete(newData[editingIndex]);
      }
    }
  };

  // Function to cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingIndex(null);
  };

  // Render individual chart based on type
  const renderChart = (chartData: VisualizationData, index: number) => {
    // For charts that need custom D3 rendering
    if (customD3Charts.includes(chartData.type)) {
      return (
        <div key={`chart-${index}`} className="mb-6 glass-panel p-4 rounded-lg">
          {editMode && editingIndex === index ? (
            <div className="mb-4 space-y-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full p-2 bg-dark-700 border border-white/10 rounded-md"
                placeholder="Chart Title"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-2 bg-dark-700 border border-white/10 rounded-md h-20"
                placeholder="Description (optional)"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={handleCancelEdit}
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="gap-1"
                  onClick={handleSaveEdit}
                >
                  <Check size={14} />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-3 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{chartData.title}</h3>
                {chartData.description && (
                  <p className="text-sm text-white/60 mt-1">{chartData.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => handleEdit(index)}
                >
                  <Edit2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => handleDownload(index)}
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
          )}
          
          {chartData.type === 'retention' && (
            <div 
              ref={d3Container}
              className="h-[400px] w-full" 
            />
          )}
          
          {chartData.footer && (
            <div className="mt-3 text-xs text-white/60 flex items-center gap-1">
              <RefreshCw size={10} />
              <span>{chartData.footer}</span>
            </div>
          )}
        </div>
      );
    }
    
    // Recharts components for standard chart types
    return (
      <div key={`chart-${index}`} className="mb-6 glass-panel p-4 rounded-lg">
        {editMode && editingIndex === index ? (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 bg-dark-700 border border-white/10 rounded-md"
              placeholder="Chart Title"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 bg-dark-700 border border-white/10 rounded-md h-20"
              placeholder="Description (optional)"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={handleCancelEdit}
              >
                <X size={14} />
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className="gap-1"
                onClick={handleSaveEdit}
              >
                <Check size={14} />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{chartData.title}</h3>
              {chartData.description && (
                <p className="text-sm text-white/60 mt-1">{chartData.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => handleEdit(index)}
              >
                <Edit2 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => handleDownload(index)}
              >
                <Download size={14} />
              </Button>
            </div>
          </div>
        )}
        
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {renderChartByType(chartData)}
          </ResponsiveContainer>
        </div>
        
        {chartData.footer && (
          <div className="mt-3 text-xs text-white/60 flex items-center gap-1">
            <RefreshCw size={10} />
            <span>{chartData.footer}</span>
          </div>
        )}
      </div>
    );
  };

  // Helper function to render chart based on type
  const renderChartByType = (chartData: VisualizationData) => {
    const { type, data, config } = chartData;
    const dataKeys = config?.dataKeys || [];
    const xAxisDataKey = config?.xAxisDataKey || 'name';
    const colors = config?.colors || ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];
    
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xAxisDataKey} stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[i % colors.length]} 
                name={key.charAt(0).toUpperCase() + key.slice(1)} 
              />
            ))}
          </BarChart>
        );
        
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xAxisDataKey} stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                name={key.charAt(0).toUpperCase() + key.slice(1)} 
              />
            ))}
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xAxisDataKey} stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                fill={colors[i % colors.length]} 
                stroke={colors[i % colors.length]} 
                fillOpacity={0.5}
                name={key.charAt(0).toUpperCase() + key.slice(1)} 
              />
            ))}
          </AreaChart>
        );
        
      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            <Pie
              data={data}
              dataKey={dataKeys[0] || 'value'}
              nameKey={xAxisDataKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
        
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey={dataKeys[0] || 'x'} 
              name={dataKeys[0]?.charAt(0).toUpperCase() + dataKeys[0]?.slice(1)} 
              stroke="#aaa" 
            />
            <YAxis 
              dataKey={dataKeys[1] || 'y'} 
              name={dataKeys[1]?.charAt(0).toUpperCase() + dataKeys[1]?.slice(1)} 
              stroke="#aaa" 
            />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            <Scatter 
              name={chartData.title} 
              data={data} 
              fill={colors[0]} 
            />
          </ScatterChart>
        );
        
      default:
        return (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-white/50">Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="visualization-container">
      {data.map((chartData, index) => renderChart(chartData, index))}
    </div>
  );
} 