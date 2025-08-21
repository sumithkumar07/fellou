import { useState, useEffect } from 'react';

const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
};

export const useResponsive = () => {
  const [viewport, setViewport] = useState('desktop');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < breakpoints.mobile) {
        setViewport('mobile');
      } else if (width < breakpoints.tablet) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    viewport,
    windowSize,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    isMobileOrTablet: viewport === 'mobile' || viewport === 'tablet'
  };
};

export default useResponsive;