import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Settings, History, Zap, Bot, X } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

const ResponsiveSidebar = ({ onClose, activeTab, setActiveTab, showChat, setShowChat }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const tabs = [
    { id: 'chat', icon: MessageSquare, label: 'AI Chat', tooltip: 'Chat with Fellou AI' },
    { id: 'workflows', icon: Zap, label: 'Workflows', tooltip: 'Workflow Automation' },
    { id: 'history', icon: History, label: 'History', tooltip: 'Chat History' },
    { id: 'settings', icon: Settings, label: 'Settings', tooltip: 'Settings & Preferences' },
  ];

  // Mobile: Bottom Navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'chat') {
                  setShowChat(true);
                }
              }}
              className={`flex flex-col items-center p-2 min-w-[44px] min-h-[44px] rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={tab.tooltip}
            >
              <tab.icon size={18} />
              <span className="text-xs mt-1">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Tablet: Collapsible Sidebar
  if (isTablet) {
    return (
      <div className="h-full w-16 bg-dark-800 flex flex-col items-center py-4 border-r border-dark-700">
        {/* Brand Logo */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-3 flex-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'chat') {
                  setShowChat(true);
                }
              }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={tab.tooltip}
            >
              <tab.icon size={18} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-dark-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {tab.tooltip}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Close Button - Tablet Only */}
        <motion.button
          onClick={onClose}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </motion.button>
      </div>
    );
  }

  // Desktop: Full Icon Sidebar (Current Implementation)
  return (
    <div className="h-full w-full bg-dark-800 flex flex-col items-center py-4">
      {/* Brand Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-3 flex-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'chat') {
                setShowChat(true);
              }
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={tab.tooltip}
          >
            <tab.icon size={18} />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-dark-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {tab.tooltip}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Close Sidebar"
      >
        <X size={18} />
      </motion.button>
    </div>
  );
};

export default ResponsiveSidebar;