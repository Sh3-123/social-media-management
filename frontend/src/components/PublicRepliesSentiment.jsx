import React from 'react';
import { MessagesSquare, Sparkles } from 'lucide-react';

const PublicRepliesSentiment = ({ repliesSentimentData, loading }) => {
    if (loading) return null; // We can show a skeleton if needed, but null is fine for now
    if (!repliesSentimentData || repliesSentimentData.length === 0) return null;

    // Aggregate Data
    const total = repliesSentimentData.length;
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    // Track cumulative scores for each emotion across all replies
    const emotionCumulativeScores = {};

    repliesSentimentData.forEach(item => {
        if (!item) return;

        // Count overall sentiment
        if (item.sentiment === 'positive') positive++;
        else if (item.sentiment === 'negative') negative++;
        else neutral++;

        // Add up all emotion scores from the breakdown
        if (item.breakdown && Array.isArray(item.breakdown)) {
            item.breakdown.forEach(emotionItem => {
                emotionCumulativeScores[emotionItem.label] = (emotionCumulativeScores[emotionItem.label] || 0) + emotionItem.score;
            });
        }
    });

    const posPct = Math.round((positive / total) * 100) || 0;
    const negPct = Math.round((negative / total) * 100) || 0;
    const neuPct = Math.round((neutral / total) * 100) || 0;

    // Calculate average scores and sort them descending
    const avgEmotions = Object.entries(emotionCumulativeScores)
        .filter(([label]) => !['neutral', 'positive', 'negative'].includes(label.toLowerCase()))
        .map(([label, totalScore]) => ({
            label,
            avgScore: totalScore / total
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 6); // Take top 6 average emotions

    return (
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden mb-6 shadow-sm dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <MessagesSquare size={18} className="text-blue-500 dark:text-blue-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Aggregated Audience Sentiment</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sentiment Distribution */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Tone</p>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-emerald-500 dark:text-emerald-400 font-medium">Positive</span>
                                    <span className="text-slate-500 dark:text-slate-400">{posPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${posPct}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Neutral</span>
                                    <span className="text-slate-500 dark:text-slate-400">{neuPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full bg-slate-400" style={{ width: `${neuPct}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-rose-500 dark:text-rose-400 font-medium">Negative</span>
                                    <span className="text-slate-500 dark:text-slate-400">{negPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full bg-rose-500 dark:bg-rose-400" style={{ width: `${negPct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Emotions (Averaged) */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Average Emotions</p>
                        <div className="space-y-3">
                            {avgEmotions.map((emotion, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">{emotion.label}</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-bold">{Math.round(emotion.avgScore * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
                                            style={{ width: `${Math.max(emotion.avgScore * 100, 1)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicRepliesSentiment;
