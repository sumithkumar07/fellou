import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const ShadowWorkspaceStatus = ({ tasks }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeTasks = tasks.filter(task => task.status === 'running');
  
  const systemMetrics = {
    cpu: 23,
    memory: 41,
    network: 'Active',
    agents: activeTasks.length
  };

  if (activeTasks.length === 0) {
    return (
      <div className="p-4 border-b border-dark-700">
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400">
            <EyeOff size={16} />
            <span className="text-sm">Shadow Workspace Idle</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-dark-700">
      <motion.div
        className="p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Eye size={16} className="text-primary-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-medium text-primary-500">
                  Shadow Workspace Active
                </div>
                <div className="text-xs text-gray-400">
                  {activeTasks.length} agents executing in background
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-primary-500/20 px-2 py-1 rounded-full">
                <Zap size={10} className="text-primary-500" />
                <span className="text-xs text-primary-500">Live</span>
              </div>
              {isExpanded ? 
                <ChevronDown size={14} className="text-gray-400" /> : 
                <ChevronRight size={14} className="text-gray-400" />
              }
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-primary-500/30"
              >
                <div className="p-3">
                  {/* System Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-dark-800/50 rounded p-2">
                      <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-blue-400" />
                        <div>
                          <div className="text-xs text-gray-400">CPU</div>
                          <div className="text-sm font-medium text-white">{systemMetrics.cpu}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-800/50 rounded p-2">
                      <div className="flex items-center gap-2">
                        <HardDrive size={12} className="text-green-400" />
                        <div>
                          <div className="text-xs text-gray-400">Memory</div>
                          <div className="text-sm font-medium text-white">{systemMetrics.memory}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Agents */}
                  <div>
                    <div className="text-xs font-medium text-gray-300 mb-2">Active Agents</div>
                    <div className="space-y-2">
                      {activeTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between bg-dark-800/50 rounded p-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-300 truncate">
                              {task.agent}
                            </span>
                          </div>
                          <div className="text-xs text-primary-400">
                            {task.progress}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="mt-3 pt-2 border-t border-primary-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Wifi size={12} className="text-green-400" />
                        <span className="text-gray-400">Network</span>
                      </div>
                      <span className="text-green-400">{systemMetrics.network}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ShadowWorkspaceStatus;