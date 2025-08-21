import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  Globe, 
  FileText, 
  TrendingUp, 
  Mail, 
  Calendar,
  Database,
  Zap,
  Play,
  Copy,
  Star,
  Clock
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const WorkflowTemplates = ({ onSelectTemplate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Templates', icon: Zap },
    { id: 'lead-generation', label: 'Lead Generation', icon: Users },
    { id: 'content', label: 'Content Creation', icon: FileText },
    { id: 'social-media', label: 'Social Media', icon: Globe },
    { id: 'automation', label: 'Business Automation', icon: TrendingUp },
    { id: 'research', label: 'Research & Analysis', icon: Search },
  ];

  const templates = [
    {
      id: 'linkedin-lead-gen',
      name: 'LinkedIn Lead Generation',
      description: 'Automatically scrape LinkedIn profiles and extract contact information from target companies',
      category: 'lead-generation',
      icon: Users,
      difficulty: 'Easy',
      estimatedTime: '15 min',
      popularity: 4.8,
      tags: ['LinkedIn', 'CRM', 'Sales'],
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 50, y: 100 },
          data: {
            label: 'Manual Start',
            description: 'Start workflow manually',
            icon: Zap
          }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 300, y: 100 },
          data: {
            label: 'LinkedIn Search',
            description: 'Search LinkedIn profiles',
            icon: Users
          }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 550, y: 100 },
          data: {
            label: 'Extract Data',
            description: 'Extract contact information',
            icon: Database
          }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 100 },
          data: {
            label: 'Save to CRM',
            description: 'Save leads to database',
            icon: Zap
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'trigger-1', target: 'action-1', type: 'smoothstep' },
        { id: 'e2-3', source: 'action-1', target: 'action-2', type: 'smoothstep' },
        { id: 'e3-4', source: 'action-2', target: 'end-1', type: 'smoothstep' }
      ]
    },
    {
      id: 'content-research',
      name: 'Content Research Assistant',
      description: 'Research trending topics, analyze competitors, and generate content ideas for social media',
      category: 'content',
      icon: FileText,
      difficulty: 'Medium',
      estimatedTime: '25 min',
      popularity: 4.6,
      tags: ['Research', 'Content', 'Social Media'],
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 50, y: 100 },
          data: { label: 'Schedule Trigger', description: 'Daily content research', icon: Calendar }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 300, y: 50 },
          data: { label: 'Google Trends', description: 'Check trending topics', icon: TrendingUp }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 300, y: 150 },
          data: { label: 'Competitor Analysis', description: 'Analyze competitor content', icon: Search }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 550, y: 100 },
          data: { label: 'Content Filter', description: 'Filter relevant topics', icon: FileText }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 100 },
          data: { label: 'Generate Report', description: 'Create content report', icon: FileText }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'trigger-1', target: 'action-1', type: 'smoothstep' },
        { id: 'e1-3', source: 'trigger-1', target: 'action-2', type: 'smoothstep' },
        { id: 'e2-4', source: 'action-1', target: 'condition-1', type: 'smoothstep' },
        { id: 'e3-4', source: 'action-2', target: 'condition-1', type: 'smoothstep' },
        { id: 'e4-5', source: 'condition-1', target: 'end-1', type: 'smoothstep' }
      ]
    },
    {
      id: 'social-media-scheduler',
      name: 'Social Media Scheduler',
      description: 'Automatically post content across multiple social media platforms with optimal timing',
      category: 'social-media',
      icon: Globe,
      difficulty: 'Easy',
      estimatedTime: '10 min',
      popularity: 4.9,
      tags: ['Social Media', 'Automation', 'Scheduling'],
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 50, y: 100 },
          data: { label: 'Content Ready', description: 'New content available', icon: FileText }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: { label: 'Optimal Time?', description: 'Check posting time', icon: Clock }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 550, y: 50 },
          data: { label: 'Post to Twitter', description: 'Share on Twitter/X', icon: Globe }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 550, y: 150 },
          data: { label: 'Post to LinkedIn', description: 'Share on LinkedIn', icon: Users }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 100 },
          data: { label: 'Track Engagement', description: 'Monitor performance', icon: TrendingUp }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'trigger-1', target: 'condition-1', type: 'smoothstep' },
        { id: 'e2-3', source: 'condition-1', target: 'action-1', type: 'smoothstep' },
        { id: 'e2-4', source: 'condition-1', target: 'action-2', type: 'smoothstep' },
        { id: 'e3-5', source: 'action-1', target: 'end-1', type: 'smoothstep' },
        { id: 'e4-5', source: 'action-2', target: 'end-1', type: 'smoothstep' }
      ]
    },
    {
      id: 'email-campaign',
      name: 'Email Campaign Automation',
      description: 'Personalized email campaigns with lead scoring and automated follow-ups',
      category: 'automation',
      icon: Mail,
      difficulty: 'Hard',
      estimatedTime: '35 min',
      popularity: 4.5,
      tags: ['Email', 'CRM', 'Lead Scoring'],
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 50, y: 100 },
          data: { label: 'New Lead', description: 'Lead enters system', icon: Users }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: { label: 'Lead Score', description: 'Evaluate lead quality', icon: TrendingUp }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 550, y: 50 },
          data: { label: 'Send Welcome Email', description: 'Personalized welcome', icon: Mail }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 550, y: 150 },
          data: { label: 'Schedule Follow-up', description: 'Set reminder for sales', icon: Calendar }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 100 },
          data: { label: 'Update CRM', description: 'Log interaction', icon: Database }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'trigger-1', target: 'condition-1', type: 'smoothstep' },
        { id: 'e2-3', source: 'condition-1', target: 'action-1', type: 'smoothstep' },
        { id: 'e2-4', source: 'condition-1', target: 'action-2', type: 'smoothstep' },
        { id: 'e3-5', source: 'action-1', target: 'end-1', type: 'smoothstep' },
        { id: 'e4-5', source: 'action-2', target: 'end-1', type: 'smoothstep' }
      ]
    },
    {
      id: 'market-research',
      name: 'Market Research Automation',
      description: 'Comprehensive market analysis with competitor tracking and trend identification',
      category: 'research',
      icon: Search,
      difficulty: 'Medium',
      estimatedTime: '20 min',
      popularity: 4.4,
      tags: ['Research', 'Analytics', 'Competition'],
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 50, y: 100 },
          data: { label: 'Weekly Trigger', description: 'Weekly market check', icon: Calendar }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 300, y: 50 },
          data: { label: 'Scrape Competitors', description: 'Monitor competitor sites', icon: Globe }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 300, y: 150 },
          data: { label: 'Price Tracking', description: 'Track pricing changes', icon: TrendingUp }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 550, y: 100 },
          data: { label: 'Significant Change?', description: 'Detect major updates', icon: Search }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 100 },
          data: { label: 'Send Alert', description: 'Notify team of changes', icon: Mail }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'trigger-1', target: 'action-1', type: 'smoothstep' },
        { id: 'e1-3', source: 'trigger-1', target: 'action-2', type: 'smoothstep' },
        { id: 'e2-4', source: 'action-1', target: 'condition-1', type: 'smoothstep' },
        { id: 'e3-4', source: 'action-2', target: 'condition-1', type: 'smoothstep' },
        { id: 'e4-5', source: 'condition-1', target: 'end-1', type: 'smoothstep' }
      ]
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template) => {
    const workflowInstance = {
      id: uuidv4(),
      name: `${template.name} - Copy`,
      nodes: template.nodes.map(node => ({
        ...node,
        id: uuidv4() // Generate new IDs for the instance
      })),
      edges: template.edges.map(edge => ({
        ...edge,
        id: uuidv4(),
        // Update source/target to match new node IDs if needed
      })),
      templateId: template.id,
      createdAt: new Date().toISOString()
    };
    
    onSelectTemplate(workflowInstance);
    onClose();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-900 rounded-xl border border-dark-700 max-w-6xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Workflow Templates</h2>
            <p className="text-gray-400 mt-1">Choose a pre-built workflow to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Template Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <template.icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {template.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-dark-700 text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-dark-700 text-gray-400 rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} />
                    <span className="text-sm">{template.popularity}</span>
                  </div>
                  <motion.button
                    onClick={() => handleUseTemplate(template)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={14} />
                    Use Template
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowTemplates;