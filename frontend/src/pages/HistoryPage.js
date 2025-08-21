import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { announceToScreenReader } = useFocusManagement();

  useEffect(() => {
    // Simulate loading history
    const timer = setTimeout(() => {
      setHistoryItems([
        {
          id: 1,
          workflowName: 'Lead Generation from LinkedIn',
          status: 'completed',
          startTime: '2025-08-21T10:30:00Z',
          endTime: '2025-08-21T10:45:00Z',
          duration: '15 minutes',
          results: { leads: 25, success: true }
        },
        {
          id: 2,
          workflowName: 'Social Media Research',
          status: 'running',
          startTime: '2025-08-21T11:00:00Z',
          endTime: null,
          duration: '5 minutes so far',
          results: null
        },
        {
          id: 3,
          workflowName: 'Email Campaign Analysis',
          status: 'failed',
          startTime: '2025-08-21T09:15:00Z',
          endTime: '2025-08-21T09:17:00Z',
          duration: '2 minutes',
          results: { error: 'API rate limit exceeded' }
        },
        {
          id: 4,
          workflowName: 'Content Scraping',
          status: 'completed',
          startTime: '2025-08-21T08:45:00Z',
          endTime: '2025-08-21T09:10:00Z',
          duration: '25 minutes',
          results: { articles: 15, success: true }
        }
      ]);
      setLoading(false);
      announceToScreenReader('History loaded successfully');
    }, 1200);

    return () => clearTimeout(timer);
  }, [announceToScreenReader]);

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

  return (
    <div className="h-full bg-dark-900 p-6 overflow-y-auto" role="main" aria-label="History page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" id="page-title">
          Execution History
        </h1>
        <p className="text-gray-400" aria-describedby="page-title">
          Track and monitor your workflow executions
        </p>
      </div>

      {/* Controls */}
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

      {/* Content */}
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
                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
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
                    {item.results?.success && `${item.results.leads || item.results.articles || 0} items`}
                    {item.results?.error && <span className="text-red-400">{item.results.error}</span>}
                    {item.status === 'running' && <span className="text-blue-400">In progress...</span>}
                  </div>
                </div>
              </div>

              {/* Progress bar for running workflows */}
              {item.status === 'running' && (
                <div className="mt-4">
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No execution history</h3>
          <p className="text-gray-500">Your workflow executions will appear here</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;