import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowSidebar from './WorkflowSidebar';
import WorkflowTemplates from './WorkflowTemplates';
import { ArrowLeft, Save, Play, Settings, Share, Download } from 'lucide-react';
import { useAI } from '../../contexts/AIContext';
import { useFocusManagement } from '../../hooks/useAccessibility';

const WorkflowBuilder = ({ initialWorkflow, onSave, onBack, onExecute }) => {
  const [workflow, setWorkflow] = useState(initialWorkflow || {
    id: null,
    name: 'Untitled Workflow',
    nodes: [],
    edges: [],
    description: '',
    createdAt: new Date().toISOString()
  });
  const [showTemplates, setShowTemplates] = useState(!initialWorkflow);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { sendMessage } = useAI();
  const { announceToScreenReader } = useFocusManagement();

  // Auto-save workflow changes
  useEffect(() => {
    if (workflow.nodes.length > 0) {
      const autoSave = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(autoSave);
    }
  }, [workflow]);

  const handleWorkflowUpdate = (updates) => {
    setWorkflow(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(workflow);
      announceToScreenReader('Workflow saved successfully');
    }
  };

  const handleExecute = async (workflowData) => {
    setIsExecuting(true);
    announceToScreenReader('Starting workflow execution');
    
    try {
      // Simulate workflow execution
      const executionId = Date.now().toString();
      setExecutionResults({
        id: executionId,
        status: 'running',
        startTime: new Date(),
        steps: []
      });

      // Send workflow to AI for processing
      const workflowDescription = generateWorkflowDescription(workflowData);
      await sendMessage(`Execute this workflow: ${workflowDescription}`);
      
      // Simulate step-by-step execution
      for (let i = 0; i < workflowData.nodes.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setExecutionResults(prev => ({
          ...prev,
          steps: [...prev.steps, {
            nodeId: workflowData.nodes[i].id,
            status: 'completed',
            timestamp: new Date(),
            result: `Step ${i + 1} completed successfully`
          }]
        }));
      }
      
      setExecutionResults(prev => ({
        ...prev,
        status: 'completed',
        endTime: new Date()
      }));
      
      announceToScreenReader('Workflow execution completed successfully');
      
      if (onExecute) {
        onExecute(workflowData, executionResults);
      }
      
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setExecutionResults(prev => ({
        ...prev,
        status: 'failed',
        error: error.message,
        endTime: new Date()
      }));
      announceToScreenReader('Workflow execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const generateWorkflowDescription = (workflowData) => {
    const steps = workflowData.nodes.map(node => `${node.data.label}: ${node.data.description}`);
    return `Workflow with ${steps.length} steps: ${steps.join(' -> ')}`;
  };

  const handleTemplateSelect = (template) => {
    setWorkflow(template);
    setShowTemplates(false);
    announceToScreenReader(`Template "${template.name}" loaded`);
  };

  const exportWorkflow = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    announceToScreenReader('Workflow exported successfully');
  };

  return (
    <div className="h-full bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Back to Workflows
          </motion.button>
          
          <div className="h-6 w-px bg-dark-700"></div>
          
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => handleWorkflowUpdate({ name: e.target.value })}
              className="text-xl font-semibold bg-transparent text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Workflow name..."
            />
            <p className="text-sm text-gray-400">
              {workflow.nodes.length} nodes • {workflow.edges.length} connections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Templates Button */}
          <motion.button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={16} />
            Templates
          </motion.button>

          {/* Export Button */}
          <motion.button
            onClick={exportWorkflow}
            disabled={workflow.nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            Export
          </motion.button>

          {/* Save Button */}
          <motion.button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={16} />
            Save
          </motion.button>

          {/* Execute Button */}
          <motion.button
            onClick={() => handleExecute(workflow)}
            disabled={workflow.nodes.length < 2 || isExecuting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={16} />
            {isExecuting ? 'Executing...' : 'Execute'}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workflow Sidebar */}
        <WorkflowSidebar />
        
        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            workflow={workflow}
            onWorkflowUpdate={handleWorkflowUpdate}
            onExecute={handleExecute}
            isExecuting={isExecuting}
          />
          
          {/* Execution Status Overlay */}
          {executionResults && (
            <div className="absolute top-4 right-4 bg-dark-800 border border-dark-700 rounded-lg p-4 min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Execution Status</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  executionResults.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  executionResults.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {executionResults.status}
                </span>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {executionResults.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">{step.result}</span>
                  </div>
                ))}
                
                {executionResults.status === 'running' && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Processing...</span>
                  </div>
                )}
              </div>
              
              {executionResults.status !== 'running' && (
                <button
                  onClick={() => setExecutionResults(null)}
                  className="mt-3 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <WorkflowTemplates
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowBuilder;