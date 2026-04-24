import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Friends({ auth, friends = [], friendCount = 0 }) {

<<<<<<< HEAD
    const removeFriend = (connectionRequestId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;
        router.delete(route('friends.remove', connectionRequestId), { preserveScroll: true });
=======
    const removeFriend = (id) => {
        if (!confirm('Remove friend?')) return;
        router.delete(route('friends.remove', id));
>>>>>>> 07f61644a858a7f1a889cbb5a36912052411236a
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
<<<<<<< HEAD
        const description = window.prompt('Add extra details (optional):') ?? '';
        router.post(route('reports.store'), {
            reported_user_id: userId,
            reason,
            description
        }, { preserveScroll: true });
=======

        router.post(route('reports.store'), {
            reported_user_id: id,
            reason,
        });
>>>>>>> 07f61644a858a7f1a889cbb5a36912052411236a
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Friends" />
<<<<<<< HEAD

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
                                <Link href={route('dashboard')} className="btn bg-gray-700">
                                    Dashboard
                                </Link>
                                <Link href={route('reports.index')} className="btn bg-red-600">
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
                                        <button onClick={() => removeFriend(friend.connection_request_id)}>
                                            Remove
                                        </button>

                                        {friend.is_blocked
                                            ? <button onClick={() => unblockUser(friend.id)}>Unblock</button>
                                            : <button onClick={() => blockUser(friend.id)}>Block</button>
                                        }

                                        <button onClick={() => reportUser(friend.id, friend.name)}>
                                            Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
=======

            <div className="p-6 max-w-4xl mx-auto">

                <h2 className="text-xl font-bold mb-4">
                    Friends ({friendCount})
                </h2>

                {friends.length === 0 ? (
                    <p>No friends yet.</p>
                ) : (
                    friends.map((f) => (
                        <div key={f.connection_request_id} className="border p-4 mb-3 rounded">

                            <p className="font-semibold">{f.name}</p>
                            <p className="text-sm text-gray-600">{f.email}</p>

                            {f.is_blocked && (
                                <p className="text-red-500 text-sm mt-1">Blocked</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">

                                <button
                                    onClick={() => removeFriend(f.connection_request_id)}
                                    className="rounded bg-gray-600 px-3 py-1 text-white text-sm hover:bg-gray-700"
                                >
                                    Remove
                                </button>

                                {f.is_blocked ? (
                                    <button
                                        onClick={() => unblockUser(f.id)}
                                        className="rounded bg-gray-700 px-3 py-1 text-white text-sm hover:bg-gray-800"
                                    >
                                        Unblock
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => blockUser(f.id)}
                                        className="rounded bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700"
                                    >
                                        Block
                                    </button>
                                )}

                                <button
                                    onClick={() => reportUser(f.id, f.name)}
                                    className="rounded bg-rose-500 px-3 py-1 text-white text-sm hover:bg-rose-600"
                                >
                                    Report
                                </button>

                            </div>

                        </div>
                    ))
                )}

                <Link
                    href={route('dashboard')}
                    className="inline-block mt-4 text-blue-600 hover:underline"
                >
                    ← Back to Dashboard
                </Link>

>>>>>>> 07f61644a858a7f1a889cbb5a36912052411236a
            </div>
        </AuthenticatedLayout>
    );
}