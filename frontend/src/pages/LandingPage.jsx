import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Navigation */}
            <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                SyncSocial
                            </span>
                        </div>
                        <div className="flex space-x-4 items-center">
                            <ThemeToggle />
                            <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-4 py-2 font-medium transition-colors">Log in</Link>
                            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-black px-4 py-2 rounded-lg font-medium transition-colors">Sign up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight mb-8 leading-tight">
                    Manage all your social media <br className="hidden md:block" />
                    <span className="text-slate-900 dark:text-white">in one powerful platform</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Schedule posts, track analytics, and engage with your audience across multiple platforms from a single, intuitive dashboard.
                </p>
                <div className="flex justify-center gap-4 flex-col sm:flex-row">
                    <Link to="/signup" className="px-8 py-3 bg-blue-600 text-white dark:bg-white dark:text-black rounded-lg text-lg font-semibold hover:bg-blue-700 dark:hover:bg-slate-200 transition-all flex items-center justify-center shadow-sm">
                        Get Started Free
                    </Link>
                    <button className="px-8 py-3 bg-white dark:bg-[#121212] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-lg text-lg font-semibold hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-all shadow-sm">
                        View Live Demo
                    </button>
                </div>

                {/* Feature Highlights */}
                <div className="grid md:grid-cols-3 gap-6 mt-32 text-left">
                    <div className="p-8 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center mb-6">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-3">Advanced Analytics</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Track your performance with deep insights and beautifully crafted reports designed for professionals.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-3">Audience Engagement</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Respond to comments and messages from all your networks in a lightning-fast unified inbox.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-3">Team Collaboration</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Work together seamlessly with built-in approval workflows, precise roles, and secure access.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
