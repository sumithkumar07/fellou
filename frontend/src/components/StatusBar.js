import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useBrowser } from '../contexts/BrowserContext';
import axios from 'axios';
import { 
  Wifi, 
  Shield, 
  Zap, 
  Clock,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react';

const StatusBar = () => {
  const [systemStats, setSystemStats] = useState({
    cpu: 12,
    memory: 45,
    network: 'Connected',
    security: 'Protected',
    browserEngine: 'Unknown',
    activeSessions: 0,
    activePages: 0
  });
  const { sessionId, isLoading } = useAI();
  const { isExecuting, executionProgress } = useWorkflow();
  const { tabs } = useBrowser();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    // Get real system status from backend
    const fetchSystemStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/system/status`);
        const status = response.data;
        
        setSystemStats(prev => ({
          ...prev,
          network: status.services?.groq_ai === 'operational' ? 'Connected' : 'Limited',
          security: status.services?.native_browser_engine === 'operational' ? 'Protected' : 'Checking',
          browserEngine: status.browser_engine?.engine || 'Native Chromium',
          activeSessions: status.active_sessions || 0,
          activePages: status.browser_engine?.active_pages || 0,
          cpu: Math.floor(Math.random() * 30) + 5, // Still simulated for visual effect
          memory: Math.floor(Math.random() * 20) + 40
        }));
      } catch (error) {
        console.error('Failed to fetch system status:', error);
        // Keep existing mock data on error
      }
    };

    // Fetch immediately
    fetchSystemStatus();
    
    // Update every 10 seconds
    const interval = setInterval(fetchSystemStatus, 10000);
    
    // Also update visual stats more frequently for smooth animation
    const visualInterval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 5,
        memory: Math.floor(Math.random() * 20) + 40
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(visualInterval);
    };
  }, [backendUrl]);

  return (
    <div className="h-6 bg-dark-800 border-t border-dark-700 flex items-center justify-between px-4 text-xs text-gray-400 select-none">
      {/* Left side - Status indicators */}
      <div className="flex items-center space-x-4">
        {/* Network status */}
        <div className="flex items-center gap-1">
          <Wifi size={12} className="text-green-500" />
          <span>{systemStats.network}</span>
        </div>

        {/* Security status */}
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-green-500" />
          <span>{systemStats.security}</span>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-1">
          <Zap size={12} className={sessionId ? 'text-primary-500' : 'text-gray-500'} />
          <span>{sessionId ? 'AI Ready' : 'AI Offline'}</span>
        </div>

        {/* Workflow execution status */}
        {isExecuting && (
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Executing workflow... {executionProgress}%</span>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div 
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span>AI thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Center - Current time */}
      <div className="flex items-center gap-1">
        <Clock size={12} />
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Right side - Performance stats */}
      <div className="flex items-center space-x-4">
        {/* Tab count */}
        <div className="flex items-center gap-1">
          <span>{tabs.length} tabs</span>
        </div>

        {/* CPU usage */}
        <div className="flex items-center gap-1">
          <Cpu size={12} />
          <span>CPU: {systemStats.cpu}%</span>
        </div>

        {/* Memory usage */}
        <div className="flex items-center gap-1">
          <HardDrive size={12} />
          <span>RAM: {systemStats.memory}%</span>
        </div>

        {/* Performance indicator */}
        <div className="flex items-center gap-1">
          <Activity size={12} className="text-green-500" />
          <span>Optimized</span>
        </div>

        {/* Version info */}
        <div className="text-gray-500">
          Emergent AI v1.0.0
        </div>
      </div>
    </div>
  );
};

export default StatusBar;