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
      title: 'Welcome to Kairo AI',
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

  const navigateToUrl = useCallback(async (url, tabId = null, sessionId = null, navigateRealBrowser = true) => {
    try {
      // If this is called for real browser navigation (from AI), directly navigate the browser
      if (navigateRealBrowser && !tabId) {
        console.log(`🌐 Direct browser navigation to: ${url}`);
        window.location.href = url;
        return { success: true, directNavigation: true, url };
      }

      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      if (!tabId) {
        tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTab = {
          id: tabId,
          title: 'Loading...',
          url: url,
          active: true,
          favicon: null,
          loading: true,
          sessionId: sessionId,
          created: new Date().toISOString()
        };
        
        setTabs(prev => [...prev.map(t => ({ ...t, active: false })), newTab]);
        setActiveTabId(tabId);
      }

      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, loading: true, url: url, lastUpdate: new Date().toISOString() }
          : tab
      ));

      const response = await axios.post(`${backendUrl}/api/browser/navigate`, null, {
        params: { 
          url, 
          tab_id: tabId,
          session_id: sessionId
        },
        timeout: 30000
      });

      const { 
        title, 
        content_preview, 
        screenshot, 
        metadata, 
        status_code,
        engine,
        success
      } = response.data;

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
              engine: engine || 'Native Chromium',
              favicon: metadata?.['og:image'] || metadata?.['twitter:image'] || null,
              error: null,
              lastUpdate: new Date().toISOString(),
              success: success
            }
          : tab
      ));

      setNavigationHistory(prev => [
        { 
          id: `nav-${Date.now()}`,
          url, 
          title: title || url, 
          timestamp: new Date(), 
          tabId,
          sessionId,
          screenshot,
          statusCode: status_code,
          success: success
        },
        ...prev.slice(0, 99)
      ]);

      console.log(`✅ Navigation completed: ${title} (${status_code})`);
      return response.data;
    } catch (error) {
      console.error('❌ Navigation error:', error);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Navigation failed';
      
      if (tabId) {
        setTabs(prev => prev.map(tab =>
          tab.id === tabId
            ? {
                ...tab,
                title: 'Error loading page',
                loading: false,
                error: errorMessage,
                screenshot: null,
                lastUpdate: new Date().toISOString(),
                success: false
              }
            : tab
        ));
      }
      
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

  const closeTab = useCallback(async (tabId) => {
    try {
      await axios.delete(`${backendUrl}/api/browser/tab/${tabId}`);
    } catch (error) {
      console.error('Error closing tab on backend:', error);
    }

    setTabs(prev => {
      const filteredTabs = prev.filter(tab => tab.id !== tabId);
      
      if (activeTabId === tabId && filteredTabs.length > 0) {
        const nextTab = filteredTabs[filteredTabs.length - 1];
        nextTab.active = true;
        setActiveTabId(nextTab.id);
      }
      
      return filteredTabs;
    });
  }, [activeTabId, backendUrl]);

  const takeScreenshot = useCallback(async (tabId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/browser/screenshot`, null, {
        params: { tab_id: tabId }
      });
      
      return response.data.screenshot;
    } catch (error) {
      console.error('Screenshot error:', error);
      throw error;
    }
  }, [backendUrl]);

  const executeBrowserAction = useCallback(async (tabId, action) => {
    try {
      const response = await axios.post(`${backendUrl}/api/browser/action`, {
        tab_id: tabId,
        ...action
      });
      
      return response.data;
    } catch (error) {
      console.error('Browser action error:', error);
      throw error;
    }
  }, [backendUrl]);

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
    removeBookmark,
    takeScreenshot,
    executeBrowserAction
  };

  return (
    <BrowserContext.Provider value={value}>
      {children}
    </BrowserContext.Provider>
  );
};