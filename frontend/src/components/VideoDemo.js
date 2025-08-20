import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const VideoDemo = ({ title, description, videoSrc, thumbnail }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Video container matching Fellou's style */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl overflow-hidden border border-dark-600">
        {isPlaying ? (
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
          />
        ) : (
          <>
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={24} className="text-white ml-1" />
              </motion.div>
            </div>
          </>
        )}
      </div>
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default VideoDemo;