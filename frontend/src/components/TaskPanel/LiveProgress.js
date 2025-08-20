import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const LiveProgress = ({ tasks }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    averageProgress: 0,
    estimatedTime: 0
  });

  useEffect(() => {
    const totalTasks = tasks.length;
    const runningTasks = tasks.filter(t => t.status === 'running').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progressSum = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const averageProgress = totalTasks > 0 ? Math.round(progressSum / totalTasks) : 0;
    
    // Estimate remaining time based on running tasks
    const runningTasksWithTime = tasks.filter(t => t.status === 'running' && t.estimatedTime);
    const estimatedTime = runningTasksWithTime.length > 0 
      ? Math.max(...runningTasksWithTime.map(t => {
          const match = t.estimatedTime.match(/(\d+)m/);
          return match ? parseInt(match[1]) : 2;
        }))
      : 0;

    setStats({
      totalTasks,
      runningTasks,
      completedTasks,
      averageProgress,
      estimatedTime
    });
  }, [tasks]);

  const getProgressColor = (progress) => {
    if (progress < 30) return 'from-red-500 to-orange-500';
    if (progress < 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-blue-500';
  };

  const metrics = [
    {
      label: 'Total',
      value: stats.totalTasks,
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      label: 'Running',
      value: stats.runningTasks,
      icon: Zap,
      color: 'text-primary-500'
    },
    {
      label: 'Done',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  if (stats.totalTasks === 0) return null;

  return (
    <div className="p-4 border-t border-dark-700 bg-dark-800/50">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-300">Overall Progress</span>
          <span className="text-xs text-gray-400">{stats.averageProgress}%</span>
        </div>
        
        <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 bg-gradient-to-r ${getProgressColor(stats.averageProgress)} transition-all duration-300`}
            initial={{ width: 0 }}
            animate={{ width: `${stats.averageProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-1">
              <metric.icon size={16} className={metric.color} />
            </div>
            <div className="text-sm font-medium text-white">{metric.value}</div>
            <div className="text-xs text-gray-400">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Time Estimate */}
      {stats.estimatedTime > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          <span>~{stats.estimatedTime}m remaining</span>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="mt-3 pt-3 border-t border-dark-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-gray-400">Performance</span>
          </div>
          <span className="text-green-400">Optimal</span>
        </div>
      </div>
    </div>
  );
};

export default LiveProgress;