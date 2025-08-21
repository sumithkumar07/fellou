import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Database, 
  MessageSquare, 
  Settings, 
  Code, 
  Users, 
  Globe,
  Search,
  Calendar,
  Mail,
  FileText,
  Image,
  Download,
  Upload,
  Filter,
  Clock
} from 'lucide-react';

const WorkflowSidebar = () => {
  const [activeCategory, setActiveCategory] = useState('triggers');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'triggers', label: 'Triggers', icon: Zap },
    { id: 'actions', label: 'Actions', icon: Settings },
    { id: 'conditions', label: 'Logic', icon: Code },
    { id: 'integrations', label: 'Apps', icon: Globe },
  ];

  const workflowComponents = {
    triggers: [
      {
        type: 'trigger',
        data: {
          label: 'Manual Start',
          description: 'Start workflow manually',
          icon: Zap,
          config: { type: 'manual' }
        }
      },
      {
        type: 'trigger',
        data: {
          label: 'Schedule',
          description: 'Run on schedule',
          icon: Clock,
          config: { type: 'schedule' }
        }
      },
      {
        type: 'trigger',
        data: {
          label: 'Webhook',
          description: 'Start via webhook',
          icon: Globe,
          config: { type: 'webhook' }
        }
      }
    ],
    actions: [
      {
        type: 'action',
        data: {
          label: 'Web Scraping',
          description: 'Extract data from websites',
          icon: Globe,
          config: { type: 'scrape' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Send Email',
          description: 'Send automated emails',
          icon: Mail,
          config: { type: 'email' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Save to Database',
          description: 'Store data in database',
          icon: Database,
          config: { type: 'database' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Generate Report',
          description: 'Create automated reports',
          icon: FileText,
          config: { type: 'report' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'API Call',
          description: 'Make HTTP requests',
          icon: Code,
          config: { type: 'api' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Process Image',
          description: 'Analyze or modify images',
          icon: Image,
          config: { type: 'image' }
        }
      }
    ],
    conditions: [
      {
        type: 'condition',
        data: {
          label: 'If/Else',
          description: 'Conditional branching',
          icon: Code,
          config: { type: 'condition' }
        }
      },
      {
        type: 'condition',
        data: {
          label: 'Filter',
          description: 'Filter data based on criteria',
          icon: Filter,
          config: { type: 'filter' }
        }
      }
    ],
    integrations: [
      {
        type: 'action',
        data: {
          label: 'LinkedIn',
          description: 'Connect to LinkedIn',
          icon: Users,
          config: { type: 'linkedin', platform: 'social' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Google Sheets',
          description: 'Read/write spreadsheets',
          icon: FileText,
          config: { type: 'sheets', platform: 'google' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Slack',
          description: 'Send Slack messages',
          icon: MessageSquare,
          config: { type: 'slack', platform: 'communication' }
        }
      },
      {
        type: 'action',
        data: {
          label: 'Twitter/X',
          description: 'Post to Twitter/X',
          icon: Globe,
          config: { type: 'twitter', platform: 'social' }
        }
      }
    ]
  };

  // Add end node to all categories
  const endNode = {
    type: 'end',
    data: {
      label: 'End Workflow',
      description: 'Complete the workflow',
      icon: Zap,
      config: { type: 'end' }
    }
  };

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredComponents = workflowComponents[activeCategory]?.filter(component =>
    component.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.data.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const allComponents = [...filteredComponents];
  if (activeCategory !== 'triggers') {
    allComponents.push(endNode);
  }

  return (
    <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white mb-4">Workflow Components</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
              }`}
            >
              <category.icon size={14} />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {allComponents.map((component, index) => (
            <motion.div
              key={`${component.type}-${index}`}
              className="bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg p-3 cursor-move transition-colors"
              draggable
              onDragStart={(event) => onDragStart(event, component)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  component.type === 'trigger' ? 'bg-green-500' :
                  component.type === 'action' ? 'bg-blue-500' :
                  component.type === 'condition' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}>
                  <component.data.icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{component.data.label}</h4>
                  <p className="text-xs text-gray-400">{component.data.description}</p>
                </div>
              </div>
              
              {/* Drag Handle Indicator */}
              <div className="mt-2 flex justify-center">
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {allComponents.length === 0 && (
          <div className="text-center py-8">
            <Search size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No components found</p>
            <p className="text-gray-500 text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-dark-700 bg-dark-900">
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong className="text-white">💡 How to use:</strong></p>
          <p>• Drag components to the canvas</p>
          <p>• Connect nodes with edges</p>
          <p>• Start with a trigger, end with an endpoint</p>
          <p>• Execute to run your workflow</p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSidebar;