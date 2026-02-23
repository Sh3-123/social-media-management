import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Heart,
    MessageCircle,
    Eye,
    Calendar,
    AtSign,
    Youtube,
    Share2,
    ExternalLink
} from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true);
                const postRes = await fetchWithAuth(`/posts/${id}`);

                if (postRes.ok) {
                    const postData = await postRes.json();
                    setPost(postData);

                    // Now fetch comments using the PLATFORM post ID as the parent
                    const commRes = await fetchWithAuth(`/posts?platform=threads&parent=${postData.platform_post_id}`);
                    if (commRes.ok) {
                        const commData = await commRes.json();
                        setComments(commData);
                    }
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Fetch post detail failed:', err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!post) return null;

    const Icon = post.platform === 'threads' ? AtSign : Youtube;
    const platformColor = post.platform === 'threads' ? 'text-white' : 'text-red-500';

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-widest">Back to Dashboard</span>
            </button>

            <div className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {post.media_url && (
                    <div className="w-full h-96 overflow-hidden border-b border-white/10">
                        <img src={post.media_url} alt="Post content" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-white/5 ${platformColor}`}>
                                <Icon size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white capitalize">{post.platform} Post</h2>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Calendar size={14} />
                                    <span>{new Date(post.published_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <Share2 size={20} />
                            </button>
                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-12">
                        <p className="text-xl md:text-2xl text-white leading-relaxed font-medium whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-12">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                            <Heart className="mx-auto mb-3 text-red-500" size={24} />
                            <p className="text-2xl font-black text-white">{post.likes_count.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Likes</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                            <MessageCircle className="mx-auto mb-3 text-blue-400" size={24} />
                            <p className="text-2xl font-black text-white">{post.comments_count.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comments</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                            <Eye className="mx-auto mb-3 text-slate-400" size={24} />
                            <p className="text-2xl font-black text-white">{post.views_count.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Views</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <MessageCircle className="text-blue-500" size={24} />
                    Public Replies <span className="text-slate-500 text-sm font-medium">({comments.length})</span>
                </h3>

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <div className="bg-[#121212] border border-white/5 border-dashed rounded-2xl p-8 text-center">
                            <p className="text-slate-500 font-medium italic">No public replies detected for this thread.</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs ring-1 ring-blue-500/30">
                                            {comment.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">@{comment.username}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                {new Date(comment.published_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart size={14} className="text-slate-600 hover:text-red-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                <p className="text-white text-md leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                    Return to Feed
                </button>
            </div>
        </div>
    );
}

export default PostDetailPage;
