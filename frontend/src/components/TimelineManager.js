import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Globe, 
  Zap, 
  Search, 
  MessageSquare, 
  Play, 
  Pause,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share
} from 'lucide-react';

const TimelineManager = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Mock timeline data - in real implementation this would come from context/API
  const [timelineData, setTimelineData] = useState([
    {
      id: 1,
      type: 'navigation',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      title: 'Visited LinkedIn',
      url: 'https://linkedin.com/in/ai-engineers',
      description: 'Researched AI engineers profiles',
      icon: Globe,
      status: 'completed',
      data: {
        results: 15,
        timeSpent: '3m 42s'
      }
    },
    {
      id: 2,
      type: 'workflow',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      title: 'Social Media Monitoring',
      description: 'Automated Twitter, LinkedIn monitoring for Emergent AI mentions',
      icon: Zap,
      status: 'running',
      data: {
        progress: 75,
        platforms: ['Twitter', 'LinkedIn', 'Reddit'],
        mentions: 23
      }
    },
    {
      id: 3,
      type: 'chat',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      title: 'AI Conversation',
      description: 'Discussed browser automation strategies',
      icon: MessageSquare,
      status: 'completed',
      data: {
        messages: 8,
        topics: ['automation', 'browser', 'AI']
      }
    },
    {
      id: 4,
      type: 'research',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      title: 'Competitive Analysis Report',
      description: 'Generated comprehensive analysis of browser automation tools',
      icon: Search,
      status: 'completed',
      data: {
        competitors: 5,
        insights: 12,
        reportLength: '2,400 words'
      }
    }
  ]);

  const timeframes = [
    { id: 'today', label: 'Today', filter: (item) => isToday(item.timestamp) },
    { id: 'yesterday', label: 'Yesterday', filter: (item) => isYesterday(item.timestamp) },
    { id: 'week', label: 'This Week', filter: (item) => isThisWeek(item.timestamp) },
    { id: 'month', label: 'This Month', filter: (item) => isThisMonth(item.timestamp) }
  ];

  function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  function isThisWeek(date) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return date >= oneWeekAgo;
  }

  function isThisMonth(date) {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  const filteredTimeline = timelineData.filter(
    timeframes.find(tf => tf.id === selectedTimeframe)?.filter || (() => true)
  );

  const resumeTimelineItem = (item) => {
    console.log(`Resuming timeline item: ${item.title}`);
    // In real implementation, this would restore the exact state
    // Navigate to the URL, restore chat context, resume workflow, etc.
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-primary-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />;
      case 'completed': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'failed': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Timeline Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-white">Timeline</h2>
          </div>
          <div className="text-xs text-gray-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <motion.button
              key={timeframe.id}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedTimeframe === timeframe.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {timeframe.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {filteredTimeline.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Timeline connector */}
              {index < filteredTimeline.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-8 bg-dark-600"></div>
              )}

              <div className="flex gap-4">
                {/* Timeline dot and icon */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-dark-700 border-2 border-dark-600 flex items-center justify-center ${getStatusColor(item.status)}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon(item.status)}
                  </div>
                </div>

                {/* Timeline content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 group-hover:border-dark-600 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-white text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Item-specific data */}
                    <div className="text-xs text-gray-400 mb-3">
                      {item.type === 'navigation' && (
                        <div className="flex gap-4">
                          <span>Results: {item.data.results}</span>
                          <span>Time: {item.data.timeSpent}</span>
                        </div>
                      )}
                      {item.type === 'workflow' && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-dark-700 rounded-full h-1">
                              <div 
                                className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${item.data.progress}%` }}
                              ></div>
                            </div>
                            <span>{item.data.progress}%</span>
                          </div>
                          <div className="flex gap-2">
                            {item.data.platforms.map((platform) => (
                              <span key={platform} className="px-2 py-1 bg-dark-700 rounded text-xs">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.type === 'chat' && (
                        <div className="flex gap-4">
                          <span>Messages: {item.data.messages}</span>
                          <span>Topics: {item.data.topics.join(', ')}</span>
                        </div>
                      )}
                      {item.type === 'research' && (
                        <div className="flex gap-4">
                          <span>Competitors: {item.data.competitors}</span>
                          <span>Insights: {item.data.insights}</span>
                          <span>{item.data.reportLength}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex gap-2"
                        >
                          <motion.button
                            className="btn-primary px-3 py-1 text-xs"
                            onClick={() => resumeTimelineItem(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play size={12} className="mr-1" />
                            Resume
                          </motion.button>
                          <motion.button
                            className="btn-secondary px-3 py-1 text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Bookmark size={12} className="mr-1" />
                            Save
                          </motion.button>
                          <motion.button
                            className="btn-secondary px-3 py-1 text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Share size={12} className="mr-1" />
                            Share
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTimeline.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No timeline entries for {timeframes.find(tf => tf.id === selectedTimeframe)?.label.toLowerCase()}</p>
          </div>
        )}
      </div>

      {/* Timeline Navigation */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {filteredTimeline.length} items in timeline
          </div>
          <div className="flex gap-2">
            <motion.button
              className="p-2 hover:bg-dark-700 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} className="text-gray-400" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-dark-700 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight size={16} className="text-gray-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineManager;