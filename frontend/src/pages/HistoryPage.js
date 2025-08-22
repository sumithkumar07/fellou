import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Clock, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';
import { useAI } from '../contexts/AIContext';
import axios from 'axios';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { announceToScreenReader } = useFocusManagement();
  const { sessionId } = useAI();
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Phase 1: Backend Integration - Load real execution history
  useEffect(() => {
    const loadExecutionHistory = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Call backend API instead of using mock data
        const response = await axios.get(`${backendUrl}/api/history/${sessionId}`);
        
        // Transform backend data to match UI expectations
        const transformedHistory = response.data.history.map(execution => ({
          id: execution.execution_id,
          workflowName: execution.workflow_name,
          status: execution.status,
          startTime: execution.start_time,
          endTime: execution.end_time,
          duration: execution.duration_seconds 
            ? `${Math.floor(execution.duration_seconds / 60)} minutes`
            : calculateDuration(execution.start_time, execution.end_time),
          results: execution.execution_results || null,
          completedSteps: execution.completed_steps,
          totalSteps: execution.total_steps,
          errorMessage: execution.error_message
        }));
        
        setHistoryItems(transformedHistory);
        announceToScreenReader(`${transformedHistory.length} execution records loaded`);
        
      } catch (error) {
        console.error('Failed to load execution history:', error);
        setError('Failed to load execution history. Please try again.');
        announceToScreenReader('Failed to load execution history');
      } finally {
        setLoading(false);
      }
    };

    loadExecutionHistory();
  }, [sessionId, backendUrl, announceToScreenReader]);

  // Helper function to calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return 'Unknown';
    if (!endTime) {
      const now = new Date();
      const start = new Date(startTime);
      const diffMinutes = Math.floor((now - start) / 60000);
      return `${diffMinutes} minutes so far`;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.floor((end - start) / 60000);
    return `${diffMinutes} minutes`;
  };

  const filteredHistory = historyItems.filter(item => {
    const matchesSearch = item.workflowName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-400" />;
      case 'failed':
        return <XCircle size={18} className="text-red-400" />;
      case 'running':
        return <Play size={18} className="text-blue-400 animate-pulse" />;
      default:
        return <Clock size={18} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Phase 2: Real-time progress calculation
  const getProgressPercentage = (item) => {
    if (item.status === 'completed') return 100;
    if (item.status === 'failed') return 0;
    if (item.status === 'running' && item.totalSteps > 0) {
      return Math.floor((item.completedSteps / item.totalSteps) * 100);
    }
    return 60; // Default for running without step info
  };

  return (
    <div className="h-full bg-dark-900 p-6 overflow-y-auto" role="main" aria-label="History page">
      {/* Header with Status Indicator - Phase 2 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" id="page-title">
              Execution History
            </h1>
            <p className="text-gray-400" aria-describedby="page-title">
              Track and monitor your workflow executions
            </p>
          </div>
          
          {/* Phase 2: Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {sessionId ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Updates
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
            placeholder="Search execution history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search execution history"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Content - Same beautiful UI, real data */}
      {loading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-4" role="region" aria-label="Execution history list">
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:bg-dark-750 transition-colors"
              whileHover={{ scale: 1.01 }}
              tabIndex={0}
              role="article"
              aria-label={`Execution: ${item.workflowName}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <h3 className="font-semibold text-white">{item.workflowName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Phase 2: Step progress indicator */}
                  {item.totalSteps > 0 && (
                    <span className="text-xs text-gray-400 px-2 py-1 bg-dark-700 rounded">
                      {item.completedSteps}/{item.totalSteps} steps
                    </span>
                  )}
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Started:</span>
                  <div className="text-white">{formatTime(item.startTime)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <div className="text-white">{item.duration}</div>
                </div>
                <div>
                  <span className="text-gray-400">Results:</span>
                  <div className="text-white">
                    {item.status === 'completed' && 'Execution completed successfully'}
                    {item.status === 'failed' && (
                      <span className="text-red-400">{item.errorMessage || 'Execution failed'}</span>
                    )}
                    {item.status === 'running' && <span className="text-blue-400">In progress...</span>}
                  </div>
                </div>
              </div>

              {/* Phase 2: Enhanced progress bar for running workflows with real data */}
              {item.status === 'running' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(item)}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse" 
                      style={{ width: `${getProgressPercentage(item)}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && !error && (
        <div className="text-center py-12">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No execution history</h3>
          <p className="text-gray-500 mb-6">Your workflow executions will appear here</p>
          <div className="text-sm text-gray-400 bg-dark-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="mb-2">Execute workflows through:</p>
            <p className="text-blue-400 italic">• AI Chat: "Execute my lead generation workflow"</p>
            <p className="text-blue-400 italic">• Workflows page: Click Execute button</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;