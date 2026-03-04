import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { Mail, Lock, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetchWithAuth('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });

            const contentType = res.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (!isJson) {
                throw new Error('Server is unavailable. Please make sure the backend is running.');
            }

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.error ? `${data.message}: ${data.error}` : (data.message || 'Signup failed');
                throw new Error(errorMessage);
            }

            setSuccess('Verification email sent. Please check your inbox.');
            // Let them manually go to login or wait a bit
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <div className="absolute top-4 right-4 md:top-8 md:right-8">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Logo className="h-12 w-12 mx-auto mb-4" />
                <h2 className="mt-6 text-3xl font-extrabold text-blue-600 dark:text-blue-500">Create an account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Start managing your social media today
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-[#121212] py-8 px-4 shadow-xl shadow-black/5 dark:shadow-black/50 sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-white/10 transition-colors duration-200">
                    {error && (
                        <div className="mb-4 bg-red-900/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-900/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">
                            {success}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 block w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-400 dark:hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-400 dark:hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-400 dark:hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 block w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-400 dark:hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 rounded-lg text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white dark:text-black bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#121212] focus:ring-blue-500 dark:focus:ring-white transition-colors disabled:opacity-70"
                            >
                                {loading ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
