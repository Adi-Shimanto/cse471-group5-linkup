import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Reports({ auth, blockedUsers }) {

    const unblockUser = (userId) => {
        router.delete(route('blocks.destroy', userId), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Blocked Users</h2>}
        >
            <Head title="Blocked Users" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">

                        <h3 className="text-lg font-semibold mb-4">Blocked Users</h3>

                        {blockedUsers.length === 0 ? (
                            <p className="text-gray-500">No blocked users.</p>
                        ) : (
                            blockedUsers.map((blockedUser) => (
                                <div
                                    key={blockedUser.id}
                                    className="mb-4 rounded-lg border p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold">{blockedUser.name}</p>
                                        <p className="text-sm text-gray-600">{blockedUser.email}</p>
                                    </div>

                                    <button
                                        onClick={() => unblockUser(blockedUser.id)}
                                        className="rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}