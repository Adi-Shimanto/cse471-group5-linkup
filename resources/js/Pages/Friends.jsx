import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Friends({
    auth,
    friends = [],
    friendCount = 0,
}) {
    const removeFriend = (connectionRequestId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) {
            return;
        }

        router.delete(route('friends.remove', connectionRequestId), {
            preserveScroll: true,
        });
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
                                <p className="mt-1 text-sm text-gray-600">
                                    Total friends: <span className="font-semibold">{friendCount}</span>
                                </p>
                            </div>

                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        {friends.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                You do not have any friends added yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.connection_request_id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-lg font-medium">{friend.name}</p>
                                            <p className="text-sm text-gray-600">{friend.email}</p>
                                        </div>

                                        <button
                                            onClick={() => removeFriend(friend.connection_request_id)}
                                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                        >
                                            Remove Friend
                                        </button>
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
