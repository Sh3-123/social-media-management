import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, AtSign, Plus, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function PlatformSelection() {
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showThreadsModal, setShowThreadsModal] = useState(false);
    const [threadsToken, setThreadsToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetchWithAuth('/platforms/accounts');
            if (res.ok) {
                const data = await res.json();
                setConnectedAccounts(data);
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const isConnected = (platform) => {
        return connectedAccounts.some(acc => acc.platform.toLowerCase() === platform.toLowerCase());
    };

    const handleConnect = async (platform) => {
        if (platform === 'threads') {
            setShowThreadsModal(true);
            return;
        }

        // Mock YouTube connection
        await submitConnection('youtube', `mock_yt_token_${Date.now()}`, 'YouTube Creator', `yt_${Date.now()}`);
    };

    const submitConnection = async (platform, token, username, platform_user_id) => {
        try {
            const res = await fetchWithAuth('/platforms/connect', {
                method: 'POST',
                body: JSON.stringify({
                    platform,
                    token,
                    username,
                    platform_user_id
                })
            });
            if (res.ok) {
                fetchAccounts();
                setShowThreadsModal(false);
                setThreadsToken('');
            }
        } catch (err) {
            console.error('Connection failed:', err);
        }
    };

    const handleThreadsSubmit = (e) => {
        e.preventDefault();
        if (!threadsToken) return;
        submitConnection('threads', threadsToken, '@threads_user', `threads_${Date.now()}`);
    };

    const handleDisconnect = async (platform) => {
        try {
            const res = await fetchWithAuth(`/platforms/disconnect/${platform}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchAccounts();
            }
        } catch (err) {
            console.error('Disconnect failed:', err);
        }
    };

    const platforms = [
        {
            id: 'threads',
            name: 'Threads',
            icon: AtSign,
            color: 'text-white',
            bg: 'bg-[#121212]',
            description: 'Connect your Threads account using a Long-Lived Access Token to manage posts and track analytics.'
        },
        {
            id: 'youtube',
            name: 'YouTube',
            icon: Youtube,
            color: 'text-red-500',
            bg: 'bg-[#121212]',
            description: 'Connect your YouTube channel to track performance, manage content and analyze audience growth.'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Connect Your Platforms</h1>
                <p className="text-slate-400">Get started by linking your social media accounts to see your unified metrics.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                    const connected = isConnected(platform.id);
                    const Icon = platform.icon;

                    return (
                        <div key={platform.id} className={`${platform.bg} border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 flex flex-col justify-between`}>
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl bg-white/5 ${platform.color}`}>
                                        <Icon size={32} />
                                    </div>
                                    {connected && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">
                                            <CheckCircle2 size={14} />
                                            Connected
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    {platform.description}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {connected ? (
                                    <>
                                        <button
                                            onClick={() => navigate(`/dashboard/${platform.id}`)}
                                            className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            View Dashboard <ChevronRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDisconnect(platform.id)}
                                            className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Disconnect Account"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(platform.id)}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Connect {platform.name}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Threads Token Modal */}
            {showThreadsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AtSign className="text-white" size={24} /> Connect Threads
                            </h3>
                            <button onClick={() => setShowThreadsModal(false)} className="text-slate-400 hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleThreadsSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Long-Lived Access Token</label>
                                <textarea
                                    value={threadsToken}
                                    onChange={(e) => setThreadsToken(e.target.value)}
                                    placeholder="Paste your Threads access token here..."
                                    className="w-full h-32 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                                    required
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    You can get this token from the Meta for Developers portal after setting up a Threads App.
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Verify & Connect Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlatformSelection;
