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

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const sendMessage = useCallback(async (message, context = null) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/chat`, {
        message,
        session_id: sessionId,
        context
      });

      const { response: aiResponse, session_id: newSessionId } = response.data;
      
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      // Add both user and AI messages to state
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-user',
          role: 'user',
          content: message,
          timestamp: new Date()
        },
        {
          id: Date.now() + '-assistant',
          role: 'assistant', 
          content: aiResponse,
          timestamp: new Date()
        }
      ]);

      return aiResponse;
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = 'I apologize, but I encountered an error. Please try again.';
      
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

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const initWebSocket = useCallback(() => {
    if (sessionId && !wsConnection) {
      const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8001';
      const ws = new WebSocket(`${wsUrl}/api/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
      };
      
      return ws;
    }
  }, [sessionId, wsConnection]);

  const value = {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    initWebSocket,
    wsConnection
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};