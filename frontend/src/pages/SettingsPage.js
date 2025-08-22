import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Bell, Shield, Database, Key, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useFocusManagement } from '../hooks/useAccessibility';
import { useAI } from '../contexts/AIContext';
import axios from 'axios';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Anonymous User',
      email: '',
      avatar: null
    },
    appearance: {
      theme: 'dark',
      sidebarPosition: 'left',
      compactMode: false
    },
    notifications: {
      workflowComplete: true,
      workflowFailed: true,
      weeklyReport: false,
      emailNotifications: false
    },
    privacy: {
      analyticsEnabled: true,
      crashReporting: true,
      dataSharing: false
    },
    integrations: {
      groqApiKey: '',
      openaiApiKey: '',
      anthropicApiKey: ''
    }
  });

  // Phase 1: Backend Integration
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const { announceToScreenReader } = useFocusManagement();
  const { sessionId } = useAI();
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Phase 1: Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        
        // Call backend API to load settings
        const response = await axios.get(`${backendUrl}/api/settings/${sessionId}`);
        
        if (response.data.settings) {
          setSettings(response.data.settings);
          announceToScreenReader('Settings loaded successfully');
        }
        
      } catch (error) {
        console.error('Failed to load settings:', error);
        announceToScreenReader('Using default settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [sessionId, backendUrl, announceToScreenReader]);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'integrations', label: 'API Keys', icon: Key },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setSaveStatus(null); // Clear save status when making changes
    announceToScreenReader(`${key} setting updated`);
  };

  // Phase 1: Save settings to backend
  const handleSaveSettings = async () => {
    if (!sessionId) {
      setSaveStatus('error');
      announceToScreenReader('Cannot save settings: No session found');
      return;
    }

    try {
      setSaving(true);
      setSaveStatus(null);

      // Call backend API to save settings
      const response = await axios.post(`${backendUrl}/api/settings/save`, {
        session_id: sessionId,
        settings_data: settings
      });

      if (response.data.status === 'success') {
        setSaveStatus('success');
        announceToScreenReader('Settings saved successfully');
        
        // Clear success status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error('Save failed');
      }

    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      announceToScreenReader('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Profile Settings</h3>
      
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
        <div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Change Avatar
          </button>
          <p className="text-sm text-gray-400 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
        <input
          type="text"
          value={settings.profile.name}
          onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Appearance Settings</h3>
      
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Sidebar Position */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Sidebar Position</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="sidebarPosition"
              value="left"
              checked={settings.appearance.sidebarPosition === 'left'}
              onChange={(e) => handleSettingChange('appearance', 'sidebarPosition', e.target.value)}
              className="mr-2"
            />
            <span className="text-white">Left</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sidebarPosition"
              value="right"
              checked={settings.appearance.sidebarPosition === 'right'}
              onChange={(e) => handleSettingChange('appearance', 'sidebarPosition', e.target.value)}
              className="mr-2"
            />
            <span className="text-white">Right</span>
          </label>
        </div>
      </div>

      {/* Compact Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-300">Compact Mode</label>
          <p className="text-sm text-gray-400">Reduce spacing and padding for more content</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.appearance.compactMode}
            onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Notification Settings</h3>
      
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-300 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <p className="text-sm text-gray-400">
              {key === 'workflowComplete' && 'Get notified when workflows finish successfully'}
              {key === 'workflowFailed' && 'Get notified when workflows encounter errors'}
              {key === 'weeklyReport' && 'Receive weekly workflow performance reports'}
              {key === 'emailNotifications' && 'Send notifications to your email address'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">API Keys & Integrations</h3>
      
      {Object.entries(settings.integrations).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
            {key.replace('ApiKey', ' API Key')}
          </label>
          <div className="relative">
            <input
              type="password"
              value={value}
              onChange={(e) => handleSettingChange('integrations', key, e.target.value)}
              placeholder="Enter API key..."
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {key === 'groqApiKey' && value && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-sm">
                ✓ Active
              </span>
            )}
          </div>
          {key === 'groqApiKey' && (
            <p className="text-sm text-gray-400 mt-1">Currently configured and working</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderCurrentSection = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-center text-gray-400">Loading settings...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'appearance':
        return renderAppearanceSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'integrations':
        return renderIntegrationsSection();
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Privacy & Security</h3>
            <p className="text-gray-400">Privacy settings coming soon...</p>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
            <p className="text-gray-400">Data management options coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-dark-900 flex" role="main" aria-label="Settings page">
      {/* Sidebar - Unchanged UI */}
      <div className="w-64 bg-dark-800 border-r border-dark-700 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          
          {/* Phase 2: Connection Status Indicator */}
          {sessionId ? (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected" />
          ) : (
            <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Connecting..." />
          )}
        </div>
        
        <nav className="space-y-2" role="navigation" aria-label="Settings navigation">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              <section.icon size={18} />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content - Same UI, backend integration */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderCurrentSection()}
        
        {/* Phase 2: Enhanced Save Button with Status */}
        <div className="mt-8 pt-6 border-t border-dark-700">
          <div className="flex items-center gap-4">
            <motion.button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                saving 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              whileHover={!saving ? { scale: 1.02 } : {}}
              whileTap={!saving ? { scale: 0.98 } : {}}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </motion.button>

            {/* Phase 2: Save Status Indicator */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={18} />
                <span>Settings saved successfully!</span>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={18} />
                <span>Failed to save settings</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;