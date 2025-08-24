import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NativeBrowserView = ({ tab, onInteraction }) => {
  const [screenshot, setScreenshot] = useState(tab?.screenshot || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Refresh screenshot periodically
  useEffect(() => {
    if (tab?.tabId && tab?.nativeBrowser) {
      refreshScreenshot();
      
      // Auto-refresh every 2 seconds for live updates
      const interval = setInterval(refreshScreenshot, 2000);
      return () => clearInterval(interval);
    }
  }, [tab?.tabId]);

  const refreshScreenshot = async () => {
    if (!tab?.tabId) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/native-browser/screenshot/${tab.tabId}`);
      if (response.data.success) {
        setScreenshot(response.data.screenshot);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Failed to refresh screenshot:', err);
      setError('Failed to update browser view');
    }
  };

  const handleInteraction = async (action, data) => {
    if (!tab?.tabId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/native-browser/interact`, {
        tab_id: tab.tabId,
        action,
        ...data
      });
      
      if (response.data.success) {
        // Update screenshot with fresh content
        if (response.data.screenshot) {
          setScreenshot(response.data.screenshot);
        }
        onInteraction?.(action, response.data);
        setError(null);
      } else {
        setError(response.data.error || 'Interaction failed');
      }
    } catch (err) {
      console.error('❌ Browser interaction error:', err);
      setError('Failed to interact with browser');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log(`🖱️ Native Browser click at: ${x}, ${y}`);
    handleInteraction('click', { x, y });
  };

  const handleScroll = (event) => {
    const deltaY = event.deltaY;
    handleInteraction('scroll', { delta_y: deltaY });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleInteraction('type', { text: '\n' });
    } else if (event.key.length === 1) {
      handleInteraction('type', { text: event.key });
    }
  };

  if (!tab?.nativeBrowser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">
          <div className="text-4xl mb-4">🌐</div>
          <div>Native Browser Engine not active</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-hidden relative">
      {/* Native Browser Engine Status Bar */}
      <div className="absolute top-2 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2">
        <span className="animate-pulse">🌐</span>
        Native Browser Engine Active - Full Functionality
        {isLoading && <span className="animate-spin">⚡</span>}
      </div>
      
      {/* Refresh Button */}
      <div className="absolute top-2 right-4 z-10">
        <button
          onClick={refreshScreenshot}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '↻'} Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-12 left-4 right-4 z-10 bg-red-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          ❌ {error}
        </div>
      )}

      {/* Interactive Browser View */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-pointer relative overflow-hidden"
        onClick={handleClick}
        onWheel={handleScroll}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {screenshot ? (
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Native Browser View"
            className="w-full h-full object-contain"
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
              <div className="text-6xl mb-4 animate-spin">🌐</div>
              <div className="text-xl text-gray-600 mb-2">Native Browser Engine</div>
              <div className="text-gray-500">Loading website content...</div>
              {tab?.url && (
                <div className="text-sm text-blue-600 mt-2">{tab.url}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Browser Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3 text-white text-sm">
        <span>🖱️ Click to interact</span>
        <span>•</span>
        <span>🎯 Scroll to navigate</span>
        <span>•</span>
        <span>⌨️ Type to input</span>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-20">
          <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <div className="animate-spin text-2xl">🌐</div>
            <div className="text-gray-700">Processing interaction...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeBrowserView;