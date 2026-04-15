import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({
    auth,
    users = [],
    posts = [],
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    // ================= SEARCH USERS =================
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
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-6">

                    {/* ================= SEARCH SECTION ================= */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

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
                                        <p className="text-lg font-medium">
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

                    {/* ================= NEWSFEED SECTION ================= */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        <h3 className="text-lg font-bold mb-4">
                            📰 Newsfeed
                        </h3>

                        {posts.length === 0 ? (
                            <p className="text-gray-500">
                                No posts yet. Be the first to post!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="border rounded-lg p-4"
                                    >
                                        <p className="font-semibold">
                                            {post.user?.name}
                                        </p>

                                        <p className="text-gray-700 mt-2">
                                            {post.content}
                                        </p>
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