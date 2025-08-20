import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap,
  ArrowRight,
  Command
} from 'lucide-react';

const SmartAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "What would you like Fellou to do?",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Smart suggestions database - mimics Fellou's intelligence
  const suggestionTemplates = [
    {
      category: "Research & Analysis",
      suggestions: [
        {
          text: "Research AI trends in 2025 and create a comprehensive report",
          description: "Analyze latest AI developments, funding, and market trends",
          complexity: "Medium",
          estimatedTime: "15-20 min",
          platforms: ["Web Research", "AI Analysis", "Report Gen"],
          keywords: ["research", "ai", "trends", "report", "analysis"]
        },
        {
          text: "Find and analyze recent discussions about {topic} on social media",
          description: "Monitor conversations across Twitter, LinkedIn, Reddit",
          complexity: "Simple",
          estimatedTime: "5-8 min",
          platforms: ["Twitter", "LinkedIn", "Reddit"],
          keywords: ["find", "analyze", "discussions", "social", "media"]
        },
        {
          text: "Create competitive analysis of {industry} companies",
          description: "Research competitors, market position, strengths/weaknesses",
          complexity: "Complex",
          estimatedTime: "25-30 min",
          platforms: ["Web Research", "Company Data", "Analysis"],
          keywords: ["competitive", "analysis", "companies", "market"]
        }
      ]
    },
    {
      category: "Social Media & Outreach",
      suggestions: [
        {
          text: "Monitor mentions of {brand} across all social platforms",
          description: "Track brand mentions, sentiment, engagement metrics",
          complexity: "Simple",
          estimatedTime: "3-5 min",
          platforms: ["Twitter", "LinkedIn", "Facebook", "Reddit"],
          keywords: ["monitor", "mentions", "brand", "social", "platforms"]
        },
        {
          text: "Find and connect with {job_title} professionals on LinkedIn",
          description: "Search profiles, send personalized connection requests",
          complexity: "Medium",
          estimatedTime: "10-15 min",
          platforms: ["LinkedIn"],
          keywords: ["find", "connect", "professionals", "linkedin"]
        },
        {
          text: "Automate posting {content} across multiple social channels",
          description: "Schedule and publish content with platform optimization",
          complexity: "Simple",
          estimatedTime: "2-3 min",
          platforms: ["Twitter", "LinkedIn", "Facebook"],
          keywords: ["automate", "posting", "content", "social", "channels"]
        }
      ]
    },
    {
      category: "Data & Automation",
      suggestions: [
        {
          text: "Extract and organize data from {website} into spreadsheet",
          description: "Web scraping with intelligent data structuring",
          complexity: "Medium",
          estimatedTime: "8-12 min",
          platforms: ["Web Scraping", "Data Processing"],
          keywords: ["extract", "organize", "data", "website", "spreadsheet"]
        },
        {
          text: "Set up automated email campaign for {target_audience}",
          description: "Create personalized email sequences with tracking",
          complexity: "Complex",
          estimatedTime: "20-25 min",
          platforms: ["Email", "CRM", "Analytics"],
          keywords: ["automated", "email", "campaign", "audience"]
        },
        {
          text: "Generate weekly performance report from {data_sources}",
          description: "Collect, analyze, and visualize performance metrics",
          complexity: "Medium",
          estimatedTime: "12-15 min",
          platforms: ["Analytics", "Data Viz", "Report Gen"],
          keywords: ["generate", "performance", "report", "weekly"]
        }
      ]
    }
  ];

  // Intelligent suggestion matching
  const getRelevantSuggestions = (input) => {
    if (!input || input.length < 2) return [];

    const inputLower = input.toLowerCase();
    const words = inputLower.split(/\s+/);
    
    const allSuggestions = suggestionTemplates.flatMap(cat => 
      cat.suggestions.map(s => ({ ...s, category: cat.category }))
    );

    // Score suggestions based on keyword matching
    const scoredSuggestions = allSuggestions
      .map(suggestion => {
        let score = 0;
        
        // Exact phrase matching (highest score)
        if (suggestion.text.toLowerCase().includes(inputLower)) {
          score += 100;
        }
        
        // Keyword matching
        words.forEach(word => {
          if (word.length > 2) {
            suggestion.keywords.forEach(keyword => {
              if (keyword.includes(word) || word.includes(keyword)) {
                score += 20;
              }
            });
            
            // Description matching
            if (suggestion.description.toLowerCase().includes(word)) {
              score += 10;
            }
          }
        });
        
        // Category bonus for relevant categories
        if (inputLower.includes('social') && suggestion.category.includes('Social')) score += 15;
        if (inputLower.includes('research') && suggestion.category.includes('Research')) score += 15;
        if (inputLower.includes('data') && suggestion.category.includes('Data')) score += 15;
        
        return { ...suggestion, score };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return scoredSuggestions;
  };

  // Update suggestions when input changes
  useEffect(() => {
    const updateSuggestions = async () => {
      if (value.length > 2) {
        setIsAnalyzing(true);
        
        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const relevant = getRelevantSuggestions(value);
        setSuggestions(relevant);
        setShowSuggestions(relevant.length > 0);
        setIsAnalyzing(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    updateSuggestions();
  }, [value]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        inputRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showSuggestions, selectedIndex, suggestions]);

  const handleSuggestionSelect = (suggestion) => {
    const processedText = suggestion.text.replace(/{[^}]+}/g, (match) => {
      // Replace placeholders with user-friendly prompts
      const placeholder = match.slice(1, -1);
      return `[${placeholder}]`;
    });
    
    onChange(processedText);
    onSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Simple': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Complex': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white text-lg placeholder-gray-400 outline-none pr-8"
          onFocus={() => value.length > 2 && setShowSuggestions(suggestions.length > 0)}
        />
        
        {/* Analysis Indicator */}
        {isAnalyzing && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={16} className="text-primary-500" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-3 border-b border-dark-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles size={14} className="text-primary-500" />
                <span>AI-Powered Suggestions</span>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    selectedIndex === index 
                      ? 'bg-primary-500/10 border-l-2 border-primary-500' 
                      : 'hover:bg-dark-700 border-l-2 border-transparent'
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      {suggestion.category.includes('Research') ? '🔍' :
                       suggestion.category.includes('Social') ? '📱' : '⚡'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white text-sm leading-tight">
                          {suggestion.text}
                        </h4>
                        <ArrowRight size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{suggestion.estimatedTime}</span>
                        </div>
                        
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getComplexityColor(suggestion.complexity)}`}>
                          {suggestion.complexity}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{suggestion.platforms.length} platforms</span>
                        </div>
                      </div>
                      
                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.platforms.slice(0, 3).map((platform, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-dark-700 text-gray-300 px-2 py-0.5 rounded"
                          >
                            {platform}
                          </span>
                        ))}
                        {suggestion.platforms.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{suggestion.platforms.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-dark-700 bg-dark-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Command size={12} />
                  <span>Use arrow keys to navigate</span>
                </div>
                <span>{suggestions.length} suggestions</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartAutocomplete;