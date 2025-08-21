import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrowser } from '../contexts/BrowserContext';
import { X, Plus, Globe } from 'lucide-react';

const TabBar = () => {
  const { tabs, activeTabId, switchToTab, closeTab, createNewTab } = useBrowser();

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center">
      {/* Tabs container */}
      <div className="flex-1 flex overflow-x-auto scrollbar-none">
        <AnimatePresence>
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={`tab ${tab.active ? 'active' : ''} group relative`}
              onClick={() => switchToTab(tab.id)}
            >
              {/* Tab content */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Favicon or loading indicator */}
                <div className="flex-shrink-0">
                  {tab.loading ? (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : tab.favicon ? (
                    <img src={tab.favicon} alt="" className="w-4 h-4" />
                  ) : (
                    <Globe size={14} className="text-gray-400" />
                  )}
                </div>
                
                {/* Tab title */}
                <span className="text-sm truncate flex-1 min-w-0">
                  {tab.title || 'New Tab'}
                </span>
                
                {/* Close button */}
                <motion.button
                  className="tab-close w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={12} />
                </motion.button>
              </div>

              {/* Active tab indicator */}
              {tab.active && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New tab button */}
      <motion.button
        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 border-l border-gray-300"
        onClick={() => createNewTab()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={16} className="text-gray-400" />
      </motion.button>
    </div>
  );
};

export default TabBar;