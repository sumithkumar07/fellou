import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAI } from '../../contexts/AIContext';
import TaskCard from './TaskCard';
import LiveProgress from './LiveProgress';
import ShadowWorkspaceStatus from './ShadowWorkspaceStatus';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Square,
  Plus,
  Filter,
  MoreVertical
} from 'lucide-react';

const TaskExecutionPanel = ({ width = 320 }) => {
  const { workflows, activeWorkflow, isExecuting, executionProgress, createWorkflow } = useWorkflow();
  const { sendMessage } = useAI();
  const [filter, setFilter] = useState('all'); // all, running, completed, failed
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  // Mock active tasks - in real implementation, these come from workflow context
  const [activeTasks, setActiveTasks] = useState([
    {
      id: 'task-1',
      title: 'Search for recent Langchain discussions on Twitter',
      description: 'Finding and analyzing recent posts about Langchain framework',
      status: 'running',
      progress: 75,
      agent: 'Research Agent',
      startTime: new Date(Date.now() - 1000 * 60 * 5),
      estimatedTime: '2m remaining',
      steps: [
        { name: 'Twitter API Connection', status: 'completed', duration: '12s' },
        { name: 'Search Query Execution', status: 'completed', duration: '8s' },
        { name: 'Content Analysis', status: 'running', duration: '45s...' },
        { name: 'Report Generation', status: 'pending', duration: 'N/A' }
      ],
      shadowWorkspace: true,
      results: { posts: 45, mentions: 12, sentiment: 'positive' }
    },
    {
      id: 'task-2',
      title: 'Search for recent Langchain discussions on LinkedIn',
      description: 'Professional network analysis for Langchain discussions',
      status: 'completed',
      progress: 100,
      agent: 'LinkedIn Agent',
      startTime: new Date(Date.now() - 1000 * 60 * 10),
      completedTime: new Date(Date.now() - 1000 * 60 * 2),
      steps: [
        { name: 'LinkedIn Connection', status: 'completed', duration: '5s' },
        { name: 'Profile Search', status: 'completed', duration: '15s' },
        { name: 'Content Extraction', status: 'completed', duration: '22s' },
        { name: 'Summary Generation', status: 'completed', duration: '8s' }
      ],
      shadowWorkspace: false,
      results: { profiles: 28, posts: 67, connections: 15 }
    },
    {
      id: 'task-3',
      title: 'Search for official Langchain account on Twitter',
      description: 'Finding and monitoring official Langchain social presence',
      status: 'queued',
      progress: 0,
      agent: 'Social Agent',
      startTime: null,
      estimatedTime: '3m estimated',
      steps: [
        { name: 'Account Verification', status: 'pending', duration: 'N/A' },
        { name: 'Content Scraping', status: 'pending', duration: 'N/A' },
        { name: 'Follower Analysis', status: 'pending', duration: 'N/A' },
        { name: 'Report Compilation', status: 'pending', duration: 'N/A' }
      ],
      shadowWorkspace: true
    }
  ]);

  const filteredTasks = activeTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleTaskAction = (taskId, action) => {
    setActiveTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: action === 'play' ? 'running' : action === 'pause' ? 'paused' : 'stopped' }
        : task
    ));
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-primary-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'paused': return 'text-yellow-500';
      case 'queued': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'failed': return <AlertCircle size={16} className="text-red-500" />;
      case 'paused': return <Pause size={16} className="text-yellow-500" />;
      case 'queued': return <Clock size={16} className="text-gray-400" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-800 border-l border-dark-700" style={{ width }}>
      {/* Panel Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Live Tasks</h2>
              <p className="text-xs text-gray-400">Agent execution monitor</p>
            </div>
          </div>
          <button className="p-2 hover:bg-dark-700 rounded-lg">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Task Filters */}
        <div className="flex gap-1">
          {['all', 'running', 'completed', 'queued'].map((filterType) => (
            <motion.button
              key={filterType}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                filter === filterType
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
              onClick={() => setFilter(filterType)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Shadow Workspace Status */}
      <ShadowWorkspaceStatus tasks={activeTasks.filter(t => t.shadowWorkspace && t.status === 'running')} />

      {/* Active Tasks List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <TaskCard
                  task={task}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpansion={() => toggleTaskExpansion(task.id)}
                  onAction={(action) => handleTaskAction(task.id, action)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">No {filter === 'all' ? '' : filter} tasks</p>
              <p className="text-sm">Tasks will appear here when workflows are running</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Progress Summary */}
      <LiveProgress tasks={activeTasks} />

      {/* Quick Actions */}
      <div className="p-4 border-t border-dark-700">
        <motion.button
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          onClick={() => sendMessage('Create a new workflow for me')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          New Workflow
        </motion.button>
      </div>
    </div>
  );
};

export default TaskExecutionPanel;