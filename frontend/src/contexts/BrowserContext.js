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
      // Enhanced session management
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Create new tab if no tabId provided
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

      // Enhanced loading state with better feedback
      setTabs(prev => prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, loading: true, url: url, lastUpdate: new Date().toISOString() }
          : tab
      ));

      // Enhanced API call with retry logic and better error handling
      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await axios.post(`${backendUrl}/api/browser/navigate`, null, {
            params: { 
              url, 
              tab_id: tabId,
              session_id: sessionId
            },
            timeout: 30000 // 30 second timeout
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw error;
          }
          console.log(`🔄 Retrying navigation (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
        }
      }

      const { 
        title, 
        content_preview, 
        screenshot, 
        metadata, 
        status_code,
        engine,
        success
      } = response.data;

      // Enhanced tab update with comprehensive data - no UI change, just better data
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
              success: success,
              // Enhanced: Store additional metadata for better backend integration
              contentSize: content_preview?.length || 0,
              loadTime: response.headers?.['x-response-time'] || null,
              securityInfo: metadata?.['security'] || null
            }
          : tab
      ));

      // Enhanced navigation history with richer metadata
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
          engine: engine || 'Native Chromium',
          metadata,
          success: success,
          loadTime: response.headers?.['x-response-time'] || 'N/A'
        },
        ...prev.slice(0, 99) // Keep last 100 entries
      ]);

      console.log(`✅ Enhanced navigation completed: ${title} (${status_code})`);
      return response.data;
    } catch (error) {
      console.error('❌ Enhanced navigation error:', error);
      
      // Enhanced error handling with detailed error info
      const errorMessage = error.response?.data?.detail || error.message || 'Navigation failed';
      
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
      // Call backend to close browser tab
      await axios.delete(`${backendUrl}/api/browser/tab/${tabId}`);
    } catch (error) {
      console.error('Error closing tab on backend:', error);
      // Continue with frontend cleanup even if backend call fails
    }

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
  }, [activeTabId, backendUrl]);

  const refreshTabs = useCallback(async (sessionId) => {
    try {
      console.log('🔄 Enhanced tab synchronization starting...');
      const response = await axios.get(`${backendUrl}/api/browser/tabs`, {
        params: { session_id: sessionId },
        timeout: 10000
      });
      
      const backendTabs = response.data.tabs || [];
      console.log(`📊 Synchronized ${backendTabs.length} tabs from backend`);
      
      // Enhanced frontend tabs update with backend data synchronization
      setTabs(prev => {
        const syncedTabs = prev.map(frontendTab => {
          const backendTab = backendTabs.find(bt => bt.tab_id === frontendTab.id);
          if (backendTab) {
            return {
              ...frontendTab,
              title: backendTab.title || frontendTab.title,
              url: backendTab.url || frontendTab.url,
              loading: backendTab.loading || false,
              active: backendTab.active !== undefined ? backendTab.active : frontendTab.active,
              lastSync: new Date().toISOString(),
              syncStatus: 'synced'
            };
          }
          return {
            ...frontendTab,
            syncStatus: 'local_only'
          };
        });
        
        // Add any backend tabs that don't exist in frontend
        const newBackendTabs = backendTabs
          .filter(bt => !prev.find(ft => ft.id === bt.tab_id))
          .map(bt => ({
            id: bt.tab_id,
            title: bt.title || 'Synced Tab',
            url: bt.url || 'about:blank',
            active: bt.active || false,
            loading: bt.loading || false,
            favicon: null,
            lastSync: new Date().toISOString(),
            syncStatus: 'backend_sync',
            sessionId: sessionId
          }));
        
        return [...syncedTabs, ...newBackendTabs];
      });
      
      console.log('✅ Enhanced tab synchronization completed');
      return response.data;
    } catch (error) {
      console.error('❌ Enhanced tab sync error:', error);
      // Graceful degradation - continue with local tabs
      setTabs(prev => prev.map(tab => ({
        ...tab,
        syncStatus: 'sync_failed',
        lastSyncError: error.message
      })));
    }
  }, [backendUrl]);

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
    refreshTabs,
    takeScreenshot,
    executeBrowserAction
  };

  return (
    <BrowserContext.Provider value={value}>
      {children}
    </BrowserContext.Provider>
  );
};