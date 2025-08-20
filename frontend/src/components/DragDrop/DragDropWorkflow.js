import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import DraggableTask from './DraggableTask';
import WorkflowCanvas from './WorkflowCanvas';
import { useAI } from '../../contexts/AIContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Share,
  Settings,
  Layers,
  ArrowRight,
  Grid,
  Eye
} from 'lucide-react';

const DragDropWorkflow = ({ isVisible, onClose }) => {
  const [workflowNodes, setWorkflowNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const canvasRef = useRef(null);
  
  const { sendMessage } = useAI();
  const { createWorkflow, executeWorkflow } = useWorkflow();

  // Predefined task templates
  const taskTemplates = [
    {
      id: 'web-search',
      type: 'search',
      title: 'Web Search',
      description: 'Search the web for information',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      inputs: ['query'],
      outputs: ['results'],
      parameters: { platforms: ['google', 'bing'], depth: 'standard' }
    },
    {
      id: 'social-monitor',
      type: 'social',
      title: 'Social Monitor',
      description: 'Monitor social media platforms',
      icon: '📱',
      color: 'from-purple-500 to-pink-500',
      inputs: ['keywords'],
      outputs: ['mentions', 'sentiment'],
      parameters: { platforms: ['twitter', 'linkedin'], realtime: true }
    },
    {
      id: 'data-extract',
      type: 'extract',
      title: 'Data Extract',
      description: 'Extract data from web pages',
      icon: '📊',
      color: 'from-green-500 to-emerald-500',
      inputs: ['url'],
      outputs: ['data'],
      parameters: { format: 'json', selectors: [] }
    },
    {
      id: 'ai-analyze',
      type: 'analyze',
      title: 'AI Analysis',
      description: 'Analyze data with AI',
      icon: '🧠',
      color: 'from-orange-500 to-red-500',
      inputs: ['data'],
      outputs: ['insights'],
      parameters: { model: 'advanced', confidence: 0.8 }
    },
    {
      id: 'report-gen',
      type: 'report',
      title: 'Report Generator',
      description: 'Generate comprehensive reports',
      icon: '📄',
      color: 'from-indigo-500 to-purple-500',
      inputs: ['data', 'template'],
      outputs: ['report'],
      parameters: { format: 'html', charts: true }
    },
    {
      id: 'email-send',
      type: 'communication',
      title: 'Email Sender',
      description: 'Send automated emails',
      icon: '📧',
      color: 'from-teal-500 to-blue-500',
      inputs: ['recipients', 'content'],
      outputs: ['status'],
      parameters: { template: 'professional', tracking: true }
    }
  ];

  const handleDrop = useCallback((item, position) => {
    const newNode = {
      id: `node-${Date.now()}`,
      ...item,
      position: position,
      connected: false,
      status: 'idle'
    };
    
    setWorkflowNodes(prev => [...prev, newNode]);
  }, []);

  const handleNodeMove = useCallback((nodeId, newPosition) => {
    setWorkflowNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position: newPosition } : node
    ));
  }, []);

  const handleNodeConnect = useCallback((sourceId, targetId) => {
    const newConnection = {
      id: `connection-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'data'
    };
    
    setConnections(prev => [...prev, newConnection]);
    
    // Update node connection status
    setWorkflowNodes(prev => prev.map(node => ({
      ...node,
      connected: node.id === sourceId || node.id === targetId ? true : node.connected
    })));
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    setWorkflowNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
  }, []);

  const generateWorkflowInstruction = () => {
    if (workflowNodes.length === 0) return '';
    
    const instructions = workflowNodes.map(node => {
      const connections_in = connections.filter(c => c.target === node.id);
      const connections_out = connections.filter(c => c.source === node.id);
      
      let instruction = `${node.title}: ${node.description}`;
      
      if (connections_in.length > 0) {
        const inputs = connections_in.map(c => {
          const sourceNode = workflowNodes.find(n => n.id === c.source);
          return sourceNode ? sourceNode.title : 'previous step';
        });
        instruction += ` (using data from: ${inputs.join(', ')})`;
      }
      
      return instruction;
    });
    
    return `Create a workflow that: ${instructions.join(' → ')}`;
  };

  const executeVisualWorkflow = async () => {
    if (workflowNodes.length === 0) return;
    
    setIsBuilding(true);
    
    try {
      const instruction = generateWorkflowInstruction();
      const workflow = await createWorkflow(instruction);
      
      if (workflow) {
        await executeWorkflow(workflow.workflow_id);
        
        // Update node statuses to show execution
        setWorkflowNodes(prev => prev.map(node => ({
          ...node,
          status: 'running'
        })));
        
        // Simulate execution progress
        setTimeout(() => {
          setWorkflowNodes(prev => prev.map(node => ({
            ...node,
            status: 'completed'
          })));
        }, 3000);
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const saveWorkflow = async () => {
    const workflowData = {
      nodes: workflowNodes,
      connections: connections,
      instruction: generateWorkflowInstruction(),
      created_at: new Date().toISOString()
    };
    
    // In real implementation, save to backend
    console.log('Saving workflow:', workflowData);
  };

  if (!isVisible) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-4 bg-dark-900 border border-dark-600 rounded-xl shadow-2xl z-50 flex"
      >
        {/* Task Palette */}
        <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
          {/* Palette Header */}
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Layers size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Workflow Builder</h2>
                  <p className="text-xs text-gray-400">Drag & drop to create</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-700 rounded-lg text-gray-400"
              >
                ×
              </button>
            </div>
          </div>

          {/* Task Templates */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {taskTemplates.map((template) => (
                <DraggableTask
                  key={template.id}
                  task={template}
                  onDragStart={() => setDraggedItem(template)}
                  onDragEnd={() => setDraggedItem(null)}
                />
              ))}
            </div>
          </div>

          {/* Workflow Actions */}
          <div className="p-4 border-t border-dark-700 space-y-2">
            <motion.button
              onClick={executeVisualWorkflow}
              disabled={workflowNodes.length === 0 || isBuilding}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: workflowNodes.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: workflowNodes.length > 0 ? 0.98 : 1 }}
            >
              {isBuilding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Execute Workflow
                </>
              )}
            </motion.button>
            
            <div className="flex gap-2">
              <motion.button
                onClick={saveWorkflow}
                className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={14} />
                Save
              </motion.button>
              <motion.button
                className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share size={14} />
                Share
              </motion.button>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="h-12 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Grid size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Canvas</span>
              </div>
              <div className="text-xs text-gray-500">
                {workflowNodes.length} nodes • {connections.length} connections
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {draggedItem && (
                <div className="flex items-center gap-2 bg-primary-500/10 px-3 py-1 rounded-full">
                  <Eye size={12} className="text-primary-500" />
                  <span className="text-xs text-primary-500">Drop to add: {draggedItem.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <WorkflowCanvas
              ref={canvasRef}
              nodes={workflowNodes}
              connections={connections}
              onNodeMove={handleNodeMove}
              onNodeConnect={handleNodeConnect}
              onNodeDelete={handleNodeDelete}
              onNodeSelect={setSelectedNode}
              onDrop={handleDrop}
              draggedItem={draggedItem}
            />
          </div>

          {/* Canvas Footer */}
          <div className="h-10 bg-dark-800 border-t border-dark-700 flex items-center justify-between px-4">
            <div className="text-xs text-gray-500">
              {workflowNodes.length > 0 && (
                <span>Preview: {generateWorkflowInstruction().substring(0, 60)}...</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Zoom: 100%</span>
              <button className="p-1 hover:bg-dark-700 rounded">
                <Settings size={12} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Node Properties Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col"
            >
              <div className="p-4 border-b border-dark-700">
                <h3 className="font-semibold text-white">{selectedNode.title}</h3>
                <p className="text-sm text-gray-400">{selectedNode.description}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Parameters</label>
                    <div className="space-y-2">
                      {Object.entries(selectedNode.parameters || {}).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-400 mb-1">{key}</label>
                          <input
                            type="text"
                            value={typeof value === 'string' ? value : JSON.stringify(value)}
                            onChange={(e) => {
                              // Update node parameters
                              setWorkflowNodes(prev => prev.map(node =>
                                node.id === selectedNode.id
                                  ? { 
                                      ...node, 
                                      parameters: { 
                                        ...node.parameters, 
                                        [key]: e.target.value 
                                      }
                                    }
                                  : node
                              ));
                            }}
                            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DndProvider>
  );
};

export default DragDropWorkflow;