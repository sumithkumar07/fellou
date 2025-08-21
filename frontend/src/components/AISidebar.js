import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Bot, User, Send, X } from 'lucide-react';

const AISidebar = ({ onClose }) => {
  const [showChat, setShowChat] = useState(true); // Start with chat open
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



  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-dark-900 border-l border-dark-700 flex flex-col shadow-2xl overflow-hidden"
    >
        {/* Chat Header with Close Button */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Fellou AI</h2>
              <p className="text-xs text-gray-400">Your AI Assistant</p>
            </div>
          </div>
          
          {/* Windows-style Close Button (X) */}
          <motion.button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Close Fellou Assistant"
          >
            <X size={16} />
          </motion.button>
        </div>



        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center mt-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot size={24} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Welcome to Fellou AI!</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      I'm your AI-powered browser assistant. I can help you with web browsing, research, workflows, and much more!
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Ask me to navigate to websites</p>
                      <p>• Create automated workflows</p>
                      <p>• Research topics and analyze content</p>
                      <p>• Manage your browsing experience</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-l-xl rounded-tr-xl rounded-br-md p-3' 
                        : 'bg-dark-700 text-gray-100 rounded-r-xl rounded-tl-xl rounded-bl-md p-3 border border-dark-600'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-7 h-7 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-dark-700 border border-dark-600 rounded-r-xl rounded-tl-xl rounded-bl-md p-3">
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
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    className="bg-blue-500 text-white rounded-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    disabled={!inputMessage.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={16} />
                  </motion.button>
                </form>
              </div>
            </div>
        </div>
      </motion.div>

      {/* Overlay to close sidebar by clicking outside */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 -z-10" 
        onClick={onClose}
      />
    </div>
  );
};

export default AISidebar;