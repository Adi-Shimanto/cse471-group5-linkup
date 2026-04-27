import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AiMatch({ 
    auth, 
    suggestions = [], 
    aiMessage = null, 
    interests = '', 
    remainingSearches = 3, 
    isPremium = false,
    error = null
}) {
    const [input, setInput] = useState(interests);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Frontend block for free users with no searches left
        if (!isPremium && remainingSearches === 0) {
            alert('Daily search limit reached (3/day). Please upgrade to Premium for unlimited AI matches!');
            return;
        }

        setLoading(true);
        router.post(route('ai.match.post'), { interests: input }, {
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const sendConnectionRequest = (userId) => {
        router.post(route('connection-requests.store'), { receiver_id: userId }, { 
            preserveScroll: true 
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Match" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">AI Friend Matcher</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Tell us your interests and our AI will suggest the best matches for you!
                        </p>

                        {/* Free User Limit Banner */}
                        {!isPremium && (
                            <div className={`mb-4 p-4 rounded-lg ${remainingSearches > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                                <p className={remainingSearches > 0 ? 'text-yellow-800' : 'text-red-800'}>
                                    {remainingSearches > 0 ? (
                                        <>🔍 <strong>{remainingSearches}</strong> AI {remainingSearches === 1 ? 'search' : 'searches'} remaining today.</>
                                    ) : (
                                        <>❌ Daily search limit reached (3/day).</>
                                    )}
                                    <Link href={route('subscriptions.index')} className="ml-2 font-semibold underline">
                                        Upgrade to Premium for unlimited AI matches!
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* Premium User Banner */}
                        {isPremium && (
                            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
                                <p className="text-green-800">
                                    ⭐ <strong>Premium Access:</strong> Unlimited AI searches activated!
                                </p>
                            </div>
                        )}

                        {/* Search Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. introvert, extrovert, coding, reading, gaming, hiking, networking..."
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                disabled={!isPremium && remainingSearches === 0}
                            />
                            <button
                                type="submit"
                                disabled={loading || (!isPremium && remainingSearches === 0)}
                                className="rounded-md bg-indigo-600 px-6 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Finding matches...' : 'Find My Matches'}
                            </button>
                        </form>
                    </div>

                    {/* AI Suggestion Message */}
                    {aiMessage && (
                        <div className="bg-indigo-50 border border-indigo-200 p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-sm font-semibold text-indigo-800 mb-2">🤖 AI Suggestion</h3>
                            <p className="text-sm text-indigo-700">{aiMessage}</p>
                        </div>
                    )}

                    {/* Suggested People Results */}
                    {suggestions.length > 0 && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-4">
                                Suggested People ({suggestions.length})
                            </h3>
                            <div className="space-y-3">
                                {suggestions.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                {user.compatibility_score && user.compatibility_score > 70 && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        user.compatibility_score > 80 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {user.compatibility_score > 80 ? '⭐ High Match' : '👍 Good Match'} ({user.compatibility_score}%)
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            {user.personality && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    🎭 {user.personality} • 💬 {user.communication_style || 'Any style'}
                                                </p>
                                            )}
                                            {user.compatibility_score && (
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Match:</span>
                                                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-indigo-600 rounded-full"
                                                                style={{ width: `${user.compatibility_score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold">{user.compatibility_score}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => sendConnectionRequest(user.id)}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results Message */}
                    {interests && suggestions.length === 0 && !loading && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg text-center">
                            <p className="text-gray-500">
                                No matches found for "{interests}". Try different interests!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}