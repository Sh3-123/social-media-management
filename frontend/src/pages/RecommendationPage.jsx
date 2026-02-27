import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const RecommendationPage = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [copiedContent, setCopiedContent] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Please enter a topic or content idea.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetchWithAuth('/recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.details || 'Failed to fetch recommendations');
            }

            setResult(data);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        const textToCopy = `
Idea: ${result.contentIdea}

Post:
${result.postText}

Direction: ${result.contentDirection}

Hashtags: ${result.hashtags.join(' ')}
        `.trim();

        navigator.clipboard.writeText(textToCopy);
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                    AI Content Recommendation
                </h1>
                <p className="mt-2 text-slate-400">
                    Enter a topic below to generate ideas, post copy, hashtags, and strategic direction with our AI.
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 mb-8 shadow-sm">
                <form onSubmit={handleGenerate}>
                    <div className="mb-4">
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                            What do you want to post about?
                        </label>
                        <textarea
                            id="prompt"
                            rows="4"
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                            placeholder="Enter topic or describe content idea (e.g., 'Web development productivity tips for remote workers')"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={loading}
                        ></textarea>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20 hover:shadow-blue-900/40"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {result && (
                <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="border-b border-white/10 bg-[#1a1a1a] p-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Generated Content</h2>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-white/5"
                            title="Copy to clipboard"
                        >
                            {copiedContent ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            <span className="hidden sm:inline">{copiedContent ? 'Copied!' : 'Copy Mix'}</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Summary & Direction Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Idea</h3>
                                <p className="text-white font-medium leading-relaxed">{result.contentIdea}</p>
                            </div>

                            <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Creative Direction</h3>
                                <p className="text-slate-300 leading-relaxed text-sm">{result.contentDirection}</p>
                            </div>
                        </div>

                        {/* Main Post Content */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Suggested Post</h3>
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative group">
                                <p className="text-white whitespace-pre-wrap leading-relaxed text-lg">
                                    {result.postText}
                                </p>
                            </div>
                        </div>

                        {/* Hashtags & Tips Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Hashtags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.hashtags?.map((tag, idx) => (
                                        <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
                                            {tag.startsWith('#') ? tag : `#${tag}`}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-5">
                                <h3 className="text-xs font-bold text-yellow-500/70 uppercase tracking-wider mb-2">Pro Tips</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">{result.tips}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationPage;
