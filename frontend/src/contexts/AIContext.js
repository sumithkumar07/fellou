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
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const sendMessage = useCallback(async (message, context = null) => {
    setIsLoading(true);
    
    try {
      // Enhanced command recognition and proactive feature suggestions
      const enhancedMessage = await enhanceMessageWithFeatureSuggestions(message);
      
      const response = await axios.post(`${backendUrl}/api/chat`, {
        message: enhancedMessage,
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
          content: message, // Show original message to user
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
      
      // Enhanced error handling - same UI, better error responses
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

  // Enhanced message processing with better feature suggestions
  const enhanceMessageWithFeatureSuggestions = async (message) => {
    const lowerMessage = message.toLowerCase();
    let enhancedMessage = message;
    
    // Enhanced context suggestions with more specific capabilities
    if (lowerMessage.includes('research')) {
      enhancedMessage += "\n\n[CONTEXT: User is interested in research. Suggest advanced capabilities: multi-site data extraction using CSS selectors (h1, .price, .description), automated screenshot analysis with 42+ metadata fields, cross-platform data correlation from LinkedIn/Twitter/GitHub, scheduled monitoring with real-time alerts, and automated report generation with charts and insights.]";
    } else if (lowerMessage.includes('automate') || lowerMessage.includes('automation')) {
      enhancedMessage += "\n\n[CONTEXT: User wants automation. Showcase advanced capabilities: Native Chromium browser scripting with click/type/scroll actions, form automation across multiple sites, workflow templates for lead generation and monitoring, cross-platform integration with 50+ services, background task processing with real-time progress updates, and session-based browser isolation for parallel automations.]";
    } else if (lowerMessage.includes('monitor') || lowerMessage.includes('track') || lowerMessage.includes('watch')) {
      enhancedMessage += "\n\n[CONTEXT: User needs monitoring. Highlight advanced features: recurring workflow execution with scheduling, real-time WebSocket alerts and notifications, screenshot comparison for visual change detection, advanced error handling with retry logic, background monitoring with system resource optimization, and detailed execution history with performance metrics.]";
    } else if (lowerMessage.includes('extract') || lowerMessage.includes('scrape') || lowerMessage.includes('data')) {
      enhancedMessage += "\n\n[CONTEXT: User needs data extraction. Emphasize advanced scraping: CSS selector-based extraction with complex selectors (.class > div:nth-child(2)), Native Chromium engine for JavaScript-heavy sites, metadata extraction (42+ fields including og:tags, schema.org data), batch processing across multiple URLs, data correlation and deduplication, structured export to JSON/CSV/Excel formats.]";
    } else if (lowerMessage.includes('workflow') || lowerMessage.includes('process')) {
      enhancedMessage += "\n\n[CONTEXT: User is interested in workflows. Show advanced features: visual drag-and-drop workflow builder, template library for common use cases, execution tracking with real-time progress, credit-based estimation with cost transparency, workflow sharing and collaboration, integration with 50+ platforms, and advanced error handling with rollback capabilities.]";
    } else if (lowerMessage.includes('integrate') || lowerMessage.includes('connect')) {
      enhancedMessage += "\n\n[CONTEXT: User wants integrations. Present comprehensive capabilities: 50+ platform connections (LinkedIn, Twitter, GitHub, Slack, Google Sheets, Salesforce, HubSpot), API configuration management, OAuth authentication handling, webhook automation, data synchronization workflows, real-time cross-platform updates, and enterprise-grade security features.]";
    } else if (lowerMessage.length < 20) { // Short/simple messages get enhanced feature discovery
      enhancedMessage += "\n\n[CONTEXT: User sent a simple message. Proactively suggest 2-3 most impressive advanced features: Native Chromium automation with real browser (not simulation), 50+ platform integrations with real-time sync, advanced data extraction with CSS selectors and metadata analysis, workflow automation with credit estimation, screenshot capture with 187K+ character analysis, and session-based browser isolation for parallel tasks.]";
    }
    
    return enhancedMessage;
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const initWebSocket = useCallback(() => {
    if (sessionId && !wsConnection) {
      const wsBaseUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsBaseUrl}/api/ws/${sessionId}`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected - Enhanced real-time features active');
        setWsConnection(ws);
        
        // Enhanced ping with system status
        ws.send(JSON.stringify({ 
          type: 'ping', 
          client_info: { 
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Set up periodic heartbeat for better connection stability
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          } else {
            clearInterval(heartbeat);
          }
        }, 30000); // Every 30 seconds
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Enhanced WebSocket message:', data);
        
        // Enhanced message handling with better real-time features
        if (data.type === 'workflow_progress') {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-progress',
              role: 'assistant',
              content: `🔄 ${data.message} (${data.progress}%) - ${data.engine || 'Native Chromium'}`,
              timestamp: new Date(),
              type: 'progress',
              progress: data.progress
            }
          ]);
        } else if (data.type === 'browser_action_result') {
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
          
          // Enhanced: Handle data extraction results
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
          // Enhanced: Real-time system status updates (no UI change, just better data)
          console.log('📈 System status update:', data.status);
        } else if (data.type === 'tab_sync') {
          // Enhanced: Real-time tab synchronization (no UI change, automatic sync)
          console.log('🔄 Tab state synchronized:', data.tabs);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected - Attempting reconnection...');
        setWsConnection(null);
        
        // Enhanced: Auto-reconnection logic
        setTimeout(() => {
          if (sessionId) {
            initWebSocket();
          }
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ Enhanced WebSocket error:', error);
        setWsConnection(null);
      };
      
      return ws;
    }
  }, [sessionId, wsConnection, backendUrl]);

  const sendBrowserAction = useCallback(async (tabId, action) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      // Enhanced browser action with better metadata
      wsConnection.send(JSON.stringify({
        type: 'browser_action',
        tab_id: tabId,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        ...action
      }));
      
      // Enhanced: Add local feedback for immediate response (no UI change)
      console.log(`🤖 Browser action sent: ${action.action_type} on tab ${tabId}`);
    } else {
      console.warn('⚠️ WebSocket not available, attempting reconnection...');
      // Enhanced: Attempt reconnection if WebSocket is down
      initWebSocket();
    }
  }, [wsConnection, sessionId, initWebSocket]);

  const executeWorkflow = useCallback(async (workflowId) => {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    try {
      setActiveWorkflow(workflowId);
      
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
      const totalSteps = executionResults.total_steps || 1;
      let currentStep = 0;
      
      // Simulate real-time progress based on execution results
      const progressInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min((currentStep / totalSteps) * 100, 90);
        setExecutionProgress(progress);
        
        if (currentStep >= totalSteps) {
          clearInterval(progressInterval);
          setExecutionProgress(100);
        }
      }, 800);

      // Update workflows list with real results
      setWorkflows(prev => prev.map(w => 
        w.workflow_id === workflowId 
          ? { 
              ...w, 
              ...executionResults, 
              status: executionResults.status,
              last_execution: new Date().toISOString(),
              total_executions: (w.total_executions || 0) + 1
            }
          : w
      ));
      
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

      // Complete execution after real results
      setTimeout(() => {
        setExecutionProgress(100);
        setIsExecuting(false);
        setActiveWorkflow(null);
      }, 2000);

      return executionResults;
    } catch (error) {
      console.error('Workflow execution error:', error);
      setIsExecuting(false);
      setActiveWorkflow(null);
      setExecutionProgress(0);
      
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

  const createWorkflow = useCallback(async (instruction) => {
    try {
      const response = await axios.post(`${backendUrl}/api/workflow/create`, {
        instruction,
        session_id: sessionId,
        workflow_type: 'general'
      });

      const workflow = response.data.workflow;
      
      // Add to workflows list
      setWorkflows(prev => [workflow, ...prev]);
      
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

  const getWorkflowHistory = useCallback(() => {
    return workflows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [workflows]);

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
    executeWorkflow,
    workflows,
    activeWorkflow,
    isExecuting,
    executionProgress,
    getWorkflowHistory
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};