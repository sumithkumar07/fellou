import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrowserWindow from './BrowserWindow';
import { useBrowser } from '../../contexts/BrowserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { 
  Plus, 
  Maximize2, 
  Minimize2, 
  Grid3x3,
  Layout,
  Monitor
} from 'lucide-react';

const MultiWindowManager = ({ splitView, sidebarOpen }) => {
  const [windowLayout, setWindowLayout] = useState('grid-2x2'); // grid-2x2, grid-3x1, single
  const [windows, setWindows] = useState([
    { id: 'window-1', url: 'emergent://welcome', title: 'Welcome', active: true, position: { x: 0, y: 0 } },
    { id: 'window-2', url: 'about:blank', title: 'New Tab', active: false, position: { x: 1, y: 0 } },
    { id: 'window-3', url: 'about:blank', title: 'New Tab', active: false, position: { x: 0, y: 1 } },
    { id: 'window-4', url: 'about:blank', title: 'New Tab', active: false, position: { x: 1, y: 1 } }
  ]);
  
  const [draggedWindow, setDraggedWindow] = useState(null);
  const containerRef = useRef(null);
  const { activeWorkflow, isExecuting } = useWorkflow();

  const layouts = {
    'grid-2x2': { rows: 2, cols: 2, windows: 4 },
    'grid-3x1': { rows: 1, cols: 3, windows: 3 },
    'grid-1x3': { rows: 3, cols: 1, windows: 3 },
    'single': { rows: 1, cols: 1, windows: 1 }
  };

  const handleLayoutChange = useCallback((newLayout) => {
    setWindowLayout(newLayout);
    const layoutConfig = layouts[newLayout];
    
    // Adjust windows array to match new layout
    const newWindows = [];
    for (let i = 0; i < layoutConfig.windows; i++) {
      const row = Math.floor(i / layoutConfig.cols);
      const col = i % layoutConfig.cols;
      
      if (windows[i]) {
        newWindows.push({
          ...windows[i],
          position: { x: col, y: row }
        });
      } else {
        newWindows.push({
          id: `window-${i + 1}`,
          url: 'about:blank',
          title: 'New Tab',
          active: false,
          position: { x: col, y: row }
        });
      }
    }
    
    setWindows(newWindows);
  }, [windows]);

  const handleWindowNavigation = useCallback((windowId, url, title) => {
    setWindows(prev => prev.map(window => 
      window.id === windowId 
        ? { ...window, url, title }
        : window
    ));
  }, []);

  const handleWindowActivate = useCallback((windowId) => {
    setWindows(prev => prev.map(window => ({
      ...window,
      active: window.id === windowId
    })));
  }, []);

  const addNewWindow = useCallback(() => {
    const layoutConfig = layouts[windowLayout];
    if (windows.length < 6) { // Max 6 windows
      const newWindow = {
        id: `window-${Date.now()}`,
        url: 'emergent://new-tab',
        title: 'New Tab',
        active: true,
        position: { x: 0, y: layoutConfig.rows }
      };
      
      setWindows(prev => [...prev.map(w => ({ ...w, active: false })), newWindow]);
    }
  }, [windowLayout, windows.length]);

  const getWindowStyle = useCallback((window, index) => {
    const layoutConfig = layouts[windowLayout];
    const { rows, cols } = layoutConfig;
    
    const width = `${100 / cols}%`;
    const height = `${100 / rows}%`;
    const left = `${(window.position.x / cols) * 100}%`;
    const top = `${(window.position.y / rows) * 100}%`;
    
    return {
      position: 'absolute',
      width,
      height,
      left,
      top,
      border: window.active ? '2px solid #0ea5e9' : '2px solid #f97316', // Fellou orange borders
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#0f172a'
    };
  }, [windowLayout]);

  const activeWindow = windows.find(w => w.active) || windows[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-dark-900">
      {/* Multi-Window Controls - Fellou Style */}
      <div className="h-12 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleLayoutChange('grid-2x2')}
              className={`p-2 rounded-lg transition-colors ${
                windowLayout === 'grid-2x2' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-dark-700'
              }`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => handleLayoutChange('grid-3x1')}
              className={`p-2 rounded-lg transition-colors ${
                windowLayout === 'grid-3x1' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-dark-700'
              }`}
            >
              <Layout size={16} />
            </button>
            <button
              onClick={() => handleLayoutChange('single')}
              className={`p-2 rounded-lg transition-colors ${
                windowLayout === 'single' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-dark-700'
              }`}
            >
              <Monitor size={16} />
            </button>
          </div>
          
          <div className="h-6 w-px bg-dark-600 mx-2" />
          
          <button
            onClick={addNewWindow}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {windows.length} Windows • {windowLayout.replace('-', ' ').replace('grid', 'Grid')}
          </span>
          {isExecuting && (
            <div className="flex items-center gap-2 bg-primary-500/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-xs text-primary-500">Workflow Running</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Window Grid Container */}
      <div ref={containerRef} className="flex-1 relative">
        <AnimatePresence>
          {windows.map((window, index) => (
            <motion.div
              key={window.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={getWindowStyle(window, index)}
              onClick={() => handleWindowActivate(window.id)}
            >
              <BrowserWindow
                window={window}
                isActive={window.active}
                onNavigate={(url, title) => handleWindowNavigation(window.id, url, title)}
                onActivate={() => handleWindowActivate(window.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Shadow Workspace Indicator */}
      {activeWorkflow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-dark-800 border border-primary-500 rounded-lg p-3 shadow-xl"
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-primary-500">Shadow Workspace Active</span>
            <span className="text-gray-400">• Task running in background</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiWindowManager;