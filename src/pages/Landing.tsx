import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Share2,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  Bot,
  MessageSquare,
  UserPlus,
  Star
} from 'lucide-react';
import BoltBadge from '../assets/white_circle_360x360.png';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Conversations",
      description: "Chat with advanced AI that understands context and provides intelligent responses with markdown support."
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Invite team members to collaborate on AI conversations in real-time with live typing indicators."
    },
    {
      icon: Share2,
      title: "Smart Sharing",
      description: "Share chats publicly via links or privately with specific users through email invitations."
    },
    {
      icon: MessageSquare,
      title: "Context Selection",
      description: "Select previous messages as context to create more focused and relevant AI responses."
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Enterprise-grade security with JWT authentication and role-based access control."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with modern tech stack for instant responses and seamless user experience."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "This app transformed how our team collaborates on AI-assisted brainstorming. The real-time features are incredible!",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      content: "The context selection feature is a game-changer. I can build complex conversations with AI more effectively than ever.",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Watson",
      role: "Research Lead",
      content: "Perfect for collaborative research. The ability to share specific conversations with team members saves us hours.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Conversations" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "AI Available" }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MilonAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full border border-blue-500/30 mb-6">
                <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-blue-300 text-sm font-medium">Powered by Gemini</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Collaborate with
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">  Milon AI</span>
                <br />
                Like Never Before
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Create, share, and collaborate on AI conversations in real-time.
                Build smarter solutions together with context-aware AI assistance
                and seamless team collaboration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Start Collaborating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                View Demo
              </Link>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl p-2 backdrop-blur-sm border border-white/10">
                <img
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
                  alt="Collaborative AI Chat Interface"
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Live Collaboration</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need for
                <span className="bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent"> Smart Collaboration</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Powerful features designed to enhance your AI conversations and team productivity
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl w-fit mb-6 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get Started in
                <span className="bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent"> 3 Simple Steps</span>
              </h3>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up in seconds with just your email and start your AI collaboration journey.",
                icon: UserPlus
              },
              {
                step: "02",
                title: "Start a Conversation",
                description: "Create your first chat and begin interacting with our advanced AI assistant.",
                icon: MessageCircle
              },
              {
                step: "03",
                title: "Invite & Collaborate",
                description: "Share your chats with team members and collaborate in real-time on AI conversations.",
                icon: Users
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Loved by
                <span className="bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent"> Teams Worldwide</span>
              </h3>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl p-12 text-center border border-blue-500/30 backdrop-blur-sm"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> AI Collaboration?</span>
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using CollabChat AI to enhance their productivity and creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Sign In
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              No credit card required • Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MilonAI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 MilonAI. Crafted by Nexora for seamless group collaboration.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};