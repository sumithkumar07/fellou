import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BrowserContext = createContext();

export const useBrowser = () => {
  const context = useContext(BrowserContext);
  if (!context) {
    throw new Error('useBrowser must be used within a BrowserProvider');
  }
  return context;
};

export const BrowserProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 'welcome',
      title: 'Welcome to Emergent AI',
      url: 'emergent://welcome',
      active: true,
      favicon: null,
      loading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('welcome');
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const navigateToUrl = useCallback(async (url, tabId = null, sessionId = null) => {
    try {
      // Create session ID if not provided
      if (!sessionId) {
        sessionId = `session-${Date.now()}`;
      }

      // Create new tab if no tabId provided
      if (!tabId) {
        tabId = `tab-${Date.now()}`;
        const newTab = {
          id: tabId,
          title: 'Loading...',
          url: url,
          active: true,
          favicon: null,
          loading: true,
          sessionId: sessionId
        };
        
        setTabs(prev => [...prev.map(t => ({ ...t, active: false })), newTab]);
        setActiveTabId(tabId);
      }

      // Update tab loading state
      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, loading: true, url: url }
          : tab
      ));

      // Make API call to backend with full Native Chromium integration
      const response = await axios.post(`${backendUrl}/api/browser/navigate`, null, {
        params: { 
          url, 
          tab_id: tabId,
          session_id: sessionId
        }
      });

      const { 
        title, 
        content_preview, 
        screenshot, 
        metadata, 
        status_code,
        engine 
      } = response.data;

      // Update tab with comprehensive response data
      setTabs(prev => prev.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              title: title || url,
              loading: false,
              content: content_preview,
              screenshot: screenshot,
              metadata: metadata,
              statusCode: status_code,
              engine: engine,
              favicon: metadata?.['og:image'] || null,
              error: null
            }
          : tab
      ));

      // Add to navigation history with enhanced data
      setNavigationHistory(prev => [
        { 
          url, 
          title: title || url, 
          timestamp: new Date(), 
          tabId,
          sessionId,
          screenshot,
          statusCode: status_code,
          engine 
        },
        ...prev.slice(0, 99) // Keep last 100 entries
      ]);

      return response.data;
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Update tab with error state
      setTabs(prev => prev.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              title: 'Error loading page',
              loading: false,
              error: error.message,
              screenshot: null
            }
          : tab
      ));
      
      throw error;
    }
  }, [backendUrl]);

  const createNewTab = useCallback((url = 'emergent://new-tab') => {
    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: url === 'emergent://new-tab' ? 'New Tab' : 'Loading...',
      url: url,
      active: true,
      favicon: null,
      loading: false
    };

    setTabs(prev => [
      ...prev.map(t => ({ ...t, active: false })),
      newTab
    ]);
    setActiveTabId(newTabId);

    if (url !== 'emergent://new-tab') {
      navigateToUrl(url, newTabId);
    }

    return newTabId;
  }, [navigateToUrl]);

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const filteredTabs = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, activate the next tab
      if (activeTabId === tabId && filteredTabs.length > 0) {
        const nextTab = filteredTabs[filteredTabs.length - 1];
        nextTab.active = true;
        setActiveTabId(nextTab.id);
      }
      
      return filteredTabs;
    });
  }, [activeTabId]);

  const switchToTab = useCallback((tabId) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
    setActiveTabId(tabId);
  }, []);

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  const addBookmark = useCallback((url, title) => {
    const bookmark = {
      id: `bookmark-${Date.now()}`,
      url,
      title,
      timestamp: new Date()
    };
    
    setBookmarks(prev => [bookmark, ...prev]);
    return bookmark;
  }, []);

  const removeBookmark = useCallback((bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);

  const value = {
    tabs,
    activeTabId,
    navigationHistory,
    bookmarks,
    navigateToUrl,
    createNewTab,
    closeTab,
    switchToTab,
    getActiveTab,
    addBookmark,
    removeBookmark
  };

  return (
    <BrowserContext.Provider value={value}>
      {children}
    </BrowserContext.Provider>
  );
};