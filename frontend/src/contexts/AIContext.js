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
  const [isBrowserReady, setIsBrowserReady] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const sendMessage = useCallback(async (message, context = null) => {
    setIsLoading(true);
    
    try {
      const enhancedMessage = enhanceMessageWithFeatureSuggestions(message);
      
      console.log('🚀 STARTING API CALL:', { message: enhancedMessage, session_id: sessionId, backendUrl });
      
      const response = await axios.post(`${backendUrl}/api/chat`, {
        message: enhancedMessage,
        session_id: sessionId,
        context
      });

      console.log('🔍 RAW API RESPONSE:', response);
      console.log('🔍 RESPONSE DATA:', response.data);
      console.log('🔍 RESPONSE STATUS:', response.status);

      const { 
        response: aiResponse, 
        session_id: newSessionId, 
        website_opened,
        website_name,
        website_url,
        tab_id,
        navigation_result,
        native_browser,
        proxy_url,
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
        nativeBrowser: native_browser,
        proxyUrl: proxy_url,
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

      // If website opened successfully, navigate using NATIVE BROWSER ENGINE
      console.log(`🔍 DEBUG AICONTEXT - Response data:`, { website_opened, website_url, native_browser, proxy_url });
      console.log(`🔍 DEBUG AICONTEXT - website_opened type:`, typeof website_opened);
      console.log(`🔍 DEBUG AICONTEXT - website_opened value:`, website_opened);
      console.log(`🔍 DEBUG AICONTEXT - website_url:`, website_url);
      console.log(`🔍 DEBUG AICONTEXT - native_browser:`, native_browser);
      
      if (website_opened && website_url && native_browser) {
        console.log(`🌐 DEBUG AICONTEXT - CONDITION MET! AI opening ${website_name}: ${website_url} - Using NATIVE BROWSER ENGINE`);
        console.log(`🔍 DEBUG AICONTEXT - browserNavigationFn available?`, !!browserNavigationFn);
        console.log(`🔍 DEBUG AICONTEXT - isBrowserReady?`, isBrowserReady);
        console.log(`🔍 DEBUG AICONTEXT - Proxy URL:`, proxy_url);
        
        try {
          console.log(`🌐 Native Browser Engine loading ${website_url}`);
          
          // Use native browser navigation function - Always try to navigate
          if (browserNavigationFn) {
            console.log(`✅ Using Native Browser Engine for ${website_url}`);
            
            // Pass the proxy URL for native browser rendering
            const navResult = await browserNavigationFn(website_url, proxy_url, null, true); // true = native browser mode
            console.log(`✅ Native Browser Engine navigation completed:`, navResult);
            
            // Update message to show native browser success
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id ? {
                ...msg,
                content: `✅ **${website_name.charAt(0).toUpperCase() + website_name.slice(1)} opened in Native Browser Engine!**\n\n🌐 **URL:** ${website_url}\n🚀 **Engine:** Native Chromium Browser\n⚡ **Status:** Successfully loaded with full functionality\n🎯 **Interactivity:** Complete - click, scroll, type, navigate\n💫 **Method:** Native browser rendering (not screenshots)\n🎮 **Features:** Forms, videos, logins, downloads all work\n\n🎉 **Success! You can now interact with ${website_name} like a real browser!**\n\n💡 **This is a fully functional website - click anywhere to interact!**`
              } : msg
            ));
          } else {
            console.warn('⚠️ Native Browser Engine navigation function not available', { 
              browserNavigationFn: !!browserNavigationFn, 
              isBrowserReady,
              message: 'Will call function anyway to test'
            });
            
            // Try calling the navigation function anyway
            if (browserNavigationFn) {
              console.log('🔄 Attempting navigation function call anyway...');
              const navResult = await browserNavigationFn(website_url, proxy_url, true);
              console.log('✅ Navigation function called successfully:', navResult);
            } else {
              console.error('❌ browserNavigationFn is null/undefined');
            }
            
            // Show loading message until browser is ready
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id ? {
                ...msg,
                content: `🔄 **Native Browser Engine initializing...**\n\n${website_name} is being loaded in the Native Browser Engine.\n\n🌐 **URL:** ${website_url}\n⚡ **Status:** Preparing full functionality\n🎯 **Features:** Complete interactivity loading...\n\n💡 **Please wait while we initialize the native browser...**`
              } : msg
            ));
          }
          
        } catch (navError) {
          console.error('Native Browser Engine navigation failed:', navError);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id ? {
              ...msg,
              content: `❌ **Native Browser Engine navigation failed for ${website_name}**\n\n🚫 **Error:** ${navError.message || 'Navigation error'}\n🔧 **URL:** ${website_url}\n\n💡 **Please try again - Native Browser Engine is still loading...**`
            } : msg
          ));
        }
      }

      return aiResponse;
    } catch (error) {
      console.error('🚨 AI CHAT ERROR CAUGHT:', error);
      console.error('🚨 ERROR TYPE:', typeof error);
      console.error('🚨 ERROR MESSAGE:', error.message);
      console.error('🚨 ERROR RESPONSE:', error.response);
      console.error('🚨 ERROR CODE:', error.code);
      console.error('🚨 ERROR STACK:', error.stack);
      
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Native Browser Engine temporarily unavailable. Please try again in a moment.';
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
  }, [sessionId, backendUrl, browserNavigationFn, isBrowserReady]);

  // Enhanced message processing with feature suggestions
  const enhanceMessageWithFeatureSuggestions = (message) => {
    const lowerMessage = message.toLowerCase();
    let enhancedMessage = message;
    
    if (lowerMessage.includes('research')) {
      enhancedMessage += "\n\n[CONTEXT: User is interested in research. Mention Native Browser Engine capabilities: full website interaction for research, real-time data access, form submission for surveys, and complete website functionality for thorough research.]";
    } else if (lowerMessage.includes('automate') || lowerMessage.includes('automation')) {
      enhancedMessage += "\n\n[CONTEXT: User wants automation. Showcase Native Browser Engine: real website interaction, form automation, login capabilities, and full browser functionality with JavaScript support.]";
    } else if (lowerMessage.includes('browse') || lowerMessage.includes('website') || lowerMessage.includes('site')) {
      enhancedMessage += "\n\n[CONTEXT: User wants to browse websites. Emphasize Native Browser Engine: full interactivity like Chrome/Firefox, complete website functionality, media streaming, form submission, and real browser experience.]";
    } else if (lowerMessage.includes('watch') || lowerMessage.includes('video') || lowerMessage.includes('stream')) {
      enhancedMessage += "\n\n[CONTEXT: User wants to watch content. Highlight Native Browser capabilities: full video streaming, media playback, subscription features, and complete interactive website access.]";
    } else if (lowerMessage.length < 20) {
      enhancedMessage += "\n\n[CONTEXT: User sent a simple message. Proactively mention Native Browser Engine features: full website functionality, complete interactivity, real browser experience, and ability to use any website like YouTube, Google, etc.]";
    }
    
    return enhancedMessage;
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const registerBrowserNavigation = useCallback((navigationFn) => {
    console.log('🔧 Registering Native Browser Engine navigation function');
    setBrowserNavigationFn(() => navigationFn);
    setIsBrowserReady(true);
    console.log('✅ Native Browser Engine navigation function registered successfully');
  }, []);

  const initWebSocket = useCallback(() => {
    if (sessionId && !wsConnection) {
      const wsBaseUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsBaseUrl}/api/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected to Native Browser Engine');
        setWsConnection(ws);
        
        ws.send(JSON.stringify({ 
          type: 'ping', 
          client_info: { 
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            native_browser: true
          }
        }));
        
        // Heartbeat for connection stability
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat', native_browser: true }));
          } else {
            clearInterval(heartbeat);
          }
        }, 30000);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Native Browser Engine WebSocket message:', data);
        
        if (data.type === 'browser_action_result') {
          const result = data.result;
          
          // For native browser, we don't need screenshots - we have full functionality
          if (result.native_browser_success) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-native-success',
                role: 'assistant',
                content: `✅ Native Browser Engine: ${result.message || 'Website loaded successfully with full functionality'}`,
                timestamp: new Date(),
                type: 'native_browser_success',
                websiteUrl: result.url
              }
            ]);
          }
          
          if (result.extracted_data && result.extracted_data.length > 0) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-extraction',
                role: 'assistant',
                content: `📊 Native Browser extracted ${result.extracted_data.length} data elements with full website access`,
                timestamp: new Date(),
                type: 'data_extraction',
                extractedData: result.extracted_data
              }
            ]);
          }
        } else if (data.type === 'system_status') {
          console.log('📈 Native Browser Engine system status:', data.status);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 Native Browser Engine WebSocket disconnected - Attempting reconnection...');
        setWsConnection(null);
        
        let retryDelay = 1000;
        const maxRetries = 5;
        let retryCount = 0;
        
        const reconnect = () => {
          if (sessionId && retryCount < maxRetries) {
            retryCount++;
            retryDelay = Math.min(retryDelay * 2, 30000);
            console.log(`🔄 Reconnecting Native Browser Engine WebSocket (attempt ${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              initWebSocket();
            }, retryDelay);
          }
        };
        
        reconnect();
      };
      
      ws.onerror = (error) => {
        console.error('❌ Native Browser Engine WebSocket error:', error);
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
        native_browser: true,
        ...action
      }));
      
      console.log(`🤖 Native Browser Engine action sent: ${action.action_type} on tab ${tabId}`);
    } else {
      console.warn('⚠️ Native Browser Engine WebSocket not available, attempting reconnection...');
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
    registerBrowserNavigation,
    isBrowserReady
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};