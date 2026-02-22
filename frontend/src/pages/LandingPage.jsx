import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Users, BarChart3, ShieldCheck } from 'lucide-react';

function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                SocialSync
                            </span>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 font-medium">Log in</Link>
                            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Sign up</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
                    Manage all your social media <br className="hidden md:block" />
                    <span className="text-blue-600">in one powerful platform</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                    Schedule posts, track analytics, and engage with your audience across multiple platforms from a single, intuitive dashboard.
                </p>
                <div className="flex justify-center gap-4 flex-col sm:flex-row">
                    <Link to="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1">
                        Get Started Free
                    </Link>
                    <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all">
                        View Live Demo
                    </button>
                </div>

                {/* Feature Highlights */}
                <div className="grid md:grid-cols-3 gap-8 mt-24">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 transform transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
                        <p className="text-gray-500">Track your performance with deep insights and beautifully crafted reports.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 transform transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Audience Engagement</h3>
                        <p className="text-gray-500">Respond to comments and messages from all your networks in a unified inbox.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 transform transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Team Collaboration</h3>
                        <p className="text-gray-500">Work together seamlessly with built-in approval workflows and secure access.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
