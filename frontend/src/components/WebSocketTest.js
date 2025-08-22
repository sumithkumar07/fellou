import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WebSocketTest = () => {
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [logs, setLogs] = useState([]);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const testSessionId = 'test-websocket-session';

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { 
      id: Date.now(), 
      message, 
      type, 
      timestamp 
    }].slice(-20)); // Keep only last 20 logs
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      const wsBaseUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const wsUrl = `${wsBaseUrl}/api/ws/${testSessionId}`;
      
      addLog(`Attempting to connect to: ${wsUrl}`, 'info');
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        addLog('WebSocket connected successfully!', 'success');
        setConnectionStatus('Connected');
        setWsConnection(ws);
        
        // Send initial ping
        ws.send(JSON.stringify({ type: 'ping' }));
        addLog('Sent initial ping', 'info');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`Received: ${JSON.stringify(data)}`, 'success');
          
          if (data.type === 'pong') {
            addLog('Received pong response', 'success');
          } else if (data.type === 'workflow_progress') {
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'progress',
              content: data.message,
              progress: data.progress,
              timestamp: new Date().toLocaleTimeString()
            }]);
          } else if (data.type === 'browser_action_result') {
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'browser_result',
              content: 'Browser action completed',
              result: data.result,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        } catch (error) {
          addLog(`Error parsing message: ${error.message}`, 'error');
        }
      };
      
      ws.onclose = (event) => {
        addLog(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`, 'warning');
        setConnectionStatus('Disconnected');
        setWsConnection(null);
      };
      
      ws.onerror = (error) => {
        addLog(`WebSocket error: ${error}`, 'error');
        setConnectionStatus('Error');
      };
      
    } catch (error) {
      addLog(`Connection error: ${error.message}`, 'error');
      setConnectionStatus('Error');
    }
  }, [backendUrl, testSessionId, addLog]);

  const disconnectWebSocket = useCallback(() => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
      setConnectionStatus('Disconnected');
      addLog('WebSocket disconnected manually', 'info');
    }
  }, [wsConnection, addLog]);

  const sendMessage = useCallback(() => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN && inputMessage.trim()) {
      try {
        const message = JSON.parse(inputMessage);
        wsConnection.send(JSON.stringify(message));
        addLog(`Sent: ${inputMessage}`, 'info');
        setInputMessage('');
      } catch (error) {
        // Send as simple message if not valid JSON
        wsConnection.send(JSON.stringify({
          type: 'message',
          content: inputMessage
        }));
        addLog(`Sent simple message: ${inputMessage}`, 'info');
        setInputMessage('');
      }
    }
  }, [wsConnection, inputMessage, addLog]);

  const sendTestMessages = useCallback(() => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      // Test different message types
      const testMessages = [
        { type: 'ping' },
        { type: 'workflow_progress' },
        { type: 'browser_action', tab_id: 'test-tab', action_type: 'screenshot' },
        { type: 'test_message', content: 'Hello WebSocket!' }
      ];

      testMessages.forEach((msg, index) => {
        setTimeout(() => {
          wsConnection.send(JSON.stringify(msg));
          addLog(`Sent test message ${index + 1}: ${JSON.stringify(msg)}`, 'info');
        }, index * 1000);
      });
    }
  }, [wsConnection, addLog]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return 'text-green-400';
      case 'Disconnected': return 'text-red-400';
      case 'Error': return 'text-red-500';
      default: return 'text-yellow-400';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">WebSocket Connection Test</h1>
          <p className="text-gray-400">Test real-time WebSocket functionality for workflow progress updates</p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
              <p className={`text-lg ${getStatusColor()}`}>
                Status: {connectionStatus}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Endpoint: {backendUrl}/api/ws/{testSessionId}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={connectWebSocket}
                disabled={connectionStatus === 'Connected'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Connect
              </button>
              <button
                onClick={disconnectWebSocket}
                disabled={connectionStatus === 'Disconnected'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={sendTestMessages}
                disabled={connectionStatus !== 'Connected'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Send Test Messages
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Message Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Send Message</h2>
            <div className="space-y-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder='Enter JSON message (e.g., {"type": "ping"}) or plain text'
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={connectionStatus !== 'Connected' || !inputMessage.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Send Message
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Ping', message: '{"type": "ping"}' },
                  { label: 'Workflow Progress', message: '{"type": "workflow_progress"}' },
                  { label: 'Browser Action', message: '{"type": "browser_action", "tab_id": "test", "action_type": "screenshot"}' },
                  { label: 'Custom Message', message: '{"type": "custom", "data": "test"}' }
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInputMessage(action.message)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Logs */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Logs</h2>
            <div className="bg-gray-900 rounded p-4 h-80 overflow-y-auto font-mono text-sm">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-2 ${getLogColor(log.type)}`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <p className="text-gray-500 italic">No logs yet. Click Connect to start testing.</p>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Messages */}
        {messages.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Real-time Messages</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-blue-400 font-medium">{message.type.toUpperCase()}</span>
                      <span className="text-gray-400 text-sm">{message.timestamp}</span>
                    </div>
                    <p className="text-white mb-2">{message.content}</p>
                    
                    {message.progress !== undefined && (
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${message.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {message.result && (
                      <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(message.result, null, 2)}
                      </pre>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketTest;