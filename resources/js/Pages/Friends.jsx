import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Friends({ auth, friends = [], friendCount = 0 }) {

    const removeFriend = (connectionRequestId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;
        router.delete(route('friends.remove', connectionRequestId), { preserveScroll: true });
    };

    const blockUser = (id) => {
        if (!confirm('Block user?')) return;
        router.post(route('blocks.store'), { blocked_user_id: id });
    };

    const unblockUser = (id) => {
        router.delete(route('blocks.destroy', id));
    };

    const reportUser = (id, name) => {
        const reason = prompt(`Report ${name}:`);
        if (!reason) return;
        const description = window.prompt('Add extra details (optional):') ?? '';
        router.post(route('reports.store'), {
            reported_user_id: id,
            reason,
            description
        }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Friends" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Header */}
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Friends</h2>
                                <p>Total friends: {friendCount}</p>
                            </div>

                            <div className="flex gap-3">
                                <Link href={route('dashboard')} className="btn bg-gray-700 text-white px-4 py-2 rounded">
                                    Dashboard
                                </Link>
                                <Link href={route('reports.index')} className="btn bg-red-600 text-white px-4 py-2 rounded">
                                    Safety
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Friend List */}
                    <div className="bg-white p-6 rounded shadow">
                        {friends.length === 0 ? (
                            <p>No friends yet.</p>
                        ) : (
                            friends.map((friend) => (
                                <div key={friend.connection_request_id} className="border p-4 mb-3 rounded">
                                    <p className="font-bold">{friend.name}</p>
                                    <p>{friend.email}</p>

                                    {friend.is_blocked && (
                                        <p className="text-red-500 text-sm">Blocked</p>
                                    )}

                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => removeFriend(friend.connection_request_id)}
                                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                                        >
                                            Remove
                                        </button>

                                        {friend.is_blocked
                                            ? <button 
                                                onClick={() => unblockUser(friend.id)}
                                                className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                                              >Unblock</button>
                                            : <button 
                                                onClick={() => blockUser(friend.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                              >Block</button>
                                        }

                                        <button 
                                            onClick={() => reportUser(friend.id, friend.name)}
                                            className="bg-rose-500 text-white px-3 py-1 rounded hover:bg-rose-600"
                                        >
                                            Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}