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

    const clearSearch = () => {
        setSearch('');
        router.get(route('dashboard'), {}, { preserveState: true, replace: true });
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

    const hasSearch = (filters.search ?? '').trim() !== '';

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Dashboard + Subscription */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-xl font-bold">Dashboard</h2>
                            <p>Friends: {friendCount}</p>
                            <Link href={route('friends.index')} className="btn">Friends</Link>
                            <Link href={route('reports.index')} className="btn bg-red-500">Safety</Link>
                        </div>

                        <div className="bg-white p-6 rounded shadow">
                            <h3>Subscription</h3>
                            <p>Plan: {premiumStatus.plan_name ?? 'Free'}</p>
                            <Link href={route('subscriptions.index')} className="btn bg-yellow-500">Plans</Link>
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
                            <div key={r.id}>
                                {r.sender.name}
                                <button onClick={() => acceptRequest(r.id)}>Accept</button>
                                <button onClick={() => declineRequest(r.id)}>Decline</button>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="bg-white p-6 rounded shadow">
                        <form onSubmit={submitSearch}>
                            <input value={search} onChange={e => setSearch(e.target.value)} />
                            <button>Search</button>
                        </form>

                        {users.map(u => (
                            <div key={u.id}>
                                {u.name}
                                {u.is_blocked
                                    ? <button onClick={() => unblockUser(u.id)}>Unblock</button>
                                    : <button onClick={() => blockUser(u.id)}>Block</button>
                                }
                                <button onClick={() => reportUser(u.id, u.name)}>Report</button>
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
                            <textarea value={postContent} onChange={e => setPostContent(e.target.value)} />
                            <button>Post</button>
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