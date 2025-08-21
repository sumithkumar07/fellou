import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { Bot, User, Send, X } from 'lucide-react';
import { ChatMessageSkeleton } from './LoadingSkeleton';
import { useFocusManagement } from '../hooks/useAccessibility';
import useResponsive from '../hooks/useResponsive';

const ExpandableChatPanel = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const { messages, isLoading, sendMessage } = useAI();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const { trapFocus, announceToScreenReader } = useFocusManagement();
  const { isMobile, isTablet } = useResponsive();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const cleanup = trapFocus(panelRef);
      announceToScreenReader('Chat panel opened');
      return cleanup;
    }
  }, [isOpen, trapFocus, announceToScreenReader]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    try {
      await sendMessage(message);
      announceToScreenReader('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      announceToScreenReader('Failed to send message');
    }
  };

  // Calculate panel dimensions based on viewport
  const getPanelWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return 320;
    return 380;
  };

  const getPanelPosition = () => {
    if (isMobile) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 60, // Account for bottom navigation
        zIndex: 60
      };
    }
    return {};
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={onClose}
            />
          )}

          <motion.div
            ref={panelRef}
            initial={{ 
              width: isMobile ? '100%' : 0, 
              opacity: 0,
              x: isMobile ? 0 : -100
            }}
            animate={{ 
              width: getPanelWidth(), 
              opacity: 1,
              x: 0
            }}
            exit={{ 
              width: isMobile ? '100%' : 0, 
              opacity: 0,
              x: isMobile ? 0 : -100
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`bg-dark-900 border-r border-dark-700 flex flex-col ${
              isMobile ? 'fixed inset-0 z-60' : 'h-full'
            }`}
            style={getPanelPosition()}
            role="dialog"
            aria-label="Chat with Fellou AI"
            aria-modal="true"
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
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="text-center mt-8">
                  <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bot size={24} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Hi! I'm Fellou, your AI assistant. How can I help you today?
                  </p>
                  
                  {/* Quick suggestion buttons */}
                  <div className="space-y-2">
                    {[
                      'Create a lead generation workflow',
                      'Help me automate social media research',
                      'Show me my workflow history'
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
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

              {isLoading && <ChatMessageSkeleton />}
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
                  aria-label="Type your message"
                />
                <motion.button
                  type="submit"
                  className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors min-w-[40px] min-h-[40px]"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExpandableChatPanel;