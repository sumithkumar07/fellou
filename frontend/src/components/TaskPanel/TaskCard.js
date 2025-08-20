import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  User, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const TaskCard = ({ task, isExpanded, onToggleExpansion, onAction }) => {
  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      running: { color: 'bg-primary-500/10 text-primary-500 border-primary-500/30', label: 'Running' },
      completed: { color: 'bg-green-500/10 text-green-500 border-green-500/30', label: 'Completed' },
      failed: { color: 'bg-red-500/10 text-red-500 border-red-500/30', label: 'Failed' },
      paused: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', label: 'Paused' },
      queued: { color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: 'Queued' }
    };

    const badge = badges[status] || badges.queued;
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-green-500" />;
      case 'running': return <Loader size={14} className="text-primary-500 animate-spin" />;
      case 'failed': return <AlertCircle size={14} className="text-red-500" />;
      default: return <div className="w-3.5 h-3.5 border border-gray-500 rounded-full" />;
    }
  };

  const formatDuration = (duration) => {
    if (typeof duration === 'string') return duration;
    return `${Math.floor(duration / 1000)}s`;
  };

  return (
    <motion.div
      className="bg-dark-700 border border-dark-600 rounded-lg overflow-hidden hover:border-dark-500 transition-all"
      whileHover={{ scale: 1.01 }}
    >
      {/* Task Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white text-sm truncate">{task.title}</h3>
              {task.shadowWorkspace && (
                <div className="flex items-center gap-1 bg-primary-500/10 px-2 py-0.5 rounded-full">
                  <Eye size={10} className="text-primary-500" />
                  <span className="text-xs text-primary-500">Shadow</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-2">{task.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{task.agent}</span>
              </div>
              {task.startTime && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3">
            {getStatusBadge(task.status)}
            <button
              onClick={onToggleExpansion}
              className="p-1 hover:bg-dark-600 rounded transition-colors"
            >
              {isExpanded ? 
                <ChevronDown size={14} className="text-gray-400" /> : 
                <ChevronRight size={14} className="text-gray-400" />
              }
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {task.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-300">{task.progress}%</span>
            </div>
            <div className="w-full bg-dark-600 rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${getProgressColor(task.progress)} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Task Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.status === 'running' ? (
              <motion.button
                className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded"
                onClick={() => onAction('pause')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Pause size={12} />
              </motion.button>
            ) : (
              <motion.button
                className="p-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-500 rounded"
                onClick={() => onAction('play')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={12} />
              </motion.button>
            )}
            
            <motion.button
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded"
              onClick={() => onAction('stop')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Square size={12} />
            </motion.button>
          </div>

          <div className="text-xs text-gray-400">
            {task.estimatedTime || (task.completedTime ? 'Completed' : 'Waiting...')}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-dark-600"
          >
            <div className="p-4">
              {/* Task Steps */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-300 mb-3">Execution Steps</h4>
                <div className="space-y-2">
                  {task.steps?.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs">
                      {getStepIcon(step.status)}
                      <span className={`flex-1 ${step.status === 'completed' ? 'text-gray-400' : 'text-white'}`}>
                        {step.name}
                      </span>
                      <span className="text-gray-500">
                        {formatDuration(step.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Preview */}
              {task.results && (
                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Results</h4>
                  <div className="bg-dark-800 rounded p-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {Object.entries(task.results).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{key}:</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;