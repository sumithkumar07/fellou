import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Search, Grid, List, Edit, Copy, Trash2 } from 'lucide-react';
import { WorkflowCardSkeleton } from '../components/LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';

// Lazy load the WorkflowBuilder
const WorkflowBuilder = React.lazy(() => import('../components/WorkflowBuilder/WorkflowBuilder'));

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [filter, setFilter] = useState('all'); // all | active | templates | drafts
  const [currentView, setCurrentView] = useState('list'); // list | builder
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const { announceToScreenReader } = useFocusManagement();

  useEffect(() => {
    // Simulate loading workflows
    const timer = setTimeout(() => {
      setWorkflows([
        {
          id: 1,
          name: 'LinkedIn Lead Generation',
          description: 'Automatically collect leads from LinkedIn profiles based on target criteria',
          status: 'active',
          executions: 45,
          lastRun: '2 hours ago',
          type: 'custom',
          nodes: 4,
          connections: 3,
          createdAt: '2025-08-20T10:00:00Z'
        },
        {
          id: 2,
          name: 'Social Media Content Research',
          description: 'Research trending topics and competitor content across multiple platforms',
          status: 'draft',
          executions: 12,
          lastRun: '1 day ago',
          type: 'custom',
          nodes: 6,
          connections: 5,
          createdAt: '2025-08-19T14:30:00Z'
        },
        {
          id: 3,
          name: 'Email Campaign Automation',
          description: 'Automated email campaigns with lead scoring and personalization',
          status: 'active',
          executions: 78,
          lastRun: '30 minutes ago',
          type: 'template',
          nodes: 8,
          connections: 7,
          createdAt: '2025-08-18T09:15:00Z'
        },
        {
          id: 4,
          name: 'Market Research Assistant',
          description: 'Weekly market analysis with competitor tracking and trend reports',
          status: 'active',
          executions: 23,
          lastRun: '3 hours ago',
          type: 'template',
          nodes: 7,
          connections: 6,
          createdAt: '2025-08-17T16:45:00Z'
        },
        {
          id: 5,
          name: 'Social Media Scheduler',
          description: 'Cross-platform social media posting with optimal timing',
          status: 'active',
          executions: 156,
          lastRun: '15 minutes ago',
          type: 'template',
          nodes: 5,
          connections: 4,
          createdAt: '2025-08-16T11:20:00Z'
        }
      ]);
      setLoading(false);
      announceToScreenReader('Workflows loaded successfully');
    }, 1500);

    return () => clearTimeout(timer);
  }, [announceToScreenReader]);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && workflow.status === 'active') ||
                         (filter === 'templates' && workflow.type === 'template') ||
                         (filter === 'drafts' && workflow.status === 'draft');
    return matchesSearch && matchesFilter;
  });

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setCurrentView('builder');
    announceToScreenReader('Opening workflow builder');
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setCurrentView('builder');
    announceToScreenReader(`Editing workflow: ${workflow.name}`);
  };

  const handleSaveWorkflow = (workflowData) => {
    if (selectedWorkflow) {
      // Update existing workflow
      setWorkflows(prev => prev.map(w => 
        w.id === selectedWorkflow.id 
          ? { ...w, ...workflowData, updatedAt: new Date().toISOString() }
          : w
      ));
    } else {
      // Create new workflow
      const newWorkflow = {
        ...workflowData,
        id: Date.now(),
        status: 'draft',
        executions: 0,
        lastRun: 'Never',
        type: 'custom',
        createdAt: new Date().toISOString()
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
    }
    announceToScreenReader('Workflow saved successfully');
  };

  const handleExecuteWorkflow = (workflowData, executionResults) => {
    // Update workflow execution stats
    if (selectedWorkflow) {
      setWorkflows(prev => prev.map(w => 
        w.id === selectedWorkflow.id 
          ? { ...w, executions: w.executions + 1, lastRun: 'Just now', status: 'active' }
          : w
      ));
    }
    announceToScreenReader('Workflow executed successfully');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedWorkflow(null);
    announceToScreenReader('Returned to workflow list');
  };

  const handleDuplicateWorkflow = (workflow) => {
    const duplicatedWorkflow = {
      ...workflow,
      id: Date.now(),
      name: `${workflow.name} (Copy)`,
      status: 'draft',
      executions: 0,
      lastRun: 'Never',
      createdAt: new Date().toISOString()
    };
    setWorkflows(prev => [duplicatedWorkflow, ...prev]);
    announceToScreenReader(`Workflow "${workflow.name}" duplicated`);
  };

  const handleDeleteWorkflow = (workflowId) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    announceToScreenReader('Workflow deleted');
  };

  // If in builder view, show the workflow builder
  if (currentView === 'builder') {
    return (
      <Suspense fallback={
        <div className="h-full flex items-center justify-center bg-dark-900">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading Workflow Builder...</p>
          </div>
        </div>
      }>
        <WorkflowBuilder
          initialWorkflow={selectedWorkflow}
          onSave={handleSaveWorkflow}
          onBack={handleBackToList}
          onExecute={handleExecuteWorkflow}
        />
      </Suspense>
    );
  }

  // Default list view
  return (
    <div className="h-full bg-dark-900 p-6 overflow-y-auto" role="main" aria-label="Workflows page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" id="page-title">
          Workflows
        </h1>
        <p className="text-gray-400" aria-describedby="page-title">
          Create, manage, and execute your automated workflows with visual drag-and-drop builder
        </p>
      </div>

      {/* Controls */}
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

      {/* Content */}
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
                  workflow.status === 'active' 
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
              </div>

              {/* Workflow Info */}
              <h3 className="font-semibold text-white mb-2">{workflow.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{workflow.description}</p>

              {/* Workflow Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{workflow.nodes} nodes • {workflow.connections} connections</span>
                <span>{workflow.executions} runs</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last: {workflow.lastRun}</span>
                <motion.button
                  onClick={() => handleEditWorkflow(workflow)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit size={14} />
                  Edit
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Zap size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first workflow to get started'}
          </p>
          <motion.button
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            Create Your First Workflow
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;