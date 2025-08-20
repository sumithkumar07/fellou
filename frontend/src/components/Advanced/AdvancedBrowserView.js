import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Grid3x3,
  Eye,
  EyeOff,
  PanelLeftOpen,
  PanelLeftClose,
  Layers,
  Settings,
  Zap
} from 'lucide-react';

const AdvancedBrowserView = ({ children, currentUrl, onUrlChange }) => {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [splitMode, setSplitMode] = useState('single'); // single, vertical, horizontal, grid
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const viewportSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };
  
  const currentSize = viewportSizes[viewMode];
  
  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Advanced Toolbar */}
      <div className="h-12 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
        {/* Left side - View controls */}
        <div className="flex items-center gap-2">
          {/* Viewport selector */}
          <div className="flex bg-dark-700 rounded-lg p-1">
            {[
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'tablet', icon: Tablet, label: 'Tablet' },
              { id: 'mobile', icon: Smartphone, label: 'Mobile' }
            ].map((view) => (
              <motion.button
                key={view.id}
                className={`p-2 rounded flex items-center gap-1 text-xs transition-colors ${
                  viewMode === view.id 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setViewMode(view.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <view.icon size={14} />
                <span className="hidden sm:inline">{view.label}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Split view controls */}
          <div className="flex bg-dark-700 rounded-lg p-1 ml-2">
            {[
              { id: 'single', icon: Monitor, label: 'Single' },
              { id: 'vertical', icon: PanelLeftOpen, label: 'Split V' },
              { id: 'horizontal', icon: Layers, label: 'Split H' },
              { id: 'grid', icon: Grid3x3, label: 'Grid' }
            ].map((split) => (
              <motion.button
                key={split.id}
                className={`p-2 rounded text-xs transition-colors ${
                  splitMode === split.id 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setSplitMode(split.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <split.icon size={14} />
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Center - URL/Status */}
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-300 truncate">{currentUrl || 'about:blank'}</span>
          </div>
        </div>
        
        {/* Right side - Tools */}
        <div className="flex items-center gap-2">
          <motion.button
            className={`p-2 rounded-lg text-gray-400 hover:text-white transition-colors ${
              showDevTools ? 'bg-primary-500 text-white' : ''
            }`}
            onClick={() => setShowDevTools(!showDevTools)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={16} />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsFullscreen(!isFullscreen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </motion.button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Browser content with responsive viewport */}
        <div className="flex-1 flex items-center justify-center bg-dark-900 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            animate={{
              width: currentSize.width,
              height: currentSize.height
            }}
            transition={{ duration: 0.3 }}
          >
            {splitMode === 'single' && (
              <div className="w-full h-full">
                {children}
              </div>
            )}
            
            {splitMode === 'vertical' && (
              <div className="flex h-full">
                <div className="flex-1 border-r">
                  {children}
                </div>
                <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-500">
                  Split View 2
                </div>
              </div>
            )}
            
            {splitMode === 'horizontal' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 border-b">
                  {children}
                </div>
                <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-500">
                  Split View 2
                </div>
              </div>
            )}
            
            {splitMode === 'grid' && (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-gray-300">
                <div className="bg-white">
                  {children}
                </div>
                <div className="bg-gray-100 flex items-center justify-center text-gray-500">
                  View 2
                </div>
                <div className="bg-gray-100 flex items-center justify-center text-gray-500">
                  View 3
                </div>
                <div className="bg-gray-100 flex items-center justify-center text-gray-500">
                  View 4
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Developer tools panel */}
        <AnimatePresence>
          {showDevTools && (
            <motion.div
              className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-dark-700">
                <h3 className="font-medium text-white">Developer Tools</h3>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                {/* Performance metrics */}
                <div className="bg-dark-900 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-white mb-2">Performance</h4>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Load Time:</span>
                      <span className="text-green-400">1.2s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOM Ready:</span>
                      <span className="text-green-400">0.8s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Paint:</span>
                      <span className="text-yellow-400">0.6s</span>
                    </div>
                  </div>
                </div>
                
                {/* Console logs */}
                <div className="bg-dark-900 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-white mb-2">Console</h4>
                  <div className="h-32 overflow-y-auto text-xs font-mono">
                    <div className="text-blue-400">[INFO] Page loaded successfully</div>
                    <div className="text-green-400">[LOG] Fellou AI initialized</div>
                    <div className="text-yellow-400">[WARN] Feature in beta</div>
                  </div>
                </div>
                
                {/* Network requests */}
                <div className="bg-dark-900 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-white mb-2">Network</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>api/chat</span>
                      <span className="text-green-400">200</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>ws/connect</span>
                      <span className="text-blue-400">WS</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Status bar */}
      <div className="h-8 bg-dark-800 border-t border-dark-700 flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>Viewport: {viewMode}</span>
          {viewMode !== 'desktop' && (
            <>
              <span>•</span>
              <span>{currentSize.width} × {currentSize.height}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedBrowserView;