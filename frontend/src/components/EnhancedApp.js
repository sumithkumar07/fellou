import React, { useState, useEffect } from 'react';
import { AIProvider } from '../contexts/AIContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import ResponsiveSidebar from './ResponsiveSidebar';
import MainContent from './MainContent';
import WorkflowsPage from '../pages/WorkflowsPage';
import HistoryPage from '../pages/HistoryPage';
import SettingsPage from '../pages/SettingsPage';
import ExpandableChatPanel from './ExpandableChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';
import { useKeyboardNavigation } from '../hooks/useAccessibility';

function EnhancedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [showChat, setShowChat] = useState(false);
  const [currentPage, setCurrentPage] = useState('welcome');
  const { isMobile, isTablet } = useResponsive();

  // Keyboard navigation handler
  useKeyboardNavigation((action, target) => {
    switch (action) {
      case 'escape':
        if (showChat) setShowChat(false);
        break;
      case 'activate':
        if (target?.getAttribute('data-page')) {
          setCurrentPage(target.getAttribute('data-page'));
        }
        break;
      default:
        break;
    }
  });

  // Close sidebar on mobile when page changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [currentPage, isMobile]);

  // Adjust sidebar behavior based on viewport
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(true); // Always show bottom nav on mobile
    } else if (isTablet) {
      setSidebarOpen(true); // Show compact sidebar on tablet
    }
  }, [isMobile, isTablet]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Navigate to corresponding page
    if (tabId === 'workflows') {
      setCurrentPage('workflows');
    } else if (tabId === 'history') {
      setCurrentPage('history');
    } else if (tabId === 'settings') {
      setCurrentPage('settings');
    } else if (tabId === 'chat') {
      setCurrentPage('welcome');
      setShowChat(true);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'workflows':
        return <WorkflowsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'welcome':
      default:
        return (
          <MainContent 
            sidebarOpen={sidebarOpen && !isMobile} 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          />
        );
    }
  };

  return (
    <AIProvider>
      <WorkflowProvider>
        <div className="h-screen w-screen bg-dark-900 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {renderCurrentPage()}
          </div>

          {/* Desktop/Tablet Sidebar - Moved to Right */}
          {!isMobile && (
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 72, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-dark-800 border-l border-dark-700 flex-shrink-0"
                >
                  <ResponsiveSidebar 
                    onClose={() => setSidebarOpen(false)}
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    showChat={showChat}
                    setShowChat={setShowChat}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <ResponsiveSidebar 
              onClose={() => setSidebarOpen(false)}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              showChat={showChat}
              setShowChat={setShowChat}
            />
          )}

          {/* Desktop Sidebar Toggle Button (when closed) */}
          {!isMobile && (
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setSidebarOpen(true)}
                  className="fixed top-4 left-4 z-50 bg-dark-800 border border-dark-700 rounded-lg p-2 shadow-lg hover:shadow-xl hover:bg-dark-700 transition-all duration-200"
                  aria-label="Open sidebar"
                >
                  <MessageSquare size={20} className="text-blue-400" />
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {/* Expandable Chat Panel */}
          <ExpandableChatPanel 
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />

          {/* Skip to main content link for screen readers */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50"
          >
            Skip to main content
          </a>
        </div>
      </WorkflowProvider>
    </AIProvider>
  );
}

export default EnhancedApp;