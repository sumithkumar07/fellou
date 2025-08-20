import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../../contexts/AIContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { 
  Search, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Clock,
  TrendingUp,
  Globe,
  Brain,
  Target,
  Mic,
  Camera,
  Send,
  Wand2
} from 'lucide-react';

const CentralCommandInterface = ({ isActive, onWorkflowStart }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef(null);
  const { sendMessage, isLoading } = useAI();
  const { createWorkflow } = useWorkflow();

  // Featured example commands - exactly like Fellou.ai
  const featuredCommands = [
    {
      id: 1,
      title: 'JD Consolidation and Resume Optimization',
      description: 'Consolidate two companies\' JD duties/skills and suggest resume revisions.',
      icon: '📄',
      category: 'Career',
      estimatedTime: '5-8 min',
      complexity: 'Medium',
      platforms: ['LinkedIn', 'Indeed', 'AI Analysis']
    },
    {
      id: 2,
      title: 'Batch Twitter Account Following',
      description: 'Follow all Twitter accounts listed in the webpage or spreadsheet (~60 accounts).',
      icon: '🐦',
      category: 'Social Media',
      estimatedTime: '3-5 min',
      complexity: 'Simple',
      platforms: ['Twitter', 'Spreadsheet']
    },
    {
      id: 3,
      title: 'Social Media Outreach & Promotion',
      description: 'Find recent browser-related posts, comment and recommend Fellou AI on major platforms.',
      icon: '📱',
      category: 'Marketing',
      estimatedTime: '10-15 min',
      complexity: 'Complex',
      platforms: ['Twitter', 'LinkedIn', 'Reddit']
    },
    {
      id: 4,
      title: 'LinkedIn Developer Recruitment',
      description: 'Identify three Agent developers, message to introduce Fellou and invite to join.',
      icon: '👥',
      category: 'Recruitment',
      estimatedTime: '8-12 min',
      complexity: 'Medium',
      platforms: ['LinkedIn', 'Email']
    },
    {
      id: 5,
      title: 'Research AI Trends & Generate Report',
      description: 'Aggregate AI trends from top 20 Silicon Valley VC websites, including investments and progress.',
      icon: '🧠',
      category: 'Research',
      estimatedTime: '15-20 min',
      complexity: 'Complex',
      platforms: ['Web Scraping', 'AI Analysis', 'Report Gen']
    },
    {
      id: 6,
      title: 'Tesla Revenue Analysis',
      description: 'Retrieve Tesla\'s revenue, EBITDA, and shipments for the past 12 quarters.',
      icon: '📊',
      category: 'Finance',
      estimatedTime: '3-5 min',
      complexity: 'Simple',
      platforms: ['Financial APIs', 'Data Analysis']
    }
  ];

  // Smart suggestions based on input
  const smartSuggestions = [
    'Find and analyze recent discussions about AI agents on Twitter and LinkedIn',
    'Create a competitive analysis report for browser automation tools',
    'Monitor mentions of our product across social platforms and compile feedback',
    'Research the latest funding rounds in AI startup space',
    'Generate a comprehensive report on voice AI market trends',
    'Automate posting our latest blog post across all social media platforms'
  ];

  useEffect(() => {
    if (input.length > 3) {
      const filtered = smartSuggestions.filter(s => 
        s.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSubmit = async (command = input) => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Create and execute workflow
      const workflow = await createWorkflow(command);
      if (workflow) {
        onWorkflowStart?.(workflow);
        await sendMessage(`Execute: ${command}`);
      }
    } catch (error) {
      console.error('Command execution error:', error);
    } finally {
      setIsProcessing(false);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Simple': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Complex': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Main Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap size={40} className="text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-5xl font-bold gradient-text">Try Deep Search</h1>
                <p className="text-gray-400 text-lg">Express ideas, Fellou acts</p>
              </div>
            </div>
          </motion.div>

          {/* Main Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="relative">
              <div className={`relative bg-dark-800 border-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-dark-600'
              }`}>
                <div className="flex items-center p-4">
                  <Search size={24} className="text-gray-400 mr-4" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="What would you like Fellou to do? Try: 'Research AI trends and create a report'"
                    className="flex-1 bg-transparent text-white text-lg placeholder-gray-400 outline-none"
                    disabled={isProcessing || isLoading}
                  />
                  
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-dark-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mic size={20} />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleSubmit()}
                      disabled={!input.trim() || isProcessing || isLoading}
                      className={`p-3 rounded-xl transition-all ${
                        input.trim() && !isProcessing
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                          : 'bg-dark-700 text-gray-400'
                      }`}
                      whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                    >
                      {isProcessing || isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Smart Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50"
                  >
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <motion.button
                        key={index}
                        className="w-full p-3 text-left hover:bg-dark-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => {
                          setInput(suggestion);
                          setShowSuggestions(false);
                          handleSubmit(suggestion);
                        }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles size={16} className="text-primary-500" />
                          <span className="text-gray-300">{suggestion}</span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-8 mb-12 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span>3.1x faster than OpenAI</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              <span>50+ platform integrations</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <span>90% research time reduction</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Commands Grid */}
      <div className="px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            Popular Workflows • Ready to Execute
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredCommands.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all cursor-pointer group"
                onClick={() => handleSubmit(command.description)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl flex-shrink-0">{command.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-primary-500 transition-colors">
                      {command.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {command.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-gray-400">{command.estimatedTime}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getComplexityColor(command.complexity)}`}>
                      <Target size={12} />
                      <span>{command.complexity}</span>
                    </div>
                  </div>
                  <span className="bg-primary-500/10 text-primary-500 px-2 py-1 rounded-full">
                    {command.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {command.platforms.map((platform, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary-500 text-sm group-hover:gap-3 transition-all">
                    <Wand2 size={16} />
                    <span>Try it now</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CentralCommandInterface;