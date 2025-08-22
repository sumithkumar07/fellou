import React, { useState, useEffect } from 'react';
import { AIProvider } from '../contexts/AIContext';
import { BrowserProvider } from '../contexts/BrowserContext';
import ResponsiveSidebar from './ResponsiveSidebar';
import BrowserInterface from './BrowserInterface';
import WorkflowsPage from '../pages/WorkflowsPage';
import HistoryPage from '../pages/HistoryPage';
import SettingsPage from '../pages/SettingsPage';
import ExpandableChatPanel from './ExpandableChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';
import { useKeyboardNavigation } from '../hooks/useAccessibility';

function EnhancedApp() {
  // Simplified - Always show browser interface, no separate pages
  const [showChat, setShowChat] = useState(false);
  const { isMobile } = useResponsive();

  // Keyboard navigation handler - simplified
  useKeyboardNavigation((action, target) => {
    switch (action) {
      case 'escape':
        if (showChat) setShowChat(false);
        break;
      default:
        break;
    }
  });

  return (
    <BrowserProvider>
      <AIProvider>
          <div className="h-screen w-screen bg-dark-900 flex overflow-hidden">
            {/* Main Content Area - Always Browser Interface */}
            <div className="flex-1 flex flex-col">
              <BrowserInterface />
            </div>

            {/* Expandable Chat Panel - Keep for mobile */}
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
      </AIProvider>
    </BrowserProvider>
  );
}

export default EnhancedApp;