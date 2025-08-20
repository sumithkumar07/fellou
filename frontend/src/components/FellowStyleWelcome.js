import React from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import VideoDemo from './VideoDemo';
import { 
  Zap, 
  Globe, 
  Brain, 
  Workflow,
  Search,
  ArrowRight,
  Sparkles,
  Star,
  Users
} from 'lucide-react';

const FellowStyleWelcome = () => {
  const { sendMessage } = useAI();

  const useCases = [
    {
      title: "JD Consolidation and Resume Optimization", 
      description: "Consolidate two companies' JD duties/skills and suggest resume revisions.",
      thumbnail: "/api/placeholder/400/250",
      action: () => sendMessage("Help me consolidate job descriptions and optimize my resume")
    },
    {
      title: "Batch Twitter Account Following",
      description: "Follow all Twitter accounts listed in the webpage or spreadsheet (~60 accounts).",
      thumbnail: "/api/placeholder/400/250", 
      action: () => sendMessage("Help me follow Twitter accounts from a list")
    },
    {
      title: "Social Media Outreach & Promotion",
      description: "Find recent browser-related posts, comment and recommend Fellou AI on major platforms.",
      thumbnail: "/api/placeholder/400/250",
      action: () => sendMessage("Help me with social media outreach and promotion")
    },
    {
      title: "LinkedIn Developer Recruitment",
      description: "Identify three Agent developers, message to introduce Fellou and invite to join.",
      thumbnail: "/api/placeholder/400/250",
      action: () => sendMessage("Help me find and recruit developers on LinkedIn")
    }
  ];

  const reports = [
    {
      title: "Find iPhone Slogans",
      description: "Help me find the promotional slogans of iPhone over the years.",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Tesla Revenue, EBITDA & Shipments", 
      description: "Retrieve Tesla's revenue, EBITDA, and shipments for the past 12 quarters",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Silicon Valley AI Tracker",
      description: "Aggregate AI trends from top 20 Silicon Valley VC websites, including investments, views, and progress.",
      image: "/api/placeholder/300/200"
    }
  ];

  const testimonials = [
    {
      text: "Fellou didn't just beat the competition, it crushed them. Most accurate, clearest reports, deepest insights. Easiest to read And it's 3.1x faster than OpenAI.",
      author: "Guri Saroy",
      handle: "@HeyGurisaroy",
      avatar: "/api/placeholder/50/50"
    },
    {
      text: "Fellou is not just another browser, it's an Agentic assistant that takes action for you.",
      author: "Angry Tom", 
      handle: "@AngryTomtweets",
      avatar: "/api/placeholder/50/50"
    },
    {
      text: "Everyone's hyped about AI doing the thinking but this is AI doing the doing. Agents that act on research > agents that just summarize it.",
      author: "SwishBanksX",
      handle: "@swishbanksX", 
      avatar: "/api/placeholder/50/50"
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-y-auto">
      {/* Hero Section - Exact Fellou Style */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50"></div>
        
        <div className="relative z-10 text-center max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Fellou: The World's
            </h1>
            <h2 className="text-6xl md:text-8xl font-bold gradient-text mb-8">
              First Agentic Browser
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Beyond browsing, into <span className="gradient-text font-semibold">Action</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button className="btn-primary px-8 py-4 text-lg">
              Join Waitlist
            </button>
            <button className="btn-secondary px-8 py-4 text-lg">
              Download
            </button>
          </motion.div>

          {/* Hero video placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="relative w-full max-w-4xl mx-auto"
          >
            <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl border border-primary-500/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap size={40} className="text-white" />
                </div>
                <p className="text-gray-400">Demo video would play here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Express Ideas, Fellou Acts */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Express Ideas, Fellou Acts</h2>
          <p className="text-xl text-gray-300 mb-16">
            Deep Action — think, browse, and organize information hands-free.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Act on private sites</h3>
              <p className="text-gray-400 text-sm">Top security and stability with your own login, device, and no password leaks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Workflow size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Virtual workspace for Agent</h3>
              <p className="text-gray-400 text-sm">Executing tasks in a shadow window, without disrupting your workflow.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Generate the report you need</h3>
              <p className="text-gray-400 text-sm">Easily create and edit reports through simple, intuitive interactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases with Video Demos */}
      <section className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Automate Workflows, Not Headaches: Cross-Platform Task Execution
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-4xl mx-auto">
            From social media monitoring to data aggregation, Fellou automates multi-step workflows across 50+ platforms—no coding needed, just drag-and-drop logic.
          </p>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group cursor-pointer"
                onClick={useCase.action}
              >
                <VideoDemo
                  title={useCase.title}
                  description={useCase.description}
                  thumbnail={useCase.thumbnail}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Generation */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Transform Data into Decisions: AI-Driven Reports in Seconds
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-4xl mx-auto">
            Fellou's AI analyzes public/private data across platforms (logged-in or not) to generate actionable reports with visual insights—cutting research time by 90%.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {reports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-dark-800 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                onClick={() => sendMessage(report.description)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <Brain size={40} className="text-primary-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-white mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-400">{report.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Unlock Universal Integration: One Tool, Every Platform
          </h2>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto">
            Seamlessly connect Fellou with Twitter, Reddit, and niche apps—automate actions, get data, and bypass API limitations.
          </p>
          
          <div className="grid grid-cols-5 md:grid-cols-10 gap-6">
            {['Twitter', 'Reddit', 'Facebook', 'Instagram', 'LinkedIn', 'GitHub', 'Quora', 'DuckDuckGo', 'Microsoft', 'Chrome'].map((platform, index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-16 h-16 bg-dark-700 rounded-xl flex items-center justify-center hover:bg-dark-600 transition-colors"
              >
                <Globe size={24} className="text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Stories That Inspire</h2>
          <p className="text-xl text-gray-300 text-center mb-16">Unleash productivity, redefine your browsing experience.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-dark-800 p-6 rounded-xl"
              >
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.handle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Empowering humanity with intelligent productivity
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Bring a digital companion to every person, on every device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-4 text-lg">
              Join Waitlist
            </button>
            <button className="btn-secondary px-8 py-4 text-lg">
              Download
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FellowStyleWelcome;