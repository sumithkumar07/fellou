import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [wsConnection, setWsConnection] = useState(null);
  const [browserNavigationFn, setBrowserNavigationFn] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const sendMessage = useCallback(async (message, context = null) => {
    setIsLoading(true);
    
    try {
      const enhancedMessage = enhanceMessageWithFeatureSuggestions(message);
      
      const response = await axios.post(`${backendUrl}/api/chat`, {
        message: enhancedMessage,
        session_id: sessionId,
        context
      });

      const { 
        response: aiResponse, 
        session_id: newSessionId, 
        website_opened,
        website_name,
        website_url,
        tab_id,
        navigation_result,
        error
      } = response.data;
      
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      // Create assistant message with enhanced data
      const assistantMessage = {
        id: Date.now() + '-assistant',
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date(),
        // Enhanced properties for website opening
        websiteOpened: website_opened,
        websiteName: website_name,
        websiteUrl: website_url,
        tabId: tab_id,
        navigationResult: navigation_result,
        error: error
      };

      // Add both user and AI messages to state
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-user',
          role: 'user',
          content: message,
          timestamp: new Date()
        },
        assistantMessage
      ]);

      // If website opened successfully, navigate user's browser tab AND show visual feedback
      if (website_opened && website_url) {
        console.log(`🌐 AI opened ${website_name}: ${website_url}`);
        
        // Navigate user's actual browser tab to the website using proper browser navigation
        try {
          if (browserNavigationFn) {
            // Use the registered browser navigation function (from BrowserContext)
            const navigationResult = await browserNavigationFn(website_url);
            console.log(`✅ Successfully navigated to ${website_url} in browser tab`);
          } else {
            // Fallback: open in new tab if browser navigation is not available
            window.open(website_url, '_blank');
            console.log(`⚠️ Opened ${website_url} in new tab (fallback method)`);
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback: open in new tab if browser navigation fails
          window.open(website_url, '_blank');
        }
        
        // Also show screenshot in chat if available from AI's backend navigation
        if (navigation_result && navigation_result.screenshot) {
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-screenshot',
                role: 'assistant',
                content: `📸 Successfully opened ${website_name || 'website'} in your browser! Screenshot captured from AI's analysis.`,
                timestamp: new Date(),
                type: 'screenshot',
                screenshot: navigation_result.screenshot,
                websiteName: website_name,
                websiteUrl: website_url
              }
            ]);
          }, 2000); // Show screenshot after navigation completes
        }
      }

      return aiResponse;
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || 'Invalid request. Please check your input.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Connection issue detected. Please check your internet connection.';
      }
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-user',
          role: 'user',
          content: message,
          timestamp: new Date()
        },
        {
          id: Date.now() + '-error',
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }
      ]);
      
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, backendUrl]);

  // Enhanced message processing with feature suggestions
  const enhanceMessageWithFeatureSuggestions = (message) => {
    const lowerMessage = message.toLowerCase();
    let enhancedMessage = message;
    
    if (lowerMessage.includes('research')) {
      enhancedMessage += "\n\n[CONTEXT: User is interested in research. Suggest advanced capabilities: multi-site data extraction using CSS selectors, automated screenshot analysis with metadata fields, cross-platform data correlation from LinkedIn/Twitter/GitHub, and automated report generation with charts and insights.]";
    } else if (lowerMessage.includes('automate') || lowerMessage.includes('automation')) {
      enhancedMessage += "\n\n[CONTEXT: User wants automation. Showcase advanced capabilities: Native Chromium browser scripting with click/type/scroll actions, form automation across multiple sites, cross-platform integration with 50+ services, and background task processing with real-time progress updates.]";
    } else if (lowerMessage.includes('extract') || lowerMessage.includes('scrape') || lowerMessage.includes('data')) {
      enhancedMessage += "\n\n[CONTEXT: User needs data extraction. Emphasize advanced scraping: CSS selector-based extraction with complex selectors, Native Chromium engine for JavaScript-heavy sites, metadata extraction with og:tags and schema.org data, and structured export to JSON/CSV/Excel formats.]";
    } else if (lowerMessage.includes('integrate') || lowerMessage.includes('connect')) {
      enhancedMessage += "\n\n[CONTEXT: User wants integrations. Present comprehensive capabilities: 50+ platform connections (LinkedIn, Twitter, GitHub, Slack, Google Sheets), API configuration management, OAuth authentication handling, and real-time cross-platform updates.]";
    } else if (lowerMessage.length < 20) {
      enhancedMessage += "\n\n[CONTEXT: User sent a simple message. Proactively suggest impressive advanced features: Native Chromium automation with real browser, 50+ platform integrations with real-time sync, advanced data extraction with CSS selectors, screenshot capture with detailed analysis, and cross-platform browser isolation for parallel tasks.]";
    }
    
    return enhancedMessage;
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const registerBrowserNavigation = useCallback((navigationFn) => {
    setBrowserNavigationFn(() => navigationFn);
  }, []);

  const initWebSocket = useCallback(() => {
    if (sessionId && !wsConnection) {
      const wsBaseUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsBaseUrl}/api/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setWsConnection(ws);
        
        ws.send(JSON.stringify({ 
          type: 'ping', 
          client_info: { 
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Heartbeat for connection stability
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          } else {
            clearInterval(heartbeat);
          }
        }, 30000);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);
        
        if (data.type === 'browser_action_result') {
          const result = data.result;
          if (result.screenshot) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-screenshot',
                role: 'assistant', 
                content: `📸 Screenshot captured - ${result.message || 'Success'}`,
                timestamp: new Date(),
                type: 'screenshot',
                screenshot: result.screenshot
              }
            ]);
          }
          
          if (result.extracted_data && result.extracted_data.length > 0) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-extraction',
                role: 'assistant',
                content: `📊 Extracted ${result.extracted_data.length} data elements using CSS selectors`,
                timestamp: new Date(),
                type: 'data_extraction',
                extractedData: result.extracted_data
              }
            ]);
          }
        } else if (data.type === 'system_status') {
          console.log('📈 System status update:', data.status);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected - Attempting reconnection...');
        setWsConnection(null);
        
        let retryDelay = 1000;
        const maxRetries = 5;
        let retryCount = 0;
        
        const reconnect = () => {
          if (sessionId && retryCount < maxRetries) {
            retryCount++;
            retryDelay = Math.min(retryDelay * 2, 30000);
            console.log(`🔄 Reconnecting WebSocket (attempt ${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              initWebSocket();
            }, retryDelay);
          }
        };
        
        reconnect();
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWsConnection(null);
      };
      
      return ws;
    }
  }, [sessionId, wsConnection, backendUrl]);

  const sendBrowserAction = useCallback(async (tabId, action) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'browser_action',
        tab_id: tabId,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        ...action
      }));
      
      console.log(`🤖 Browser action sent: ${action.action_type} on tab ${tabId}`);
    } else {
      console.warn('⚠️ WebSocket not available, attempting reconnection...');
      initWebSocket();
    }
  }, [wsConnection, sessionId, initWebSocket]);

  const value = {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    initWebSocket,
    wsConnection,
    sendBrowserAction,
    registerBrowserNavigation
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};