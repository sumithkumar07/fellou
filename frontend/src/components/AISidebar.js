import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Settings, History, Zap, Bot, User, Send, X } from 'lucide-react';

const AISidebar = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showChat, setShowChat] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage } = useAI();
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

  const tabs = [
    { id: 'chat', icon: MessageSquare, label: 'AI Chat', tooltip: 'Chat with Fellou AI' },
    { id: 'workflows', icon: Zap, label: 'Workflows', tooltip: 'Workflow Automation' },
    { id: 'history', icon: History, label: 'History', tooltip: 'Chat History' },
    { id: 'settings', icon: Settings, label: 'Settings', tooltip: 'Settings & Preferences' },
  ];

  return (
    <>
      {/* Compact Icon Sidebar */}
      <div className="h-full w-full bg-dark-800 flex flex-col items-center py-4">
        {/* Brand Logo */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-3 flex-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'chat') {
                  setShowChat(true);
                }
              }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={tab.tooltip}
            >
              <tab.icon size={18} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-dark-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {tab.tooltip}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Close Sidebar"
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* Expandable Chat Panel */}
      <AnimatePresence>
        {showChat && activeTab === 'chat' && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full bg-dark-900 border-r border-dark-700 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-medium text-white">Fellou AI</h2>
                  <p className="text-xs text-gray-400">Your AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center mt-8">
                  <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bot size={24} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Hi! I'm Fellou, your AI assistant. How can I help you today?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md p-3' 
                      : 'bg-dark-700 text-gray-100 rounded-r-2xl rounded-tl-2xl rounded-bl-md p-3 border border-dark-600'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={14} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-dark-700 border border-dark-600 rounded-r-2xl rounded-tl-2xl rounded-bl-md p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-dark-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-dark-700 border border-dark-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={16} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AISidebar;