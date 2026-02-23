import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home, BarChart2, MessageSquare,
    Settings, LogOut, Menu, X, Bell,
    PlusCircle, AtSign, Youtube
} from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [connectedAccounts, setConnectedAccounts] = useState([]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetchWithAuth('/platforms/accounts');
                if (res.ok) {
                    const data = await res.json();
                    setConnectedAccounts(data);
                }
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
            }
        };
        fetchAccounts();
    }, [location.pathname]);

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: PlusCircle, label: 'Connect Platforms', path: '/dashboard/connect' },
        { icon: BarChart2, label: 'Global Analytics', path: '/analytics' },
    ];

    const platformIcons = {
        threads: AtSign,
        youtube: Youtube
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-slate-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/80 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#121212] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-white text-black font-bold rounded-lg flex items-center justify-center text-xl tracking-tighter">
                            S
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            SocialSync
                        </span>
                    </div>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                                {item.label}
                            </Link>
                        );
                    })}

                    {connectedAccounts.length > 0 && (
                        <div className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Connected Platforms</p>
                            {connectedAccounts.map((account) => {
                                const Icon = platformIcons[account.platform.toLowerCase()] || MessageSquare;
                                const path = `/dashboard/${account.platform.toLowerCase()}`;
                                const isActive = location.pathname === path;
                                return (
                                    <Link
                                        key={account.platform}
                                        to={path}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 mr-3 ${isActive ? (account.platform === 'youtube' ? 'text-red-500' : 'text-white') : 'text-slate-500'}`} />
                                        {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content Component */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-[#121212] border-b border-white/10 h-16 flex items-center justify-between px-4 sm:px-6 z-10">
                    <div className="flex items-center">
                        <button
                            className="lg:hidden text-slate-400 hover:text-white mr-4"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-white hidden sm:block">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="text-slate-400 hover:text-white relative">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#121212]" />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-md cursor-pointer">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors bg-[#1a1a1a] px-3 py-1.5 rounded-md border border-white/10 hover:bg-[#252525]"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Area */}
                <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
