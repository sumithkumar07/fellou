import React, { createContext, useContext, useState, useEffect } from 'react';
import { MessageSquare, Zap, History, Settings, Home } from 'lucide-react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [navigationHistory, setNavigationHistory] = useState(['welcome']);

  const navigationItems = [
    {
      id: 'welcome',
      label: 'Home',
      icon: Home,
      path: '/',
      shortcut: 'Alt+1',
      description: 'Welcome page and quick actions'
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: MessageSquare,
      path: '/chat',
      shortcut: 'Alt+2',
      description: 'Chat with Fellou AI assistant'
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: Zap,
      path: '/workflows',
      shortcut: 'Alt+3',
      description: 'Create and manage workflows',
      subPages: ['builder', 'templates', 'executions']
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      path: '/history',
      shortcut: 'Alt+4',
      description: 'View execution history and results'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      shortcut: 'Alt+5',
      description: 'Configure preferences and integrations'
    }
  ];

  const navigateTo = (pageId, addToHistory = true) => {
    setCurrentPage(pageId);
    if (addToHistory) {
      setNavigationHistory(prev => [...prev.slice(-9), pageId]); // Keep last 10 pages
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  const getCurrentItem = () => {
    return navigationItems.find(item => item.id === currentPage);
  };

  const value = {
    currentPage,
    navigationItems,
    navigationHistory,
    navigateTo,
    goBack,
    getCurrentItem,
    canGoBack: navigationHistory.length > 1
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;