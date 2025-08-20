import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Crown, Check, Plus } from 'lucide-react';

const CreditSystem = () => {
  const [userCredits, setUserCredits] = useState(4750);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const creditPlans = [
    {
      id: 'starter',
      name: 'Starter Package',
      credits: 2000,
      price: 20,
      workflows: '~5 workflows',
      description: 'Perfect for individual users getting started',
      popular: false,
      features: ['2,000 credits', 'Basic workflows', 'Email support', 'Web access']
    },
    {
      id: 'professional', 
      name: 'Professional Package',
      credits: 5000,
      price: 50,
      workflows: '~12 workflows', 
      description: 'Ideal for power users and small teams',
      popular: true,
      features: ['5,000 credits', 'Advanced workflows', 'Priority support', 'API access', 'Custom integrations']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Package',
      credits: 15000,
      price: 120,
      workflows: '~35 workflows',
      description: 'For large organizations with high-volume needs',
      popular: false,
      features: ['15,000 credits', 'Unlimited workflows', '24/7 support', 'Custom deployment', 'Advanced analytics', 'Team management']
    }
  ];

  const creditUsageExamples = [
    { task: 'Simple research query', credits: 50 },
    { task: 'LinkedIn profile search (10 profiles)', credits: 150 },
    { task: 'Social media monitoring setup', credits: 200 },
    { task: 'Complex report generation', credits: 400 },
    { task: 'Cross-platform workflow automation', credits: 600 },
  ];

  const handlePurchaseCredits = (plan) => {
    setSelectedPlan(plan);
    // In real implementation, this would integrate with payment processor
    console.log(`Purchasing ${plan.credits} credits for $${plan.price}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Current Credit Status */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Credits</h2>
            <p className="text-gray-400">Track your usage and top up when needed</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary-500">{userCredits.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Credits remaining</div>
            <div className="text-xs text-green-400 mt-1">Auto top-up: 2,000 monthly</div>
          </div>
        </div>

        {/* Credit usage progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Monthly Usage</span>
            <span>{(5000 - userCredits).toLocaleString()} / 5,000 used</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((5000 - userCredits) / 5000) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Credit Usage Examples */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Credit Usage Examples</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditUsageExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300">{example.task}</p>
                <div className="flex items-center gap-1 text-primary-500 font-semibold">
                  <Zap size={14} />
                  <span>{example.credits}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Credit Purchase Plans */}
      <div className="mb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Credit Package</h2>
          <p className="text-xl text-gray-400">Flexible pricing to match your automation needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {creditPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-dark-800 border rounded-xl p-6 hover:scale-105 transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
                  : 'border-dark-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star size={14} />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  plan.id === 'enterprise' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  plan.id === 'professional' ? 'bg-gradient-to-r from-primary-500 to-accent-500' :
                  'bg-gradient-to-r from-green-500 to-cyan-500'
                }`}>
                  {plan.id === 'enterprise' ? <Crown size={32} className="text-white" /> :
                   plan.id === 'professional' ? <Star size={32} className="text-white" /> :
                   <Zap size={32} className="text-white" />}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white">${plan.price}</div>
                  <div className="text-primary-500 font-semibold">{plan.credits.toLocaleString()} credits</div>
                  <div className="text-sm text-gray-400">{plan.workflows}</div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg'
                    : 'bg-dark-700 border border-dark-600 text-white hover:bg-dark-600'
                }`}
                onClick={() => handlePurchaseCredits(plan)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Purchase Credits
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New User Bonus Info */}
      <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">New User Bonus</h3>
            <p className="text-gray-300 text-sm">
              Get 5,000 credits when you first sign up! Plus, we'll automatically top you up to 2,000 credits on the 1st of each month if your balance is low.
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>All credit values and gifting policies are subject to change. Fellou reserves the right to modify or terminate the credit gifting mechanism at any time without prior notice.</p>
      </div>
    </div>
  );
};

export default CreditSystem;