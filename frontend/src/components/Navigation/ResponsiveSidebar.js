import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from './NavigationProvider';
import { useResponsive } from '../../hooks/useResponsive';
import { X, Bot } from 'lucide-react';

const ResponsiveSidebar = ({ sidebarOpen, onClose, onNavigate }) => {
  const { navigationItems, currentPage, navigateTo } = useNavigation();
  const { viewport, isMobile, isTablet, isDesktop } = useResponsive();
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Mobile: Bottom Navigation
  if (isMobile) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800 border-t border-dark-700 px-4 py-2"
      >
        <div className="flex justify-around items-center max-w-sm mx-auto">
          {navigationItems.slice(0, 4).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                navigateTo(item.id);
                onNavigate?.(item.path);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-0 ${
                currentPage === item.id
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={20} className="mb-1" />
              <span className="text-xs truncate max-w-full">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Tablet: Collapsible Sidebar
  if (isTablet) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-dark-800 border-r border-dark-700 flex-shrink-0 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-medium text-white">Fellou</h2>
                  <p className="text-xs text-gray-400">AI Browser</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    onNavigate?.(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Icon Sidebar (existing implementation enhanced)
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: sidebarOpen ? 72 : 0, opacity: sidebarOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="bg-dark-800 border-r border-dark-700 flex-shrink-0 flex flex-col items-center py-4"
    >
      {/* Brand Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-3 flex-1">
        {navigationItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              navigateTo(item.id);
              onNavigate?.(item.path);
            }}
            onMouseEnter={() => setActiveTooltip(item.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              currentPage === item.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`${item.label} (${item.shortcut})`}
          >
            <item.icon size={18} />
            
            {/* Tooltip */}
            <AnimatePresence>
              {activeTooltip === item.id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full ml-3 px-3 py-2 bg-dark-700 text-white text-sm rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-50 border border-dark-600"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-300">{item.shortcut}</div>
                  <div 
                    className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-dark-700 border-l border-b border-dark-600 rotate-45"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Close Sidebar"
      >
        <X size={18} />
      </motion.button>
    </motion.div>
  );
};

export default ResponsiveSidebar;