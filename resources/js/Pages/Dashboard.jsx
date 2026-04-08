import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, users = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (e) => {
        e.preventDefault();

        router.get(
            route('dashboard'),
            { search: search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            route('dashboard'),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const hasSearch = (filters.search ?? '').trim() !== '';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-4 text-lg font-semibold">
                                Search Profiles
                            </h3>

                            <form
                                onSubmit={submitSearch}
                                className="mb-6 flex flex-col gap-3 sm:flex-row"
                            >
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or email"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                            </form>

                            {!hasSearch && (
                                <p className="text-sm text-gray-600">
                                    Type a name or email to search for other users.
                                </p>
                            )}

                            {hasSearch && users.length === 0 && (
                                <p className="text-sm text-red-600">
                                    No profiles found.
                                </p>
                            )}

                            {users.length > 0 && (
                                <div className="space-y-3">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >
                                            <p className="text-lg font-medium text-gray-900">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user.email}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}