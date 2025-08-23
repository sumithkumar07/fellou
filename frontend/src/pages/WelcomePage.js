import React from 'react';
import EnhancedWelcomePage from './EnhancedWelcomePage';

const WelcomePage = ({ onNavigate }) => {
  const [searchInput, setSearchInput] = useState('');
  const { sendMessage, isLoading, createWorkflow, executeWorkflow } = useAI();
  const { navigateToUrl, getActiveTab } = useBrowser();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading) return;

    // Send message to AI
    try {
      await sendMessage(searchInput);
      setSearchInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const quickActions = [
    {
      title: 'Research',
      description: 'Deep research on any topic with AI-powered analysis',
      icon: Search,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500',
      action: async () => {
        try {
          const workflow = await createWorkflow("Research the latest AI trends across multiple sources, extract key insights and generate a comprehensive report");
          if (workflow && workflow.workflow_id) {
            setTimeout(() => {
              executeWorkflow(workflow.workflow_id);
            }, 1000);
          }
        } catch (error) {
          console.error('Research workflow failed:', error);
          setSearchInput("Research the latest AI trends");
        }
      }
    },
    {
      title: 'Automate',
      description: 'Automate repetitive tasks across multiple websites',
      icon: Zap,
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500',
      action: async () => {
        try {
          await sendMessage("Create a workflow to automate data collection from websites. Show me how browser automation works with screenshots.");
        } catch (error) {
          console.error('Automation demo failed:', error);
        }
      }
    },
    {
      title: 'Generate Leads',
      description: 'Find and collect leads from social platforms',
      icon: Users,
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500',
      action: async () => {
        try {
          await navigateToUrl('https://linkedin.com', getActiveTab()?.id);
          setTimeout(async () => {
            await sendMessage("Navigate to LinkedIn and help me find potential leads in the tech industry. Take screenshots of the process.");
          }, 2000);
        } catch (error) {
          console.error('Lead generation failed:', error);
          await sendMessage("Help me generate leads from LinkedIn in the tech industry");
        }
      }
    }
  ];

  const stats = [
    { icon: Star, label: '50+ Integrations', color: 'text-yellow-500' },
    { icon: TrendingUp, label: '90% Time Saved', color: 'text-green-500' },
    { icon: Users, label: 'Trusted by 10k+ Users', color: 'text-blue-400' }
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6">
      <div className="max-w-2xl w-full">
        {/* Main Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <Zap size={28} className="text-white" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-black mb-4"
          >
            Welcome to Kairo
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            Your Advanced AI Browser with Native Chromium & 50+ Integrations
          </motion.p>

          {/* Main Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="mb-8"
          >
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Try: 'Create workflow for lead generation' | 'Automate data extraction' | 'What hidden features do you have?'"
                className="w-full px-6 py-4 text-lg bg-gray-100/50 border-2 border-gray-300 text-black placeholder-gray-500 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center hover:shadow-lg"
                disabled={!searchInput.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-6 bg-gradient-to-br ${action.color} border ${action.borderColor} rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-opacity-30 hover:to-opacity-30 transition-all group`}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-8 text-sm text-gray-600"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <stat.icon size={16} className={stat.color} />
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;