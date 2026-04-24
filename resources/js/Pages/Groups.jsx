import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Groups({ auth, groups = [] }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);

    const createGroup = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        router.post(route('groups.store'), { name, description }, {
            preserveScroll: true,
            onSuccess: () => {
                setName('');
                setDescription('');
                setShowForm(false);
            },
        });
    };

    const joinGroup = (id) => {
        router.post(route('groups.join', id), {}, {
            preserveScroll: true,
        });
    };

    const leaveGroup = (id) => {
        router.post(route('groups.leave', id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Groups" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Groups</h2>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                            >
                                + Create Group
                            </button>
                        </div>
                        {showForm && (
                            <form onSubmit={createGroup} className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Group name"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Group description (optional)"
                                    rows={2}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="mb-4 font-semibold text-gray-800">All Groups</h3>
                        {groups.length === 0 ? (
                            <p className="text-sm text-gray-500">No groups yet. Create one!</p>
                        ) : (
                            <div className="space-y-4">
                                {groups.map(group => (
                                    <div key={group.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold text-gray-800">{group.name}</p>
                                            {group.description && (
                                                <p className="text-sm text-gray-500">{group.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {group.members_count} member{group.members_count !== 1 ? 's' : ''} · Created by {group.creator?.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {group.is_member ? (
                                                <>
                                                    <button
                                                        onClick={() => router.get(route('groups.chat', group.id))}
                                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                                                    >
                                                        Chat
                                                    </button>
                                                    <button
                                                        onClick={() => leaveGroup(group.id)}
                                                        className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200"
                                                    >
                                                        Leave
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => joinGroup(group.id)}
                                                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                                >
                                                    Join
                                                </button>
                                            )}
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