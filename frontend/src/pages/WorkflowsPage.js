import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Search, Grid, List, Edit, Copy, Trash2, AlertCircle } from 'lucide-react';
import { WorkflowCardSkeleton } from '../components/LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';
import { useAI } from '../contexts/AIContext';
import axios from 'axios';

const WorkflowsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [filter, setFilter] = useState('all'); // all | active | templates | drafts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { announceToScreenReader } = useFocusManagement();
  const { workflows, sessionId, createWorkflow, executeWorkflow } = useAI();
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Phase 1: Backend Integration - Load real workflows from API
  const [apiWorkflows, setApiWorkflows] = useState([]);

  useEffect(() => {
    const loadWorkflows = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Call backend API instead of using mock data
        const response = await axios.get(`${backendUrl}/api/workflows/${sessionId}`);
        
        // Transform backend data to match UI expectations
        const transformedWorkflows = response.data.workflows.map(workflow => ({
          id: workflow.workflow_id,
          name: workflow.title,
          description: workflow.description,
          status: workflow.status === 'created' ? 'draft' : workflow.status,
          executions: workflow.total_executions || 0,
          lastRun: workflow.last_execution 
            ? new Date(workflow.last_execution).toLocaleString()
            : 'Never',
          type: workflow.required_platforms?.includes('template') ? 'template' : 'custom',
          nodes: workflow.steps ? workflow.steps.length : 0,
          connections: workflow.steps ? Math.max(0, workflow.steps.length - 1) : 0,
          createdAt: workflow.created_at,
          estimatedCredits: workflow.estimated_credits,
          estimatedTime: workflow.estimated_time_minutes
        }));
        
        setApiWorkflows(transformedWorkflows);
        announceToScreenReader(`${transformedWorkflows.length} workflows loaded successfully`);
        
      } catch (error) {
        console.error('Failed to load workflows:', error);
        setError('Failed to load workflows. Please try again.');
        announceToScreenReader('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, [sessionId, backendUrl, announceToScreenReader]);

  // Use API workflows instead of mock data
  const workflowsToDisplay = apiWorkflows;

  const filteredWorkflows = workflowsToDisplay.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && workflow.status === 'active') ||
                         (filter === 'templates' && workflow.type === 'template') ||
                         (filter === 'drafts' && workflow.status === 'draft');
    return matchesSearch && matchesFilter;
  });

  const handleCreateWorkflow = () => {
    // Integration with AI context for workflow creation
    announceToScreenReader('Use AI chat to create workflows');
  };

  const handleEditWorkflow = (workflow) => {
    announceToScreenReader(`Editing workflow: ${workflow.name}. Use AI chat to modify workflows.`);
  };

  const handleExecuteWorkflow = async (workflow) => {
    try {
      announceToScreenReader(`Executing workflow: ${workflow.name}`);
      await executeWorkflow(workflow.id);
      
      // Refresh workflows after execution
      setTimeout(() => {
        window.location.reload(); // Simple refresh - you can make this more elegant
      }, 1000);
      
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      announceToScreenReader('Failed to execute workflow');
    }
  };

  const handleDuplicateWorkflow = (workflow) => {
    announceToScreenReader(`To duplicate "${workflow.name}", use AI chat and say: "Create a copy of ${workflow.name} workflow"`);
  };

  const handleDeleteWorkflow = (workflowId) => {
    announceToScreenReader('Workflow deletion will be implemented in future updates');
  };

  return (
    <div className="h-full bg-dark-900 p-6 overflow-y-auto" role="main" aria-label="Workflows page">
      {/* Header with Status Indicator - Phase 2: Minimal status indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" id="page-title">
              Workflows
            </h1>
            <p className="text-gray-400" aria-describedby="page-title">
              Create, manage, and execute your automated workflows with visual drag-and-drop builder
            </p>
          </div>
          
          {/* Phase 2: System Status Indicator */}
          <div className="flex items-center gap-2">
            {sessionId ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                Connecting...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-red-400">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="ml-auto px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls - Unchanged UI */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search workflows"
          />
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter workflows"
        >
          <option value="all">All Workflows</option>
          <option value="active">Active</option>
          <option value="drafts">Drafts</option>
          <option value="templates">Templates</option>
        </select>

        {/* View Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List size={18} />
          </button>
        </div>

        {/* Create Workflow */}
        <motion.button
          onClick={handleCreateWorkflow}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Create new workflow"
        >
          <Plus size={18} />
          <span className="hidden sm:block">New Workflow</span>
        </motion.button>
      </div>

      {/* Content - Same beautiful UI, real data */}
      {loading ? (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {[...Array(6)].map((_, i) => (
            <WorkflowCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div 
          className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}
          role="region"
          aria-label="Workflow list"
        >
          {filteredWorkflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:bg-dark-750 transition-colors group"
              whileHover={{ scale: 1.02 }}
              tabIndex={0}
              role="article"
              aria-label={`Workflow: ${workflow.name}`}
            >
              {/* Workflow Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    onClick={() => handleEditWorkflow(workflow)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Edit workflow"
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDuplicateWorkflow(workflow)}
                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-dark-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Duplicate workflow"
                  >
                    <Copy size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Delete workflow"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Workflow Status & Type */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  workflow.status === 'active' || workflow.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {workflow.status}
                </span>
                {workflow.type === 'template' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                    Template
                  </span>
                )}
                {/* Phase 2: Show estimated credits */}
                {workflow.estimatedCredits && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    ~{workflow.estimatedCredits} credits
                  </span>
                )}
              </div>

              {/* Workflow Info */}
              <h3 className="font-semibold text-white mb-2">{workflow.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{workflow.description}</p>

              {/* Workflow Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{workflow.nodes} steps • {workflow.connections} connections</span>
                <span>{workflow.executions} runs</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last: {workflow.lastRun}</span>
                <motion.button
                  onClick={() => handleExecuteWorkflow(workflow)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap size={14} />
                  Execute
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredWorkflows.length === 0 && !error && (
        <div className="text-center py-12">
          <Zap size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Use AI chat to create your first workflow'}
          </p>
          <div className="text-sm text-gray-400 bg-dark-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="mb-2">Try saying in AI chat:</p>
            <p className="text-blue-400 italic">"Create a workflow for LinkedIn lead generation"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;