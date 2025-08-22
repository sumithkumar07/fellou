import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, XCircle, Wifi, Database } from 'lucide-react';
import axios from 'axios';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    overall: 'checking', // 'healthy', 'warning', 'error', 'checking'
    services: {},
    capabilities: {},
    websocket: false,
    lastCheck: null
  });
  const [showDetails, setShowDetails] = useState(false);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Phase 2: System Status Monitoring
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check system status
        const statusResponse = await axios.get(`${backendUrl}/api/system/status`, {
          timeout: 5000
        });
        
        // Check capabilities
        const capabilitiesResponse = await axios.get(`${backendUrl}/api/system/capabilities`, {
          timeout: 5000
        });

        const systemData = statusResponse.data;
        const capabilitiesData = capabilitiesResponse.data;

        // Determine overall health
        let overallStatus = 'healthy';
        if (systemData.services.groq_ai === 'unavailable' || 
            systemData.services.native_browser_engine === 'initializing') {
          overallStatus = 'warning';
        }
        if (!systemData.browser_engine.initialized) {
          overallStatus = 'warning';
        }

        setStatus({
          overall: overallStatus,
          services: systemData.services,
          capabilities: capabilitiesData,
          browser_engine: systemData.browser_engine,
          version: systemData.version,
          lastCheck: new Date().toLocaleTimeString(),
          websocket: true // Will be updated by WebSocket connection
        });

      } catch (error) {
        console.error('System status check failed:', error);
        setStatus(prev => ({
          ...prev,
          overall: 'error',
          lastCheck: new Date().toLocaleTimeString()
        }));
      }
    };

    // Initial check
    checkSystemStatus();

    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-yellow-400" />;
      case 'error':
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <Activity size={14} className="text-gray-400 animate-pulse" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'warning':
        return 'Some Services Limited';
      case 'error':
        return 'System Issues Detected';
      default:
        return 'Checking Status...';
    }
  };

  return (
    <div className="relative">
      {/* Main Status Indicator */}
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm border transition-colors ${getStatusColor(status.overall)}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Click to view system details"
      >
        {getStatusIcon(status.overall)}
        <span className="hidden sm:block">{getStatusText(status.overall)}</span>
      </motion.button>

      {/* Detailed Status Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-dark-800/95 backdrop-blur-xl border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">System Status</h3>
                <span className="text-xs text-gray-400">
                  Last check: {status.lastCheck || 'Checking...'}
                </span>
              </div>
            </div>

            {/* Services Status */}
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Core Services</h4>
              
              {status.services && Object.entries(status.services).map(([service, serviceStatus]) => (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {service === 'native_browser_engine' && <Activity size={16} className="text-blue-400" />}
                    {service === 'groq_ai' && <Database size={16} className="text-purple-400" />}
                    {service === 'websocket_service' && <Wifi size={16} className="text-green-400" />}
                    {!['native_browser_engine', 'groq_ai', 'websocket_service'].includes(service) && (
                      <CheckCircle size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm text-white capitalize">
                      {service.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    serviceStatus === 'operational' 
                      ? 'bg-green-500/20 text-green-400'
                      : serviceStatus === 'initializing'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {serviceStatus}
                  </span>
                </div>
              ))}
            </div>

            {/* Browser Engine Details */}
            {status.browser_engine && (
              <div className="p-4 border-t border-dark-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Native Chromium Engine</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Status:</div>
                  <div className={`${status.browser_engine.initialized ? 'text-green-400' : 'text-yellow-400'}`}>
                    {status.browser_engine.initialized ? 'Initialized' : 'Initializing'}
                  </div>
                  <div className="text-gray-400">Active Contexts:</div>
                  <div className="text-white">{status.browser_engine.active_contexts || 0}</div>
                  <div className="text-gray-400">Active Pages:</div>
                  <div className="text-white">{status.browser_engine.active_pages || 0}</div>
                </div>
              </div>
            )}

            {/* Version Info */}
            {status.version && (
              <div className="p-4 border-t border-dark-700 bg-dark-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Version {status.version}</span>
                  <span className="text-xs text-gray-400">Fellou.ai Clone</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default SystemStatus;