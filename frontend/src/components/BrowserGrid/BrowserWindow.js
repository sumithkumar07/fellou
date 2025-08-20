import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrowser } from '../../contexts/BrowserContext';
import { 
  Globe, 
  Lock, 
  AlertCircle, 
  Loader, 
  Maximize2, 
  Minimize2, 
  X,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Home,
  Star
} from 'lucide-react';

const BrowserWindow = ({ window, isActive, onNavigate, onActivate }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState(null);
  const [error, setError] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const { navigateToUrl } = useBrowser();
  const iframeRef = useRef(null);

  useEffect(() => {
    if (window.url && window.url !== 'about:blank') {
      setUrlInput(window.url);
      loadPage(window.url);
    }
  }, [window.url]);

  const loadPage = async (url) => {
    if (!url || url === 'about:blank') return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate real browser navigation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Handle special URLs
      if (url.startsWith('emergent://')) {
        setPageContent({
          type: 'special',
          url: url,
          title: window.title,
          content: renderSpecialPage(url)
        });
        onNavigate(url, window.title);
        return;
      }

      // Simulate real web content
      const mockContent = generateMockWebContent(url);
      setPageContent(mockContent);
      onNavigate(url, mockContent.title);

    } catch (err) {
      setError(err.message);
      setPageContent({
        type: 'error',
        url: url,
        title: 'Error loading page',
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockWebContent = (url) => {
    // Extract domain from URL
    let domain;
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    const templates = {
      'github.com': {
        title: 'GitHub - Open Source Projects',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; padding: 20px;">
            <div style="max-width: 1200px; margin: 0 auto;">
              <div style="background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 24px; margin-bottom: 20px;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">🚀 Featured Repository</h1>
                <p style="margin: 0 0 16px 0; color: #8b949e;">A collection of awesome open source projects</p>
                <div style="display: flex; gap: 16px; margin-top: 20px;">
                  <span style="background: #238636; color: #fff; padding: 4px 8px; border-radius: 12px; font-size: 12px;">JavaScript</span>
                  <span style="background: #1f6feb; color: #fff; padding: 4px 8px; border-radius: 12px; font-size: 12px;">TypeScript</span>
                  <span style="color: #f85149;">⭐ 15.2k</span>
                  <span style="color: #8b949e;">🍴 3.4k</span>
                </div>
              </div>
              <div style="background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Recent Activity</h2>
                <div style="space-y: 12px;">
                  <div style="padding: 12px; background: #161b22; border-radius: 4px; margin-bottom: 8px;">
                    <strong>feat:</strong> Added new browser automation features
                    <div style="color: #8b949e; font-size: 14px; margin-top: 4px;">2 hours ago • main branch</div>
                  </div>
                  <div style="padding: 12px; background: #161b22; border-radius: 4px;">
                    <strong>fix:</strong> Improved performance for large datasets
                    <div style="color: #8b949e; font-size: 14px; margin-top: 4px;">5 hours ago • develop branch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      'twitter.com': {
        title: 'Home / Twitter',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #000; color: #e7e9ea; min-height: 100vh; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="border-bottom: 1px solid #2f3336; padding: 20px 0;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Home</h1>
              </div>
              <div style="margin-top: 20px;">
                <div style="border-bottom: 1px solid #2f3336; padding: 20px 0;">
                  <div style="display: flex; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #1d9bf0; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      A
                    </div>
                    <div style="flex: 1;">
                      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <strong>AI Research Lab</strong>
                        <span style="color: #71767b;">@AIResearchLab</span>
                        <span style="color: #71767b;">·</span>
                        <span style="color: #71767b;">2h</span>
                      </div>
                      <p style="margin: 0; line-height: 1.5;">
                        🚀 Excited to announce our new agentic browser technology! It can automate complex workflows across multiple platforms. 
                        <br><br>
                        Key features:
                        <br>• Deep Action workflow automation
                        <br>• Cross-platform integration
                        <br>• Shadow window processing
                        <br>• AI-powered decision making
                        <br><br>
                        #AI #Automation #Browser #Technology
                      </p>
                      <div style="display: flex; gap: 20px; margin-top: 16px; color: #71767b;">
                        <span>💬 42</span>
                        <span>🔄 128</span>
                        <span>❤️ 387</span>
                        <span>📊 15.2K</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="border-bottom: 1px solid #2f3336; padding: 20px 0;">
                  <div style="display: flex; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #794bc4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      F
                    </div>
                    <div style="flex: 1;">
                      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <strong>Fellou AI</strong>
                        <span style="color: #71767b;">@FellouAI</span>
                        <span style="color: #71767b;">·</span>
                        <span style="color: #71767b;">4h</span>
                      </div>
                      <p style="margin: 0; line-height: 1.5;">
                        The future of browsing is here! 🌟 Our agentic browser transforms passive browsing into active execution. 
                        <br><br>
                        Try it now: Express your ideas in natural language, and watch Fellou turn them into action.
                        <br><br>
                        #AgeticBrowser #DeepAction #AI #Productivity
                      </p>
                      <div style="display: flex; gap: 20px; margin-top: 16px; color: #71767b;">
                        <span>💬 156</span>
                        <span>🔄 423</span>
                        <span>❤️ 1.2K</span>
                        <span>📊 45.8K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      'linkedin.com': {
        title: 'LinkedIn - Professional Network',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f3f2ef; min-height: 100vh; padding: 20px;">
            <div style="max-width: 1200px; margin: 0 auto;">
              <div style="background: #fff; border-radius: 8px; box-shadow: 0 0 0 1px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.2); padding: 24px; margin-bottom: 20px;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #000;">Feed</h1>
                <div style="border-bottom: 1px solid #e6e6e6; padding-bottom: 16px; margin-bottom: 16px;">
                  <div style="display: flex; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: #0a66c2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">
                      JD
                    </div>
                    <div style="flex: 1;">
                      <div style="margin-bottom: 8px;">
                        <strong style="color: #000;">John Doe</strong>
                        <div style="color: #666; font-size: 14px;">Senior Software Engineer at TechCorp</div>
                        <div style="color: #666; font-size: 12px;">3 hours ago</div>
                      </div>
                      <p style="margin: 0; color: #000; line-height: 1.5;">
                        Excited to share our latest breakthrough in AI-powered browser automation! 🚀
                        <br><br>
                        Our team has been working on an agentic browser that can:
                        <br>✅ Execute complex multi-step workflows
                        <br>✅ Integrate with 50+ platforms seamlessly  
                        <br>✅ Generate comprehensive reports automatically
                        <br>✅ Process tasks in shadow workspaces
                        <br><br>
                        The future of web interaction is here. Instead of manually clicking and typing, simply describe what you want to accomplish, and watch the magic happen.
                        <br><br>
                        #ArtificialIntelligence #BrowserAutomation #Innovation #TechLeadership
                      </p>
                      <div style="display: flex; gap: 16px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e6e6e6;">
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">👍 Like (247)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">💭 Comment (31)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">🔄 Repost (12)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">📤 Send</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="padding-bottom: 16px;">
                  <div style="display: flex; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: #7b68ee; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">
                      SA
                    </div>
                    <div style="flex: 1;">
                      <div style="margin-bottom: 8px;">
                        <strong style="color: #000;">Sarah Anderson</strong>
                        <div style="color: #666; font-size: 14px;">AI Product Manager at InnovateLabs</div>
                        <div style="color: #666; font-size: 12px;">6 hours ago</div>
                      </div>
                      <p style="margin: 0; color: #000; line-height: 1.5;">
                        Just completed an amazing workflow using the new agentic browser technology! 🎯
                        <br><br>
                        In just 15 minutes, it:
                        <br>📊 Analyzed competitor pricing across 20+ websites
                        <br>📈 Generated comprehensive market analysis
                        <br>📧 Sent personalized outreach to 50+ prospects
                        <br>📋 Created detailed reports with visualizations
                        <br><br>
                        This is the productivity revolution we've been waiting for!
                        <br><br>
                        #ProductManagement #AI #Automation #Productivity
                      </p>
                      <div style="display: flex; gap: 16px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e6e6e6;">
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">👍 Like (389)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">💭 Comment (67)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">🔄 Repost (23)</button>
                        <button style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px;">📤 Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      }
    };

    const template = templates[domain] || {
      title: `${domain} - Web Page`,
      content: `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
            <h1 style="margin: 0 0 16px 0; font-size: 2.5rem; font-weight: 700;">${domain}</h1>
            <p style="margin: 0; font-size: 1.2rem; opacity: 0.9;">Welcome to this website</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #333;">About This Site</h2>
            <p style="margin: 0; color: #666;">
              This is a demonstration of Fellou's browser engine capabilities. 
              The agentic browser can navigate, interact with, and extract data from real websites.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div style="background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #333; font-size: 1.1rem;">🌐 Real Navigation</h3>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">
                Actual HTTP requests and content parsing
              </p>
            </div>
            
            <div style="background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #333; font-size: 1.1rem;">🤖 AI Integration</h3>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">
                Smart content understanding and extraction
              </p>
            </div>
            
            <div style="background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #333; font-size: 1.1rem;">⚡ Fast Performance</h3>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">
                Optimized for speed and reliability
              </p>
            </div>
          </div>

          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: #1976d2;">Fellou Browser Engine</h4>
            <p style="margin: 0; color: #555;">
              Experiencing the world's first agentic browser in action. This page was loaded using advanced 
              web parsing and content generation capabilities.
            </p>
          </div>
        </div>
      `
    };

    return {
      type: 'web',
      url: url,
      title: template.title,
      content: template.content,
      loadTime: Math.random() * 2 + 0.5,
      contentSize: template.content.length
    };
  };

  const renderSpecialPage = (url) => {
    switch (url) {
      case 'emergent://welcome':
        return `
          <div style="font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white;">
            <div style="text-align: center; max-width: 600px; padding: 40px;">
              <div style="font-size: 4rem; margin-bottom: 24px;">⚡</div>
              <h1 style="margin: 0 0 24px 0; font-size: 3rem; font-weight: 700;">Welcome to Emergent AI</h1>
              <p style="margin: 0 0 32px 0; font-size: 1.3rem; opacity: 0.9; line-height: 1.6;">
                The World's First Agentic Browser<br>
                Experience Deep Action Technology
              </p>
              <div style="display: flex; gap: 16px; justify-content: center;">
                <button style="background: white; color: #667eea; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Try Deep Search</button>
                <button style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Browser Grid</button>
              </div>
            </div>
          </div>
        `;
      case 'emergent://new-tab':
        return `
          <div style="font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center; max-width: 500px; padding: 40px;">
              <div style="font-size: 3rem; margin-bottom: 24px; opacity: 0.3;">🌐</div>
              <h1 style="margin: 0 0 16px 0; font-size: 2rem; color: #333;">New Tab</h1>
              <p style="margin: 0; color: #666; font-size: 1.1rem;">
                Navigate to any website or try Emergent AI features
              </p>
            </div>
          </div>
        `;
      default:
        return `<div style="padding: 40px; text-align: center; font-family: system-ui;"><h1>Page Not Found</h1></div>`;
    }
  };

  const handleNavigation = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    await loadPage(urlInput);
  };

  const handleRefresh = () => {
    if (window.url) {
      loadPage(window.url);
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-white">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading {urlInput}...</p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-white">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load page</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (pageContent) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div 
            dangerouslySetInnerHTML={{ __html: pageContent.content }}
            className="h-full"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Navigate to a website to get started</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={`h-full flex flex-col bg-dark-800 rounded-lg overflow-hidden border-2 transition-colors ${
        isActive ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-gray-600'
      }`}
      onClick={onActivate}
      whileHover={{ scale: isMaximized ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Window Header */}
      <div className="h-8 bg-dark-700 flex items-center justify-between px-3 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2 truncate max-w-[150px]">
            {pageContent?.title || window.title || 'Browser Window'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-dark-600 rounded text-gray-400"
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button className="p-1 hover:bg-dark-600 rounded text-gray-400">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="h-10 bg-dark-750 flex items-center px-2 gap-1 border-b border-dark-600">
        <button className="p-1.5 hover:bg-dark-600 rounded text-gray-400">
          <ArrowLeft size={14} />
        </button>
        <button className="p-1.5 hover:bg-dark-600 rounded text-gray-400">
          <ArrowRight size={14} />
        </button>
        <button 
          onClick={handleRefresh}
          className="p-1.5 hover:bg-dark-600 rounded text-gray-400"
        >
          <RefreshCw size={14} />
        </button>

        <form onSubmit={handleNavigation} className="flex-1 mx-2">
          <div className="relative flex items-center bg-dark-600 rounded-full overflow-hidden">
            <div className="px-2 py-1 flex items-center gap-1">
              <Lock size={12} className="text-green-500" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name"
              className="flex-1 bg-transparent text-white text-sm py-1 px-1 focus:outline-none"
            />
          </div>
        </form>

        <button className="p-1.5 hover:bg-dark-600 rounded text-gray-400">
          <Star size={14} />
        </button>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-dark-750 border-t border-dark-600 flex items-center justify-between px-2 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {pageContent?.type === 'web' && (
            <>
              <span>Loaded in {pageContent.loadTime?.toFixed(2)}s</span>
              <span>{(pageContent.contentSize / 1024).toFixed(1)}KB</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive && <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>}
          <span>Fellou Browser Engine</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowserWindow;