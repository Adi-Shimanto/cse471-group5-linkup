import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PostCard from '@/Components/PostCard';

export default function Dashboard({
    auth,
    users = [],
    posts = [],
    incomingRequests = [],
    friendCount = 0,
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [postContent, setPostContent] = useState('');

    const submitSearch = (e) => {
        e.preventDefault();

        router.get(
            route('dashboard'),
            { search: search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            route('dashboard'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const sendRequest = (receiverId) => {
        router.post(
            route('connection-requests.store'),
            { receiver_id: receiverId },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const acceptRequest = (id) => {
        router.post(
            route('connection-requests.accept', id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const declineRequest = (id) => {
        router.post(
            route('connection-requests.decline', id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const hasSearch = (filters.search ?? '').trim() !== '';

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    You currently have <span className="font-semibold">{friendCount}</span> friend{friendCount === 1 ? '' : 's'}.
                                </p>
                            </div>

                            <Link
                                href={route('friends.index')}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Open Friends Page
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Incoming Requests</h3>

                        {incomingRequests.length === 0 ? (
                            <p className="text-sm text-gray-600">No pending requests right now.</p>
                        ) : (
                            <div className="space-y-3">
                                {incomingRequests.map((requestItem) => (
                                    <div
                                        key={requestItem.id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-lg font-medium">{requestItem.sender.name}</p>
                                            <p className="text-sm text-gray-600">{requestItem.sender.email}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptRequest(requestItem.id)}
                                                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                            >
                                                Accept
                                            </button>

                                            <button
                                                onClick={() => declineRequest(requestItem.id)}
                                                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Search Profiles</h3>

                        <form onSubmit={submitSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                Search
                            </button>

                            <button
                                type="button"
                                onClick={clearSearch}
                                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                            >
                                Clear
                            </button>
                        </form>

                        {!hasSearch && (
                            <p className="text-sm text-gray-600">
                                Type a name or email to search for other users.
                            </p>
                        )}

                        {hasSearch && users.length === 0 && (
                            <p className="text-sm text-red-600">No profiles found.</p>
                        )}

                        {users.length > 0 && (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-lg font-medium">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>

                                        <div>
                                            {user.connection_status === 'accepted' ? (
                                                <button
                                                    disabled
                                                    className="cursor-not-allowed rounded-md bg-green-600 px-4 py-2 text-white"
                                                >
                                                    Connected
                                                </button>
                                            ) : user.connection_status === 'pending' && user.is_request_sender ? (
                                                <button
                                                    disabled
                                                    className="cursor-not-allowed rounded-md bg-amber-500 px-4 py-2 text-white"
                                                >
                                                    Request Sent
                                                </button>
                                            ) : user.connection_status === 'pending' ? (
                                                <button
                                                    disabled
                                                    className="cursor-not-allowed rounded-md bg-gray-500 px-4 py-2 text-white"
                                                >
                                                    Pending Response
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => sendRequest(user.id)}
                                                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                                >
                                                    Send Request
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-bold">Newsfeed</h3>

                        {/* Create Post Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.post('/posts', { content: postContent }, {
                                    preserveScroll: true,
                                    onSuccess: () => setPostContent(''),
                                });
                            }}
                            className="mb-6 flex flex-col gap-3"
                        >
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="self-end rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                            >
                                Post
                            </button>
                        </form>

                        {posts.length === 0 ? (
                            <p className="text-gray-500">No posts yet. Be the first to post!</p>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        auth={auth}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
