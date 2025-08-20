import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { 
  MessageSquare, 
  Zap, 
  History, 
  Settings,
  Send,
  Bot,
  User,
  Workflow,
  Play,
  Clock,
  CheckCircle
} from 'lucide-react';

const AISidebar = ({ width, onResize }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage } = useAI();
  const { workflows, createWorkflow, executeWorkflow, isExecuting } = useWorkflow();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateWorkflow = async (instruction) => {
    try {
      const workflow = await createWorkflow(instruction, 'default-session');
      setActiveTab('workflows');
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const sidebarTabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="h-full flex flex-col bg-dark-800" style={{ width }}>
      {/* Sidebar header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Fellou AI</h2>
            <p className="text-xs text-gray-400">Your agentic assistant</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-dark-700">
        {sidebarTabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex-1 p-3 text-xs flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id 
                ? 'text-primary-500 bg-primary-500/10 border-b-2 border-primary-500' 
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-8">
                    <Bot size={32} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Ask me anything or describe a task you'd like me to automate!</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="bg-dark-700 p-2 rounded-lg">
                        "Find LinkedIn profiles of browser engineers"
                      </div>
                      <div className="bg-dark-700 p-2 rounded-lg">
                        "Research AI tools and create a report"
                      </div>
                      <div className="bg-dark-700 p-2 rounded-lg">
                        "Monitor Twitter for mentions of our product"
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <div className="p-4 border-t border-dark-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe what you want me to do..."
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputMessage.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={14} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'workflows' && (
            <motion.div
              key="workflows"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Workflows</h3>
                <motion.button
                  className="text-xs bg-primary-500 text-white px-2 py-1 rounded"
                  onClick={() => setActiveTab('chat')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create New
                </motion.button>
              </div>

              <div className="space-y-3 overflow-y-auto">
                {workflows.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <Zap size={32} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No workflows yet. Start by chatting with AI!</p>
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <motion.div
                      key={workflow.workflow_id}
                      className="workflow-step cursor-pointer"
                      onClick={() => executeWorkflow(workflow.workflow_id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white mb-1">
                            {workflow.title}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {workflow.steps?.length || 0} steps • {workflow.estimated_credits || 0} credits
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          {workflow.status === 'completed' ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : workflow.status === 'running' ? (
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Play size={14} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 p-4"
            >
              <h3 className="font-medium text-white mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="text-center text-gray-400 mt-8">
                  <Clock size={32} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Your browsing timeline will appear here</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 p-4"
            >
              <h3 className="font-medium text-white mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">AI Model</label>
                  <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white">
                    <option>Llama 3.1 70B (Groq)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Credits Remaining</label>
                  <div className="bg-dark-700 border border-dark-600 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary-500">4,750</div>
                    <div className="text-xs text-gray-400">Monthly limit: 5,000</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AISidebar;