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
      isActive: true,
      favicon: '🌐',
      loading: false,
      nativeBrowser: false // Welcome tab uses traditional display
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  const createNewTab = useCallback((url = 'emergent://welcome', title = 'New Tab') => {
    const tabId = `tab_${Date.now()}`;
    const newTab = {
      id: tabId,
      title,
      url,
      isActive: false,
      favicon: '🌐',
      loading: false,
      nativeBrowser: url !== 'emergent://welcome' // Enable native browser for non-welcome URLs
    };

    setTabs(prev => {
      // Update all existing tabs to inactive and add the new tab
      const updatedTabs = prev.map(tab => ({ ...tab, isActive: false }));
      return [...updatedTabs, { ...newTab, isActive: true }];
    });
    
    setActiveTabId(tabId);
    return tabId;
  }, []);

  const switchToTab = useCallback((tabId) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
    setActiveTabId(tabId);
  }, []);

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== tabId);
      
      // If we closed the active tab, switch to another tab
      if (tabId === activeTabId && updatedTabs.length > 0) {
        const newActiveTab = updatedTabs[updatedTabs.length - 1];
        newActiveTab.isActive = true;
        setActiveTabId(newActiveTab.id);
      }
      
      return updatedTabs.length > 0 ? updatedTabs : [{
        id: 'welcome',
        title: 'Welcome to Kairo AI',
        url: 'emergent://welcome',
        isActive: true,
        favicon: '🌐',
        loading: false,
        nativeBrowser: false
      }];
    });
  }, [activeTabId]);

  const updateTab = useCallback((tabId, updates) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  const navigateToUrl = useCallback(async (url, proxyUrl = null, tabId = null, nativeBrowser = true) => {
    console.log(`🌐 BrowserContext: Navigating to ${url} (Native Browser: ${nativeBrowser})`);
    console.log(`🔗 Proxy URL: ${proxyUrl}`);
    console.log(`📋 Tab ID: ${tabId}, Active Tab ID: ${activeTabId}`);
    
    let targetTabId = tabId || activeTabId;
    const isNewTab = !tabs.find(tab => tab.id === targetTabId);
    
    console.log(`🆕 Is New Tab: ${isNewTab}, Target Tab ID: ${targetTabId}`);
    
    // Determine if this should be a native browser navigation
    const useNativeBrowser = nativeBrowser && url !== 'emergent://welcome';
    
    try {
      // Create new tab if needed and get the correct tab ID
      if (isNewTab || !tabId) {
        const newTabId = createNewTab(url, 'Loading...');
        targetTabId = newTabId; // Use the actual created tab ID
        console.log(`✅ Created new tab with ID: ${newTabId} and auto-switched to it`);
      }
      
      // Update tab to show loading state
      updateTab(targetTabId, { 
        loading: true, 
        title: 'Loading...', 
        url: url,
        nativeBrowser: useNativeBrowser
      });
      
      console.log(`🔄 Updated tab ${targetTabId} with loading state`);

      if (useNativeBrowser) {
        // Native Browser Engine Navigation - Use proxy URL for iframe embedding  
        console.log('🌐 Using Native Browser Engine with iframe for:', url);
        
        const displayTitle = getWebsiteName(url);
        const encodedUrl = encodeURIComponent(url);
        const iframeUrl = `${backendUrl}/api/proxy/${encodedUrl}`;
        
        console.log(`🔗 Iframe URL: ${iframeUrl}`);
        
        updateTab(targetTabId, {
          title: displayTitle,
          loading: false,
          nativeBrowser: true,
          url: url,
          iframeUrl: iframeUrl, // Use iframe for display
          favicon: getFaviconForUrl(url),
          engine: 'Native Browser Engine',
          success: true
        });

        console.log('✅ Native Browser Engine (iframe) navigation completed');
        return {
          success: true,
          engine: 'Native Browser Engine',
          title: displayTitle,
          url: url,
          iframeUrl: iframeUrl
        };
        
      } else {
        // Legacy screenshot-based navigation (fallback)
        console.log('📸 Using screenshot mode for:', url);
        
        const response = await axios.get(`${backendUrl}/api/browser/navigate`, {
          params: {
            url: url,
            tab_id: targetTabId,
            session_id: `session_${Date.now()}`
          },
          timeout: 30000
        });

        const { title, screenshot, success, engine } = response.data;

        updateTab(targetTabId, {
          title: title || 'Error',
          screenshot: screenshot,
          loading: false,
          nativeBrowser: false,
          favicon: getFaviconForUrl(url),
          engine: engine || 'Screenshot Mode'
        });

        return {
          success: success,
          title: title,
          screenshot: screenshot,
          engine: engine
        };
      }

    } catch (error) {
      console.error('❌ Navigation error:', error);
      
      updateTab(targetTabId, {
        title: 'Error Loading Page',
        loading: false,
        nativeBrowser: false,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }, [tabs, activeTabId, backendUrl, createNewTab, updateTab]);

  const getWebsiteName = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const siteName = domain.split('.')[0];
      return siteName.charAt(0).toUpperCase() + siteName.slice(1);
    } catch {
      return 'Website';
    }
  };

  const getFaviconForUrl = (url) => {
    const faviconMap = {
      'youtube.com': '📺',
      'google.com': '🔍',
      'gmail.com': '📧',
      'facebook.com': '📘',
      'twitter.com': '🐦',
      'x.com': '❌',
      'instagram.com': '📸',
      'linkedin.com': '💼',
      'github.com': '🐙',
      'netflix.com': '🎬',
      'amazon.com': '📦',
      'reddit.com': '📱',
      'stackoverflow.com': '💡',
      'wikipedia.org': '📚',
      'chat.openai.com': '🤖',
      'claude.ai': '🤖',
      'tiktok.com': '🎵',
      'pinterest.com': '📌',
      'twitch.tv': '🎮',
      'spotify.com': '🎵'
    };

    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      return faviconMap[hostname] || '🌐';
    } catch {
      return '🌐';
    }
  };

  const refreshCurrentTab = useCallback(() => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.url !== 'emergent://welcome') {
      navigateToUrl(activeTab.url, activeTab.proxyUrl, activeTab.id, activeTab.nativeBrowser);
    }
  }, [getActiveTab, navigateToUrl]);

  const goBack = useCallback(() => {
    // Implement browser history navigation
    console.log('🔙 Going back in browser history');
    // For now, we'll just refresh - can implement proper history later
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  const goForward = useCallback(() => {
    // Implement browser history navigation  
    console.log('▶️ Going forward in browser history');
    // For now, we'll just refresh - can implement proper history later
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  const value = {
    tabs,
    activeTabId,
    isLoading,
    getActiveTab,
    createNewTab,
    switchToTab,
    closeTab,
    updateTab,
    navigateToUrl,
    refreshCurrentTab,
    goBack,
    goForward
  };

  return (
    <BrowserContext.Provider value={value}>
      {children}
    </BrowserContext.Provider>
  );
};