import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AiMatch({ auth, suggestions = [], aiMessage = null, interests = '' }) {
    const [input, setInput] = useState(interests);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setLoading(true);

        router.post(route('ai.match.post'), { interests: input }, {
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Match" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">AI Friend Matcher</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Tell us your interests and our AI will suggest the best matches for you!
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="e.g. I love coding, reading sci-fi books, playing chess and hiking..."
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-indigo-600 px-6 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Finding matches...' : 'Find My Matches'}
                            </button>
                        </form>
                    </div>

                    {aiMessage && (
                        <div className="bg-indigo-50 border border-indigo-200 p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-sm font-semibold text-indigo-800 mb-2">AI Suggestion</h3>
                            <p className="text-sm text-indigo-700">{aiMessage}</p>
                        </div>
                    )}

                    {suggestions.length > 0 && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-4">Suggested People</h3>
                            <div className="space-y-3">
                                {suggestions.map(user => (
                                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => router.post(route('connection-requests.store'), { receiver_id: user.id }, { preserveScroll: true })}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}