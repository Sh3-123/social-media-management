import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No reset token provided. Please request a new password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage("Password must be at least 6 characters");
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetchWithAuth('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setStatus('success');
            setMessage(data.message);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-[#121212] py-8 px-4 shadow-xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-white/10 text-center">
                    <div className="mb-4 bg-red-900/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">
                        {message}
                    </div>
                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="h-12 w-12 bg-white text-black font-bold rounded-xl flex items-center justify-center text-2xl tracking-tighter mx-auto mb-4">
                    S
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-blue-500">Create New Password</h2>
                <p className="mt-2 text-sm text-slate-400">
                    Enter your new password below
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#121212] py-8 px-4 shadow-xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-white/10">
                    {status === 'error' && (
                        <div className="mb-4 bg-red-900/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">
                            {message}
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="mb-4 bg-green-900/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">
                            {message} Redirecting to login...
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-slate-500 outline-none hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="••••••••"
                                    disabled={status === 'loading' || status === 'success'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 block w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-slate-500 outline-none hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="••••••••"
                                    disabled={status === 'loading' || status === 'success'}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-black bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-white transition-colors disabled:opacity-70"
                            >
                                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
