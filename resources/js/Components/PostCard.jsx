import { useState } from 'react';
import { router } from '@inertiajs/react';

const EMOJIS = [
    { key: 'like', icon: '👍' },
    { key: 'love', icon: '❤️' },
    { key: 'haha', icon: '😂' },
    { key: 'wow', icon: '😮' },
    { key: 'sad', icon: '😢' },
    { key: 'angry', icon: '😡' },
];

export default function PostCard({ post, auth }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Find if current user already reacted
    const myReaction = post.reactions?.find(
        (r) => r.user_id === auth.user.id
    );

    const submitComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        router.post(
            route('comments.store', post.id),
            { content: commentText },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => setCommentText(''),
            }
        );
    };

    const deleteComment = (commentId) => {
        router.delete(
            route('comments.destroy', commentId),
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const reactToPost = (emojiKey) => {
        if (myReaction && myReaction.emoji === emojiKey) {
            // Remove reaction if clicking same emoji
            router.delete(
                route('reactions.destroy', post.id),
                {
                    preserveScroll: true,
                    preserveState: false,
                }
            );
        } else {
            router.post(
                route('reactions.store', post.id),
                { emoji: emojiKey },
                {
                    preserveScroll: true,
                    preserveState: false,
                }
            );
        }
        setShowEmojiPicker(false);
    };

    const sharePost = () => {
        router.post(
            route('shares.store', post.id),
            {},
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    // Count reactions by emoji
    const reactionCounts = {};
    post.reactions?.forEach((r) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    return (
        <div className="rounded-lg border p-4 space-y-3">

            {/* Post Header */}
            <div>
                <p className="font-semibold">{post.user?.name}</p>
                <p className="mt-2 text-gray-700">{post.content}</p>
            </div>

            {/* Reaction Summary */}
            {post.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center gap-1">
                            {EMOJIS.find(e => e.key === emoji)?.icon} {count}
                        </span>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 border-t pt-3 relative">

                {/* React Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`text-sm px-3 py-1 rounded-md ${
                            myReaction
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {myReaction
                            ? `${EMOJIS.find(e => e.key === myReaction.emoji)?.icon} Reacted`
                            : '👍 React'}
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-10 left-0 flex gap-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                            {EMOJIS.map((e) => (
                                <button
                                    key={e.key}
                                    onClick={() => reactToPost(e.key)}
                                    className="text-xl hover:scale-125 transition-transform"
                                    title={e.key}
                                >
                                    {e.icon}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comment Button */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-sm px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    💬 Comments ({post.comments?.length || 0})
                </button>

                {/* Share Button */}
                <button
                    onClick={sharePost}
                    className="text-sm px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    🔗 Share ({post.shares?.length || 0})
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="space-y-3 border-t pt-3">

                    {/* Existing Comments */}
                    {post.comments?.length === 0 && (
                        <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
                    )}

                    {post.comments?.map((comment) => (
                        <div key={comment.id} className="flex items-start justify-between bg-gray-50 rounded-lg p-3">
                            <div>
                                <p className="text-sm font-semibold">{comment.user?.name}</p>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>

                            {/* Delete button - only for comment owner */}
                            {comment.user_id === auth.user.id && (
                                <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Comment Form */}
                    <form onSubmit={submitComment} className="flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}