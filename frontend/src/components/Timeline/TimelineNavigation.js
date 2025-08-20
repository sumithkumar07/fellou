import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock, 
  History,
  Bookmark,
  Settings,
  Maximize2,
  Filter,
  Calendar
} from 'lucide-react';

const TimelineNavigation = ({ onTimelineChange, sessions = [], currentSession = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);

  // Mock timeline data - in real implementation from context/API
  const [timelineEntries, setTimelineEntries] = useState([
    {
      id: 1,
      timestamp: 0,
      type: 'navigation',
      title: 'Visited LinkedIn',
      description: 'Navigated to LinkedIn profiles',
      thumbnail: '/api/placeholder/40/30',
      duration: 15
    },
    {
      id: 2, 
      timestamp: 20,
      type: 'workflow',
      title: 'Started Twitter Search',
      description: 'Initiated social media monitoring',
      thumbnail: '/api/placeholder/40/30',
      duration: 25
    },
    {
      id: 3,
      timestamp: 45,
      type: 'chat',
      title: 'AI Conversation',
      description: 'Discussed automation strategies',
      thumbnail: '/api/placeholder/40/30', 
      duration: 20
    },
    {
      id: 4,
      timestamp: 70,
      type: 'report',
      title: 'Generated Report',
      description: 'Created comprehensive analysis',
      thumbnail: '/api/placeholder/40/30',
      duration: 15
    }
  ]);

  // Playback controls
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + playbackSpeed;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (event) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
    
    // Find nearest timeline entry
    const nearestEntry = timelineEntries.reduce((prev, curr) => 
      Math.abs(curr.timestamp - newTime) < Math.abs(prev.timestamp - newTime) ? curr : prev
    );
    
    if (onTimelineChange) {
      onTimelineChange(nearestEntry);
    }
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
  };

  const jumpToEntry = (entry) => {
    setCurrentTime(entry.timestamp);
    if (onTimelineChange) {
      onTimelineChange(entry);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEntryIcon = (type) => {
    const icons = {
      navigation: '🌐',
      workflow: '⚡',
      chat: '💬',
      report: '📊',
      search: '🔍'
    };
    return icons[type] || '📄';
  };

  const filteredEntries = timelineEntries.filter(entry => {
    if (selectedFilter === 'all') return true;
    return entry.type === selectedFilter;
  });

  return (
    <div className={`bg-dark-800 border-t border-dark-700 transition-all duration-300 ${
      isExpanded ? 'h-64' : 'h-16'
    }`}>
      {/* Main Timeline Bar */}
      <div className="h-16 flex items-center px-4 gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleSkipBack}
            className="p-2 hover:bg-dark-700 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack size={16} className="text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={handlePlayPause}
            className={`p-2 rounded-lg ${
              isPlaying ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </motion.button>
          
          <motion.button
            onClick={handleSkipForward}
            className="p-2 hover:bg-dark-700 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward size={16} className="text-gray-400" />
          </motion.button>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
          <Clock size={14} />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 mx-4">
          <div 
            ref={timelineRef}
            className="relative h-6 bg-dark-700 rounded-full cursor-pointer group"
            onClick={handleTimelineClick}
          >
            {/* Progress Bar */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Timeline Entries */}
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-dark-800 cursor-pointer hover:scale-150 transition-transform"
                style={{ left: `${(entry.timestamp / duration) * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToEntry(entry);
                }}
                whileHover={{ scale: 1.5 }}
                title={`${entry.title} - ${formatTime(entry.timestamp)}`}
              />
            ))}

            {/* Current Time Indicator */}
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full shadow-lg"
              style={{ left: `${(currentTime / duration) * 100}%` }}
              animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 1 }}
            />
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center gap-2">
          {/* Playback Speed */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-dark-700 text-gray-300 text-sm px-2 py-1 rounded border border-dark-600"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          {/* Filter */}
          <motion.button
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'workflow' : 'all')}
            className={`p-2 rounded-lg ${
              selectedFilter !== 'all' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-dark-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Filter size={14} />
          </motion.button>

          {/* Expand Timeline */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg ${
              isExpanded ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-dark-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <History size={14} />
          </motion.button>
        </div>
      </div>

      {/* Expanded Timeline View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-dark-700 p-4"
          >
            {/* Timeline Entries List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-dark-700 border rounded-lg p-3 cursor-pointer hover:border-primary-500 transition-colors ${
                    Math.abs(currentTime - entry.timestamp) < 5 ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600'
                  }`}
                  onClick={() => jumpToEntry(entry)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getEntryIcon(entry.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm truncate">{entry.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{entry.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTime(entry.timestamp)}</span>
                        <span>{entry.duration}s</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Session Management */}
            <div className="mt-4 pt-4 border-t border-dark-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">Session History</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    className="btn-secondary px-3 py-1 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bookmark size={12} className="mr-1" />
                    Save Session
                  </motion.button>
                  <motion.button
                    className="btn-secondary px-3 py-1 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings size={12} className="mr-1" />
                    Settings
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineNavigation;