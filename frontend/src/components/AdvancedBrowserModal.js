import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Code, Search, Download, Database, MousePointer, 
  FormInput, Target, Copy, FileText, Settings, Zap,
  ChevronDown, ChevronRight, Eye, ExternalLink
} from 'lucide-react';
import { useBrowser } from '../contexts/BrowserContext';
import axios from 'axios';

const AdvancedBrowserModal = ({ isOpen, onClose }) => {
  const [activeToolTab, setActiveToolTab] = useState('css-selector');
  const [cssSelector, setCssSelector] = useState('');
  const [extractedData, setExtractedData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [automationScript, setAutomationScript] = useState('');
  const { getActiveTab, performBrowserAction } = useBrowser();
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const activeTab = getActiveTab();

  const tabs = [
    { id: 'css-selector', label: 'CSS Selector', icon: Target },
    { id: 'metadata', label: 'Page Metadata', icon: Database },
    { id: 'automation', label: 'Form Automation', icon: FormInput },
    { id: 'data-export', label: 'Data Export', icon: Download }
  ];

  // CSS Selector Data Extraction
  const handleCSSExtraction = async () => {
    if (!cssSelector.trim() || !activeTab) return;
    
    setLoading(true);
    try {
      const result = await performBrowserAction('extract', {
        selector: cssSelector,
        tab_id: activeTab.id
      });
      
      if (result.success && result.extracted_data) {
        setExtractedData(Array.isArray(result.extracted_data) ? result.extracted_data : [result.extracted_data]);
      }
    } catch (error) {
      console.error('CSS extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load Page Metadata
  const loadPageMetadata = async () => {
    if (!activeTab) return;
    
    setLoading(true);
    try {
      // Get comprehensive page metadata from backend
      const result = await performBrowserAction('extract', {
        selector: 'html',
        extract_metadata: true,
        tab_id: activeTab.id
      });
      
      if (result.success && result.metadata) {
        setMetadata(result.metadata);
      }
    } catch (error) {
      console.error('Metadata loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form Automation
  const executeAutomationScript = async () => {
    if (!automationScript.trim() || !activeTab) return;
    
    setLoading(true);
    try {
      // Parse automation script and execute actions
      const actions = automationScript.split('\n').filter(line => line.trim());
      
      for (const action of actions) {
        if (action.startsWith('click:')) {
          const selector = action.replace('click:', '').trim();
          await performBrowserAction('click', { selector, tab_id: activeTab.id });
        } else if (action.startsWith('type:')) {
          const [selector, text] = action.replace('type:', '').split('=');
          await performBrowserAction('type', { 
            selector: selector.trim(), 
            text: text.trim(),
            tab_id: activeTab.id 
          });
        }
        // Add delay between actions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Automation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export Data
  const exportData = (format) => {
    if (extractedData.length === 0) return;
    
    let exportContent = '';
    let filename = '';
    
    if (format === 'json') {
      exportContent = JSON.stringify(extractedData, null, 2);
      filename = 'extracted_data.json';
    } else if (format === 'csv') {
      if (typeof extractedData[0] === 'object') {
        const headers = Object.keys(extractedData[0]).join(',');
        const rows = extractedData.map(item => Object.values(item).join(','));
        exportContent = [headers, ...rows].join('\n');
      } else {
        exportContent = extractedData.join('\n');
      }
      filename = 'extracted_data.csv';
    }
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCSSSelector = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          CSS Selector
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cssSelector}
            onChange={(e) => setCssSelector(e.target.value)}
            placeholder="e.g., .price, h1, .product-name, #description"
            className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            onClick={handleCSSExtraction}
            disabled={loading || !cssSelector.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Extracting...' : 'Extract'}
          </motion.button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Extract data from page elements using CSS selectors
        </p>
      </div>

      {/* Quick Selectors */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quick Selectors
        </label>
        <div className="flex flex-wrap gap-2">
          {['h1', 'h2', '.price', '.title', 'a[href]', 'img[src]', '.description'].map(selector => (
            <button
              key={selector}
              onClick={() => setCssSelector(selector)}
              className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded transition-colors"
            >
              {selector}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Data */}
      {extractedData.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Extracted Data ({extractedData.length} items)
          </label>
          <div className="max-h-60 overflow-y-auto bg-dark-700 rounded-lg p-4">
            {extractedData.map((item, index) => (
              <div key={index} className="mb-2 p-2 bg-dark-600 rounded text-sm">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMetadata = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Page Metadata</h3>
        <motion.button
          onClick={loadPageMetadata}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Loading...' : 'Refresh Metadata'}
        </motion.button>
      </div>

      {metadata && (
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="p-3 bg-dark-700 rounded-lg">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="text-sm text-white break-words">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {!metadata && (
        <div className="text-center py-8 text-gray-400">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p>Click "Refresh Metadata" to load page information</p>
        </div>
      )}
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Automation Script
        </label>
        <textarea
          value={automationScript}
          onChange={(e) => setAutomationScript(e.target.value)}
          placeholder={`Enter automation commands (one per line):
click: #submit-button
type: input[name="email"] = user@example.com
click: .checkbox
type: textarea = Hello World`}
          rows="8"
          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Automate form filling and clicking with simple commands
        </p>
      </div>

      <div className="flex gap-2">
        <motion.button
          onClick={executeAutomationScript}
          disabled={loading || !automationScript.trim()}
          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Executing...' : 'Execute Script'}
        </motion.button>
        <button
          onClick={() => setAutomationScript('')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quick Actions
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAutomationScript('click: input[type="submit"]\nclick: button[type="submit"]')}
            className="p-3 bg-dark-700 hover:bg-dark-600 text-left text-sm rounded transition-colors"
          >
            <FormInput size={16} className="mb-1" />
            Submit Forms
          </button>
          <button
            onClick={() => setAutomationScript('click: a[href*="next"]\nclick: .pagination .next')}
            className="p-3 bg-dark-700 hover:bg-dark-600 text-left text-sm rounded transition-colors"
          >
            <ChevronRight size={16} className="mb-1" />
            Navigate Pages
          </button>
        </div>
      </div>
    </div>
  );

  const renderDataExport = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Data Export Tools</h3>
      
      {extractedData.length > 0 ? (
        <div className="space-y-4">
          <div className="p-4 bg-dark-700 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">
              Ready to export: {extractedData.length} items
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => exportData('json')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText size={16} />
                Export JSON
              </motion.button>
              <motion.button
                onClick={() => exportData('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Database size={16} />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* Data Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Preview
            </label>
            <div className="max-h-40 overflow-y-auto bg-dark-700 rounded-lg p-4">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(extractedData.slice(0, 3), null, 2)}
                {extractedData.length > 3 && '\n... and more'}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Download size={48} className="mx-auto mb-4 opacity-50" />
          <p>Extract data first to enable export options</p>
          <p className="text-sm mt-2">Use CSS Selector tab to extract data from the page</p>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (isOpen && activeTab === 'metadata') {
      loadPageMetadata();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl mx-4 bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Settings size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Advanced Browser Tools</h2>
                <p className="text-sm text-gray-400">Power user features for web automation</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} className="text-gray-400" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'css-selector' && renderCSSSelector()}
            {activeTab === 'metadata' && renderMetadata()}
            {activeTab === 'automation' && renderAutomation()}
            {activeTab === 'data-export' && renderDataExport()}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 bg-dark-900/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Advanced features for power users</span>
              <div className="flex items-center gap-4">
                <span>Current page: {activeTab?.url || 'No page loaded'}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Connected</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdvancedBrowserModal;