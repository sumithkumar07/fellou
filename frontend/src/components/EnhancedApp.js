import React, { useState } from 'react';
import { AIProvider } from '../contexts/AIContext';
import { BrowserProvider } from '../contexts/BrowserContext';
import BrowserInterface from './BrowserInterface';
import { useKeyboardNavigation } from '../hooks/useAccessibility';

function EnhancedApp() {
  // Keyboard navigation handler - simplified
  useKeyboardNavigation((action, target) => {
    switch (action) {
      case 'escape':
        // Handle escape if needed
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