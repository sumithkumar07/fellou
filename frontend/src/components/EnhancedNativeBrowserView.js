import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const EnhancedNativeBrowserView = ({ tab, onInteraction }) => {
  const [screenshot, setScreenshot] = useState(tab?.screenshot || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interactionMode, setInteractionMode] = useState('click'); // 'click', 'type', 'scroll'
  const [showInteractionHelp, setShowInteractionHelp] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const containerRef = useRef(null);
  const inputBufferRef = useRef('');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Enhanced screenshot refresh with better error handling
  useEffect(() => {
    if (tab?.tabId && tab?.nativeBrowser) {
      refreshScreenshot();
      setIsConnected(true);
      
      // Smarter refresh strategy - faster when actively interacting
      const refreshInterval = lastInteraction && (Date.now() - lastInteraction < 10000) ? 1000 : 3000;
      const interval = setInterval(refreshScreenshot, refreshInterval);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
    }
  }, [tab?.tabId, lastInteraction]);

  // Enhanced screenshot refresh with retry logic
  const refreshScreenshot = useCallback(async (retryCount = 0) => {
    if (!tab?.tabId || retryCount > 3) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/native-browser/screenshot/${tab.tabId}`, {
        timeout: 10000
      });
      
      if (response.data.success) {
        setScreenshot(response.data.screenshot);
        setError(null);
        setIsConnected(true);
      } else {
        throw new Error(response.data.error || 'Screenshot failed');
      }
    } catch (err) {
      console.error(`❌ Failed to refresh screenshot (attempt ${retryCount + 1}):`, err);
      
      if (retryCount < 3) {
        // Retry with exponential backoff
        setTimeout(() => refreshScreenshot(retryCount + 1), Math.pow(2, retryCount) * 1000);
      } else {
        setError('Failed to update browser view - connection lost');
        setIsConnected(false);
      }
    }
  }, [tab?.tabId, backendUrl]);

  // Enhanced interaction handler with better feedback
  const handleInteraction = useCallback(async (action, data) => {
    if (!tab?.tabId) return;
    
    setIsLoading(true);
    setLastInteraction(Date.now());
    
    try {
      const response = await axios.post(`${backendUrl}/api/native-browser/interact`, {
        tab_id: tab.tabId,
        action,
        ...data
      }, { timeout: 15000 });
      
      if (response.data.success) {
        // Update screenshot with fresh content
        if (response.data.screenshot) {
          setScreenshot(response.data.screenshot);
        }
        
        onInteraction?.(action, response.data);
        setError(null);
        setIsConnected(true);
        
        // Show success feedback briefly
        const successIndicator = document.createElement('div');
        successIndicator.textContent = '✅ Interaction successful';
        successIndicator.className = 'fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm z-50 animate-pulse';
        document.body.appendChild(successIndicator);
        setTimeout(() => document.body.removeChild(successIndicator), 2000);
        
      } else {
        throw new Error(response.data.error || 'Interaction failed');
      }
    } catch (err) {
      console.error('❌ Browser interaction error:', err);
      setError(`Interaction failed: ${err.message}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [tab?.tabId, backendUrl, onInteraction]);

  // Enhanced click handler with visual feedback
  const handleClick = useCallback((event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Visual click feedback
    const clickIndicator = document.createElement('div');
    clickIndicator.className = 'absolute w-6 h-6 bg-blue-500/50 rounded-full pointer-events-none animate-ping z-50';
    clickIndicator.style.left = `${x - 12}px`;
    clickIndicator.style.top = `${y - 12}px`;
    containerRef.current?.appendChild(clickIndicator);
    setTimeout(() => clickIndicator.remove(), 1000);
    
    console.log(`🖱️ Native Browser click at: ${x}, ${y}`);
    handleInteraction('click', { x, y });
  }, [handleInteraction]);

  // Enhanced scroll handler with momentum
  const handleScroll = useCallback((event) => {
    event.preventDefault();
    const deltaY = event.deltaY;
    console.log(`📜 Native Browser scroll: ${deltaY}`);
    handleInteraction('scroll', { delta_y: deltaY });
  }, [handleInteraction]);

  // Enhanced keyboard handler with input buffering
  const handleKeyPress = useCallback((event) => {
    console.log(`⌨️ Key pressed: ${event.key}`);
    
    if (event.key === 'Enter') {
      // Send buffered input if any, then newline
      if (inputBufferRef.current) {
        handleInteraction('type', { text: inputBufferRef.current + '\n' });
        inputBufferRef.current = '';
      } else {
        handleInteraction('type', { text: '\n' });
      }
    } else if (event.key === 'Backspace') {
      if (inputBufferRef.current.length > 0) {
        inputBufferRef.current = inputBufferRef.current.slice(0, -1);
      } else {
        handleInteraction('type', { text: '\b' });
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      handleInteraction('type', { text: '\t' });
    } else if (event.key.length === 1) {
      // Buffer single characters for efficiency
      inputBufferRef.current += event.key;
      
      // Send buffer after a short delay or when it reaches a certain length
      setTimeout(() => {
        if (inputBufferRef.current) {
          handleInteraction('type', { text: inputBufferRef.current });
          inputBufferRef.current = '';
        }
      }, 300);
    }
  }, [handleInteraction]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log(`🖱️ Right-click at: ${x}, ${y}`);
    
    // Show custom context menu for browser actions
    setShowInteractionHelp(true);
    setTimeout(() => setShowInteractionHelp(false), 3000);
  }, []);

  // Enhanced navigation handler
  const handleNavigation = useCallback(async (url) => {
    console.log(`🌐 Navigating to: ${url}`);
    await handleInteraction('navigate', { url });
  }, [handleInteraction]);

  if (!tab?.nativeBrowser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <div className="text-lg mb-2">Native Browser Engine not active</div>
          <div className="text-sm">Switch to a website tab to use Native Browser</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-hidden relative">
      {/* Enhanced Status Bar */}
      <motion.div 
        className={`absolute top-2 left-4 z-10 px-3 py-1 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2 transition-colors ${
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
        animate={{ scale: isConnected ? 1 : [1, 1.1, 1] }}
        transition={{ duration: 0.5, repeat: isConnected ? 0 : Infinity }}
      >
        <span className={isConnected ? "animate-pulse" : "animate-bounce"}>
          {isConnected ? "🌐" : "⚠️"}
        </span>
        {isConnected ? "Native Browser Engine Active - Full Functionality" : "Connection Lost"}
        {isLoading && <span className="animate-spin">⚡</span>}
      </motion.div>
      
      {/* Enhanced Control Panel */}
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2">
        {/* Interaction Mode Selector */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          {['click', 'type', 'scroll'].map((mode) => (
            <button
              key={mode}
              onClick={() => setInteractionMode(mode)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                interactionMode === mode 
                  ? 'bg-blue-500 text-white' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {mode === 'click' ? '🖱️' : mode === 'type' ? '⌨️' : '📜'}
            </button>
          ))}
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={() => refreshScreenshot()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg transition-colors flex items-center gap-1"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '↻'} {isLoading ? 'Loading...' : 'Refresh'}
        </button>
        
        {/* Help Button */}
        <button
          onClick={() => setShowInteractionHelp(!showInteractionHelp)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-lg text-xs shadow-lg transition-colors"
        >
          ❓
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-4 right-4 z-10 bg-red-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg flex items-center justify-between"
          >
            <span>❌ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200 ml-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Help Overlay */}
      <AnimatePresence>
        {showInteractionHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 right-4 z-20 bg-black/90 text-white p-4 rounded-lg text-sm max-w-xs"
          >
            <h3 className="font-bold mb-2">🌐 Native Browser Controls</h3>
            <div className="space-y-1">
              <div>🖱️ <strong>Click:</strong> Interact with elements</div>
              <div>⌨️ <strong>Type:</strong> Input text in focused fields</div>
              <div>📜 <strong>Scroll:</strong> Navigate page content</div>
              <div>🖱️ <strong>Right-click:</strong> Show this help</div>
              <div>⌨️ <strong>Tab:</strong> Navigate between elements</div>
            </div>
            <div className="mt-2 text-xs text-gray-300">
              Real browser functionality - just like Chrome!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Browser View */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleClick}
        onWheel={handleScroll}
        onKeyDown={handleKeyPress}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {screenshot ? (
          <motion.img
            key={screenshot} // Force re-render on screenshot change
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={`data:image/png;base64,${screenshot}`}
            alt="Native Browser View"
            className="w-full h-full object-contain select-none"
            style={{ 
              imageRendering: 'crisp-edges',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🌐
              </motion.div>
              <div className="text-xl text-gray-600 mb-2">Native Browser Engine</div>
              <div className="text-gray-500">Loading website content...</div>
              {tab?.url && (
                <div className="text-sm text-blue-600 mt-2 font-mono">{tab.url}</div>
              )}
              <div className="mt-4 text-xs text-gray-400">
                Full browser functionality loading...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Browser Controls Overlay */}
      <motion.div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3 text-white text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span className={`flex items-center gap-1 ${interactionMode === 'click' ? 'text-blue-300' : ''}`}>
          🖱️ Click to interact
        </span>
        <span>•</span>
        <span className={`flex items-center gap-1 ${interactionMode === 'scroll' ? 'text-blue-300' : ''}`}>
          📜 Scroll to navigate
        </span>
        <span>•</span>
        <span className={`flex items-center gap-1 ${interactionMode === 'type' ? 'text-blue-300' : ''}`}>
          ⌨️ Type to input
        </span>
        <span>•</span>
        <span className="text-xs text-gray-300">
          Connected: {isConnected ? '✅' : '❌'}
        </span>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white/90 rounded-lg p-4 flex items-center gap-3 shadow-lg"
            >
              <motion.div 
                className="text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                🌐
              </motion.div>
              <div className="text-gray-700">Processing interaction...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status Indicator */}
      <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-bounce'
      }`} />
    </div>
  );
};

export default EnhancedNativeBrowserView;