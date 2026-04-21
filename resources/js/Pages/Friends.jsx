import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Friends({ auth, friends = [], friendCount = 0 }) {
    const removeFriend = (connectionRequestId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;
        router.delete(route('friends.remove', connectionRequestId), { preserveScroll: true });
    };

    const blockUser = (userId) => {
        if (!window.confirm('Block this friend? This will also remove the friendship.')) return;
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

    return (
        <AuthenticatedLayout user={auth.user} friendCount={friendCount}>
            <Head title="Friends" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
                                <p className="mt-1 text-sm text-gray-600">Total friends: <span className="font-semibold">{friendCount}</span></p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link href={route('dashboard')} className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Back to Dashboard</Link>
                                <Link href={route('reports.index')} className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Safety Center</Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        {friends.length === 0 ? (
                            <p className="text-sm text-gray-600">You do not have any friends added yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {friends.map((friend) => (
                                    <div key={friend.connection_request_id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-lg font-medium">{friend.name}</p>
                                            <p className="text-sm text-gray-600">{friend.email}</p>
                                            {friend.is_blocked && <p className="mt-1 text-xs font-semibold text-red-600">Currently blocked</p>}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => removeFriend(friend.connection_request_id)} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">Remove Friend</button>
                                            {friend.is_blocked ? (
                                                <button onClick={() => unblockUser(friend.id)} className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800">Unblock</button>
                                            ) : (
                                                <button onClick={() => blockUser(friend.id)} className="rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">Block</button>
                                            )}
                                            <button onClick={() => reportUser(friend.id, friend.name)} className="rounded-md bg-rose-500 px-4 py-2 text-white hover:bg-rose-600">Report</button>
                                        </div>
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
