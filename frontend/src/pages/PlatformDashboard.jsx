import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Send,
    TrendingUp,
    Sparkles,
    Youtube,
    AtSign,
    ChevronLeft,
    Calendar,
    Users,
    Activity
} from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function PlatformDashboard() {
    const { platformId } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAccess = async () => {
            try {
                const res = await fetchWithAuth('/platforms/accounts');
                if (res.ok) {
                    const data = await res.json();
                    const acc = data.find(a => a.platform.toLowerCase() === platformId.toLowerCase());
                    if (!acc) {
                        navigate('/dashboard/connect');
                    } else {
                        setAccount(acc);
                    }
                }
            } catch (err) {
                console.error('Access verification failed:', err);
            } finally {
                setLoading(false);
            }
        };

        verifyAccess();
    }, [platformId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const platformConfig = {
        threads: {
            name: 'Threads',
            icon: AtSign,
            color: 'text-white',
            accent: 'blue-500'
        },
        youtube: {
            name: 'YouTube',
            icon: Youtube,
            color: 'text-red-500',
            accent: 'red-500'
        }
    };

    const config = platformConfig[platformId.toLowerCase()] || platformConfig.threads;
    const Icon = config.icon;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/connect')}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                    >
                        <ChevronLeft />
                    </button>
                    <div className={`p-3 rounded-xl bg-white/5 ${config.color}`}>
                        <Icon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{config.name} Dashboard</h1>
                        <p className="text-slate-400">Connected as <span className="text-blue-400 font-medium">{account?.platform_username}</span></p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Post
                    </button>
                    <button className="px-4 py-2 bg-[#121212] text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Followers', value: '12.4K', trend: '+12%', icon: Users },
                    { label: 'Avg. Engagement', value: '4.8%', trend: '+0.5%', icon: Activity },
                    { label: 'Posts this Month', value: '24', trend: '-2', icon: Send },
                    { label: 'Profile Views', value: '85.2K', trend: '+24%', icon: TrendingUp },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#121212] border border-white/10 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon size={20} className="text-slate-400" />
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Analytics Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-blue-500" /> Performance Analytics
                            </h3>
                            <select className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 3 months</option>
                            </select>
                        </div>
                        <div className="h-64 border-b border-white/10 flex items-end justify-between gap-2 px-2 pb-2 mb-4">
                            {[40, 65, 45, 90, 65, 80, 55, 70, 85, 60, 75, 50].map((h, i) => (
                                <div
                                    key={i}
                                    className={`w-full bg-blue-500/20 hover:bg-blue-500/40 rounded-t-sm transition-all cursor-pointer group relative`}
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {Math.floor(h * 1234)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 px-1 font-medium tracking-wider uppercase">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                        </div>
                    </div>

                    {/* Posts Feed Section Placeholder */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Send size={20} className="text-purple-500" /> Recent Posts
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-white/10">
                                        <Icon className="text-slate-700" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-white font-medium truncate">Mastering {config.name} in 2026: A complete guide to growth...</p>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap uppercase tracking-tighter ml-2">2 days ago</span>
                                        </div>
                                        <p className="text-slate-400 text-sm line-clamp-1 mb-2">Detailed breakdown of current algorithm trends and how to capitalize on...</p>
                                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <span className="flex items-center gap-1.5"><Activity size={12} /> 1.2K Eng</span>
                                            <span className="flex items-center gap-1.5"><TrendingUp size={12} /> 14.5% RC</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Sections */}
                <div className="space-y-6">
                    {/* Trending Section */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-orange-500" /> Trending Topics
                        </h3>
                        <div className="space-y-4">
                            {['Artificial Intelligence', 'Web Development', 'Future of Work', 'Minimalism'].map((topic, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-600 font-bold italic text-sm">#0{i + 1}</span>
                                        <span className="text-slate-300 font-medium group-hover:text-blue-400 transition-colors uppercase tracking-tight">{topic}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">{Math.floor(Math.random() * 50) + 10}K</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                            <Sparkles size={18} className="text-yellow-400" /> AI Insights
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
                            Based on your recent engagement, we recommend posting more video content on Tuesday mornings to reach your European audience.
                        </p>
                        <button className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors relative z-10">
                            Apply Strategy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Plus = ({ className }) => <PlusIcon className={className} />;
const PlusIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default PlatformDashboard;
