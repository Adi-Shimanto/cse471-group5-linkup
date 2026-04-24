import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({
    auth,
    users = [],
    posts = [],
    incomingRequests = [],
    friendCount = 0,
    filters = {},
    premiumStatus = {},
}) {
    const page = usePage();
    const [search, setSearch] = useState(filters.search ?? '');
    const notifications = page.props.notifications ?? [];

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard'), { search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('dashboard'), {}, { preserveState: true, replace: true });
    };

    const sendRequest = (receiverId) => {
        router.post(route('connection-requests.store'), { receiver_id: receiverId }, { preserveScroll: true, preserveState: true });
    };

    const acceptRequest = (id) => {
        router.post(route('connection-requests.accept', id), {}, { preserveScroll: true, preserveState: true });
    };

    const declineRequest = (id) => {
        router.post(route('connection-requests.decline', id), {}, { preserveScroll: true, preserveState: true });
    };

    const blockUser = (userId) => {
        if (!window.confirm('Block this user?')) return;
        router.post(route('blocks.store'), { blocked_user_id: userId }, { preserveScroll: true });
    };

    const unblockUser = (userId) => {
        router.delete(route('blocks.destroy', userId), { preserveScroll: true });
    };

    const reportUser = (userId, userName) => {
        const reason = window.prompt(`Why are you reporting ${userName}?`);
        if (!reason) return;
        router.post(route('reports.store'), { reported_user_id: userId, reason }, { preserveScroll: true });
    };

    const hasSearch = (filters.search ?? '').trim() !== '';

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">

                    {/* Dashboard + Subscription */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h2 className="text-xl font-semibold">Dashboard</h2>
                            <p>You have {friendCount} friends</p>
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3>Subscription</h3>
                            <p>Plan: {premiumStatus.plan_name ?? 'Free'}</p>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3>Notifications</h3>
                        {notifications.length === 0 ? 'No notifications' : notifications.map(n => (
                            <div key={n.id}>{n.title}</div>
                        ))}
                    </div>

                    {/* Incoming Requests */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3>Incoming Requests</h3>
                        {incomingRequests.map(r => (
                            <div key={r.id}>
                                {r.sender.name}
                                <button onClick={() => acceptRequest(r.id)}>Accept</button>
                                <button onClick={() => declineRequest(r.id)}>Decline</button>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3>Search</h3>
                        <form onSubmit={submitSearch}>
                            <input value={search} onChange={e => setSearch(e.target.value)} />
                            <button>Search</button>
                        </form>

                        {users.map(u => (
                            <div key={u.id}>
                                {u.name}
                                <button onClick={() => sendRequest(u.id)}>Connect</button>
                                <button onClick={() => blockUser(u.id)}>Block</button>
                                <button onClick={() => reportUser(u.id, u.name)}>Report</button>
                            </div>
                        ))}
                    </div>

                    {/* Posts */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3>Posts</h3>
                        {posts.map(p => (
                            <div key={p.id}>{p.content}</div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}