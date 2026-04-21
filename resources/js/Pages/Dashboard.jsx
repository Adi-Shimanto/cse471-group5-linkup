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
    const [search, setSearch] = useState(filters.search ?? '');
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
        router.post(route('connection-requests.store'), { receiver_id: receiverId }, { preserveScroll: true, preserveState: true });
    };

    const acceptRequest = (id) => {
        router.post(route('connection-requests.accept', id), {}, { preserveScroll: true, preserveState: true });
    };

    const declineRequest = (id) => {
        router.post(route('connection-requests.decline', id), {}, { preserveScroll: true, preserveState: true });
    };

    const blockUser = (userId) => {
        if (!window.confirm('Block this user? This will remove any existing connection.')) return;
        router.post(route('blocks.store'), { blocked_user_id: userId }, { preserveScroll: true });
    };

    const unblockUser = (userId) => {
        router.delete(route('blocks.destroy', userId), { preserveScroll: true });
    };

    const reportUser = (userId, userName) => {
        const reason = window.prompt(`Why are you reporting ${userName}?`);
        if (!reason) return;
        const description = window.prompt('Add extra details for the admin (optional):') ?? '';
        router.post(route('reports.store'), { reported_user_id: userId, reason, description }, { preserveScroll: true });
    };

    const hasSearch = (filters.search ?? '').trim() !== '';

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                You currently have <span className="font-semibold">{friendCount}</span> friend{friendCount === 1 ? '' : 's'}.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link href={route('friends.index')} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                    Open Friends Page
                                </Link>
                                <Link href={route('reports.index')} className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
                                    Safety Center
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Current plan: <span className="font-semibold">{premiumStatus.plan_name ?? 'Free'}</span>
                                    </p>
                                </div>
                                <Link href={route('subscriptions.index')} className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                                    Manage Plans
                                </Link>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">
                                {premiumStatus.is_premium
                                    ? `Premium access is active${premiumStatus.expires_at ? ` until ${premiumStatus.expires_at}` : ''}.`
                                    : 'Free users have limited search and matchmaking. Upgrade to unlock the premium features.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Recent Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-sm text-gray-600">No notifications yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{notification.created_at}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Incoming Requests</h3>
                        {incomingRequests.length === 0 ? (
                            <p className="text-sm text-gray-600">No pending requests right now.</p>
                        ) : (
                            <div className="space-y-3">
                                {incomingRequests.map((requestItem) => (
                                    <div key={requestItem.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-lg font-medium">{requestItem.sender.name}</p>
                                            <p className="text-sm text-gray-600">{requestItem.sender.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => acceptRequest(requestItem.id)} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Accept</button>
                                            <button onClick={() => declineRequest(requestItem.id)} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Search Profiles</h3>
                        <form onSubmit={submitSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Search</button>
                            <button type="button" onClick={clearSearch} className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">Clear</button>
                        </form>

                        {!hasSearch && <p className="text-sm text-gray-600">Type a name or email to search for other users.</p>}
                        {hasSearch && users.length === 0 && <p className="text-sm text-red-600">No profiles found.</p>}

                        {users.length > 0 && (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.id} className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-lg font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {user.is_blocked ? (
                                                    <button onClick={() => unblockUser(user.id)} className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800">Unblock</button>
                                                ) : user.connection_status === 'accepted' ? (
                                                    <button disabled className="cursor-not-allowed rounded-md bg-green-600 px-4 py-2 text-white">Connected</button>
                                                ) : user.connection_status === 'pending' && user.is_request_sender ? (
                                                    <button disabled className="cursor-not-allowed rounded-md bg-amber-500 px-4 py-2 text-white">Request Sent</button>
                                                ) : user.connection_status === 'pending' ? (
                                                    <button disabled className="cursor-not-allowed rounded-md bg-gray-500 px-4 py-2 text-white">Pending Response</button>
                                                ) : (
                                                    <button onClick={() => sendRequest(user.id)} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Send Request</button>
                                                )}

                                                {!user.is_blocked && (
                                                    <button onClick={() => blockUser(user.id)} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">Block</button>
                                                )}

                                                <button onClick={() => reportUser(user.id, user.name)} className="rounded-md bg-rose-500 px-4 py-2 text-white hover:bg-rose-600">Report</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-bold">Newsfeed</h3>
                        {posts.length === 0 ? (
                            <p className="text-gray-500">No posts yet. Be the first to post!</p>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="rounded-lg border p-4">
                                        <p className="font-semibold">{post.user?.name}</p>
                                        <p className="mt-2 text-gray-700">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
