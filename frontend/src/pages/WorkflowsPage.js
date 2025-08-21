import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Search, Filter, Grid, List } from 'lucide-react';
import { WorkflowCardSkeleton } from '../components/LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [filter, setFilter] = useState('all'); // all | active | templates
  const { announceToScreenReader } = useFocusManagement();

  useEffect(() => {
    // Simulate loading workflows
    const timer = setTimeout(() => {
      setWorkflows([
        {
          id: 1,
          name: 'Lead Generation from LinkedIn',
          description: 'Automatically collect leads from LinkedIn profiles',
          status: 'active',
          executions: 45,
          lastRun: '2 hours ago',
          type: 'template'
        },
        {
          id: 2,
          name: 'Social Media Content Research',
          description: 'Research trending topics across multiple platforms',
          status: 'draft',
          executions: 12,
          lastRun: '1 day ago',
          type: 'custom'
        },
        {
          id: 3,
          name: 'Email Campaign Data Collection',
          description: 'Gather email engagement metrics from multiple sources',
          status: 'active',
          executions: 78,
          lastRun: '30 minutes ago',
          type: 'template'
        }
      ]);
      setLoading(false);
      announceToScreenReader('Workflows loaded successfully');
    }, 1500);

    return () => clearTimeout(timer);
  }, [announceToScreenReader]);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && workflow.status === 'active') ||
                         (filter === 'templates' && workflow.type === 'template');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-dark-900 p-6 overflow-y-auto" role="main" aria-label="Workflows page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" id="page-title">
          Workflows
        </h1>
        <p className="text-gray-400" aria-describedby="page-title">
          Create, manage, and execute your automated workflows
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
              className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:bg-dark-750 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              tabIndex={0}
              role="button"
              aria-label={`Workflow: ${workflow.name}`}
            >
              {/* Workflow Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  workflow.status === 'active' 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {workflow.status}
                </span>
              </div>

              {/* Workflow Info */}
              <h3 className="font-semibold text-white mb-2">{workflow.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{workflow.description}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{workflow.executions} runs</span>
                <span>Last: {workflow.lastRun}</span>
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
          <p className="text-gray-500">Create your first workflow to get started</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;