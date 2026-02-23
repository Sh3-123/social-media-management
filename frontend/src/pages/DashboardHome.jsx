import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Eye, TrendingUp, HandHeart } from 'lucide-react';

function DashboardHome() {
    const { user } = useAuth();

    const stats = [
        { label: 'Total Followers', value: '14,234', icon: Users, trend: '+12%', color: 'blue' },
        { label: 'Profile Views', value: '8,459', icon: Eye, trend: '+5.4%', color: 'purple' },
        { label: 'Engagement Rate', value: '4.2%', icon: HandHeart, trend: '+1.2%', color: 'pink' },
        { label: 'Post Reach', value: '124.5k', icon: TrendingUp, trend: '+24%', color: 'green' },
    ];

    // Added a small helper to map the previous standard CSS color names to tailwind specific hex classes or safe generic classes.
    // Given the dark mode requested, we'll mostly map these abstract colors to a generic style if we want to follow the threads/github simplicity.
    // I am turning them all to white/gray themed to match the threads/github aesthetic as requested, where icons might be simple gray/white.

    return (
        <div className="space-y-6 text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}! 👋</h2>
                    <p className="text-slate-400 text-sm mt-1">Here's what's happening with your accounts today.</p>
                </div>
                <button className="mt-4 sm:mt-0 bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm">
                    Create New Post
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-[#121212] rounded-xl shadow-sm border border-white/10 p-6 transform transition-transform hover:border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 border border-white/10`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-400 font-medium">{stat.trend}</span>
                                <span className="text-slate-500 ml-2">vs last week</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 bg-[#121212] rounded-xl shadow-sm border border-white/10 p-6 min-h-[400px]">
                    <h3 className="text-lg font-bold text-blue-500 mb-4">Audience Growth Analytics</h3>
                    <div className="flex items-center justify-center h-[300px] border border-dashed border-white/20 rounded-lg text-slate-500 bg-[#1a1a1a]">
                        Chart visualization goes here
                    </div>
                </div>
                <div className="bg-[#121212] rounded-xl shadow-sm border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-blue-500 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                                    TW
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-slate-300">New follower on Twitter</p>
                                    <p className="text-xs text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardHome;
