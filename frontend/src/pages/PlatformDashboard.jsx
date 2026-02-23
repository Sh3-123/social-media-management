import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    BarChart3,
    Send,
    TrendingUp,
    Sparkles,
    Youtube,
    AtSign,
    ChevronLeft,
    Users,
    Activity,
    MessageCircle,
    Heart,
    Eye,
    RefreshCw
} from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function PlatformDashboard() {
    const { platformId } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [posts, setPosts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('POST'); // 'POST' or 'REPLY'

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // Verify account connection
                const accRes = await fetchWithAuth('/platforms/accounts');
                if (accRes.ok) {
                    const accounts = await accRes.json();
                    const currentAcc = accounts.find(a => a.platform.toLowerCase() === platformId.toLowerCase());
                    if (!currentAcc) {
                        navigate('/dashboard/connect');
                        return;
                    }
                    setAccount(currentAcc);

                    // Fetch data
                    await Promise.all([
                        fetchPosts(activeTab),
                        fetchAnalytics()
                    ]);
                }
            } catch (err) {
                console.error('Dashboard load failed:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [platformId, navigate, activeTab]);

    const fetchPosts = async (type) => {
        const res = await fetchWithAuth(`/posts?platform=${platformId}&type=${type}`);
        if (res.ok) {
            const data = await res.json();
            setPosts(data);
        }
    };

    const fetchAnalytics = async () => {
        const res = await fetchWithAuth(`/analytics/overview?platform=${platformId}`);
        if (res.ok) {
            const data = await res.json();
            setAnalytics(data);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await Promise.all([
                fetchWithAuth('/posts/sync', { method: 'POST', body: JSON.stringify({ platform: platformId }) }),
                fetchWithAuth('/analytics/sync', { method: 'POST', body: JSON.stringify({ platform: platformId }) })
            ]);
            await Promise.all([fetchPosts(activeTab), fetchAnalytics()]);
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const growth = analytics?.current && analytics?.previous
        ? analytics.current.follower_count - analytics.previous.follower_count
        : 0;

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
                        <p className="text-slate-400 font-medium">Connected as <span className="text-blue-400 tracking-tight">{account?.platform_username}</span></p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-[#121212] text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    <button className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors">
                        Post Content
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Followers', value: analytics?.current?.follower_count.toLocaleString() || '0', trend: growth >= 0 ? `+${growth}` : growth, icon: Users },
                    { label: 'Total Engagement', value: (analytics?.summary?.total_likes + analytics?.summary?.total_comments).toLocaleString() || '0', trend: 'Lifetime', icon: Activity },
                    { label: 'Total Views', value: analytics?.summary?.total_views.toLocaleString() || '0', trend: 'Total', icon: Eye },
                    { label: 'Best Performing', value: analytics?.bestPost?.likes_count.toLocaleString() || 'N/A', trend: 'Likes', icon: Heart },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon size={20} className="text-slate-500" />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeof stat.trend === 'string' ? 'bg-white/5 text-slate-400' : (stat.trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Graph Placeholder */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <BarChart3 className="text-blue-500" size={24} /> Audience Engagement
                            </h3>
                            <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
                                <button className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-md">7D</button>
                                <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white">30D</button>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-1 mb-4">
                            {[25, 45, 30, 85, 45, 75, 55, 60, 95, 40, 65, 35, 70, 50, 80].map((v, i) => (
                                <div key={i} className="flex-1 bg-white/5 hover:bg-blue-500/30 transition-all cursor-pointer rounded-t-sm group relative" style={{ height: `${v}%` }}>
                                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-xl">
                                        {v * 12}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 tracking-widest uppercase">
                            <span>Feb 16</span><span>Feb 23</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-6">
                                <h3 className={`text-xl font-bold cursor-pointer transition-colors ${activeTab === 'POST' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('POST')}>
                                    Threads
                                </h3>
                                <h3 className={`text-xl font-bold cursor-pointer transition-colors ${activeTab === 'REPLY' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('REPLY')}>
                                    Replies
                                </h3>
                            </div>
                            <Link to="/dashboard/posts" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-slate-500 mb-4">No {activeTab.toLowerCase()}s synced yet.</p>
                                    <button onClick={handleSync} className="text-sm font-bold text-blue-500 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500/10 active:scale-95 transition-all">Sync Now</button>
                                </div>
                            ) : posts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/dashboard/post/${post.id}`}
                                    className="flex gap-6 p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-xl shrink-0 border border-white/5 flex items-center justify-center overflow-hidden">
                                        {post.media_url ? (
                                            <img src={post.media_url} alt="post" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon className="text-slate-800" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                {post.post_type === 'REPLY' && (
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Reply</span>
                                                )}
                                                <p className="text-white font-semibold text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">{post.content || 'Untitled Post'}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-tighter ml-4">{new Date(post.published_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-6">
                                            <span className="flex items-center gap-2 text-slate-400 text-xs font-bold"><Heart size={14} className="text-red-500" /> {post.likes_count}</span>
                                            {post.post_type === 'POST' && (
                                                <span className="flex items-center gap-2 text-slate-400 text-xs font-bold"><MessageCircle size={14} className="text-blue-400" /> {post.comments_count}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Perspective Section */}
                    {analytics?.bestPost && (
                        <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 underline decoration-purple-500 decoration-2 underline-offset-8">
                                    🏆 Top Performance
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 italic">"{analytics.bestPost.content}"</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Likes</p>
                                            <p className="text-lg font-black text-white">{analytics.bestPost.likes_count}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Engage</p>
                                            <p className="text-lg font-black text-white">{((analytics.bestPost.likes_count / 1000) * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meta Sidebar Content */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <TrendingUp className="text-orange-500" size={20} /> Content Discovery
                        </h3>
                        <div className="space-y-5">
                            {['Artificial Intelligence', 'Cybersecurity', 'Web Dev 2026', 'Remote Work'].map((tag, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-tight">#{tag.replace(' ', '')}</span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase">Hot</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlatformDashboard;
