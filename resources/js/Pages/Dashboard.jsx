import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PostCard from '@/Components/PostCard';

export default function Dashboard({
    auth,
    users = [],
    posts = [],
    incomingRequests = [],
    friendCount = 0,
    filters = {},
    premiumStatus = {},
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [postContent, setPostContent] = useState('');
    const notifications = usePage().props.notifications ?? [];

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search }, { preserveState: true, replace: true });
    };

    const sendRequest = (receiverId) => {
        router.post(route('connection-requests.store'), { receiver_id: receiverId }, { preserveScroll: true });
    };

    const acceptRequest = (id) => {
        router.post(route('connection-requests.accept', id), {}, { preserveScroll: true });
    };

    const declineRequest = (id) => {
        router.post(route('connection-requests.decline', id), {}, { preserveScroll: true });
    };

    const blockUser = (userId) => {
        if (!window.confirm('Block this user?')) return;
        router.post(route('blocks.store'), { blocked_user_id: userId });
    };

    const unblockUser = (userId) => {
        router.delete(route('blocks.destroy', userId));
    };

    const reportUser = (userId, name) => {
        const reason = window.prompt(`Report ${name}:`);
        if (!reason) return;
        router.post(route('reports.store'), { reported_user_id: userId, reason });
    };

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Dashboard */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-xl font-bold">Dashboard</h2>
                            <p>Friends: {friendCount}</p>

                            <div className="flex gap-2 mt-3">
                                <Link href={route('friends.index')} className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Friends
                                </Link>
                                <Link href={route('reports.index')} className="bg-red-500 text-white px-4 py-2 rounded">
                                    Safety
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded shadow">
                            <h3>Subscription</h3>
                            <p>Plan: {premiumStatus.plan_name ?? 'Free'}</p>
                            <Link href={route('subscriptions.index')} className="bg-yellow-500 text-white px-4 py-2 rounded mt-2 inline-block">
                                Plans
                            </Link>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3>Notifications</h3>
                        {notifications.map(n => (
                            <div key={n.id}>{n.title}</div>
                        ))}
                    </div>

                    {/* Incoming Requests */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3>Requests</h3>
                        {incomingRequests.map(r => (
                            <div key={r.id} className="flex items-center justify-between mb-2">
                                <span>{r.sender.name}</span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptRequest(r.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() => declineRequest(r.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search + Users */}
                    <div className="bg-white p-6 rounded shadow">
                        <form onSubmit={submitSearch} className="flex gap-2 mb-4">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border px-3 py-1 rounded w-full"
                                placeholder="Search users..."
                            />
                            <button className="bg-gray-700 text-white px-4 py-1 rounded">
                                Search
                            </button>
                        </form>

                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between border p-3 rounded mb-2">
                                <div>{u.name}</div>

                                <div className="flex gap-2">

                                    {/* Send Request */}
                                    {u.id !== auth.user.id && (
                                        <button
                                            onClick={() => sendRequest(u.id)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Send Request
                                        </button>
                                    )}

                                    {/* Block / Unblock */}
                                    {u.is_blocked ? (
                                        <button
                                            onClick={() => unblockUser(u.id)}
                                            className="bg-gray-700 text-white px-3 py-1 rounded"
                                        >
                                            Unblock
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => blockUser(u.id)}
                                            className="bg-gray-500 text-white px-3 py-1 rounded"
                                        >
                                            Block
                                        </button>
                                    )}

                                    {/* Report */}
                                    <button
                                        onClick={() => reportUser(u.id, u.name)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Report
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Newsfeed */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3>Newsfeed</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            router.post('/posts', { content: postContent }, {
                                onSuccess: () => setPostContent('')
                            });
                        }}>
                            <textarea
                                value={postContent}
                                onChange={e => setPostContent(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
                                Post
                            </button>
                        </form>

                        {posts.map(post => (
                            <PostCard key={post.id} post={post} auth={auth} />
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}