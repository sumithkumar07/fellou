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
      const wsBaseUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsBaseUrl}/api/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
        
        // Send initial ping
        ws.send(JSON.stringify({ type: 'ping' }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        if (data.type === 'workflow_progress') {
          // Add real-time workflow progress to messages
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-progress',
              role: 'assistant',
              content: `🔄 ${data.message} (${data.progress}%)`,
              timestamp: new Date(),
              type: 'progress',
              progress: data.progress
            }
          ]);
        } else if (data.type === 'browser_action_result') {
          // Add browser action results to chat
          const result = data.result;
          if (result.screenshot) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + '-screenshot',
                role: 'assistant', 
                content: '📸 Screenshot captured',
                timestamp: new Date(),
                type: 'screenshot',
                screenshot: result.screenshot
              }
            ]);
          }
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
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
        ...action
      }));
    }
  }, [wsConnection]);

  const createWorkflow = useCallback(async (instruction) => {
    try {
      const response = await axios.post(`${backendUrl}/api/workflow/create`, {
        instruction,
        session_id: sessionId,
        workflow_type: 'general'
      });

      const workflow = response.data.workflow;
      
      // Add workflow creation message to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-workflow',
          role: 'assistant',
          content: `✅ Created workflow: ${workflow.title}\n\nSteps:\n${workflow.steps.map((step, i) => `${i+1}. ${step.description}`).join('\n')}\n\nEstimated time: ${workflow.estimated_time_minutes} minutes`,
          timestamp: new Date(),
          type: 'workflow',
          workflow: workflow
        }
      ]);

      return workflow;
    } catch (error) {
      console.error('Workflow creation error:', error);
      throw error;
    }
  }, [sessionId, backendUrl]);

  const executeWorkflow = useCallback(async (workflowId) => {
    try {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-execution-start',
          role: 'assistant',
          content: '🚀 Starting workflow execution...',
          timestamp: new Date(),
          type: 'execution-start'
        }
      ]);

      const response = await axios.post(`${backendUrl}/api/workflow/execute/${workflowId}`);
      
      const executionResults = response.data;
      
      // Add execution results to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-execution-result',
          role: 'assistant',
          content: `✅ Workflow completed!\n\nResults:\n- Total steps: ${executionResults.total_steps}\n- Completed: ${executionResults.completed_steps}\n- Status: ${executionResults.status}\n- Execution time: ${executionResults.execution_time}`,
          timestamp: new Date(),
          type: 'execution-result',
          results: executionResults
        }
      ]);

      return executionResults;
    } catch (error) {
      console.error('Workflow execution error:', error);
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-execution-error',
          role: 'assistant',
          content: `❌ Workflow execution failed: ${error.message}`,
          timestamp: new Date(),
          type: 'error'
        }
      ]);
      
      throw error;
    }
  }, [backendUrl]);

  const value = {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    initWebSocket,
    wsConnection,
    sendBrowserAction,
    createWorkflow,
    executeWorkflow
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};