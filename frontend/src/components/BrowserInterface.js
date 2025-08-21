import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrowserHeader from './BrowserHeader';
import TabBar from './TabBar';
import NavigationBar from './NavigationBar';
import AISidebar from './AISidebar';
import WelcomePage from '../pages/WelcomePage';
import StatusBar from './StatusBar';
import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';

const BrowserInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with sidebar closed
  const [aiOpen, setAiOpen] = useState(false); // New state for AI assistant
  const { tabs, activeTabId } = useBrowser();
  const { initWebSocket, sessionId } = useAI();

  useEffect(() => {
    if (sessionId) {
      initWebSocket();
    }
  }, [sessionId, initWebSocket]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAI = () => {
    setAiOpen(!aiOpen);
  };

  const closeAI = () => {
    setAiOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 text-white overflow-hidden">
      {/* Browser Header - Fellou-style title bar */}
      <BrowserHeader />
      
      {/* Tab Bar */}
      <TabBar />
      
      {/* Navigation Bar */}
      <NavigationBar 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onToggleAI={toggleAI}
        aiOpen={aiOpen}
      />

      {/* Main Browser Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <WelcomePage />
        </div>
      </div>

      {/* AI Assistant Sidebar (Fixed Position) */}
      <AnimatePresence>
        {aiOpen && (
          <AISidebar onClose={closeAI} />
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <StatusBar />

      {/* Fellou-style floating action button for workflows */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAiOpen(true)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.button>

      {/* Workflow execution overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ display: 'none' }} // Will be controlled by workflow context
      >
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Executing Workflow</h3>
            <p className="text-gray-400 mb-4">Fellou is working on your task in the background...</p>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300" style={{width: '0%'}}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BrowserInterface;