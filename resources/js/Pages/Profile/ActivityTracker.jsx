import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ActivityTracker({ auth, activities, stats, actionTypes, filters }) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [actionType, setActionType] = useState(filters.action_type || 'all');
    const [search, setSearch] = useState(filters.search || '');
    
    const applyFilters = () => {
        router.get('/profile/activities', {
            action_type: actionType,
            date_from: dateFrom,
            date_to: dateTo,
            search: search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    const resetFilters = () => {
        setDateFrom('');
        setDateTo('');
        setActionType('all');
        setSearch('');
        router.get('/profile/activities', {}, { preserveState: true });
    };
    
    const getActivityText = (activity) => {
        switch(activity.action_type) {
            case 'post_reaction':
                return `Reacted to a post`;
            case 'comment':
                return `Commented: "${activity.description}"`;
            case 'friend_request_sent':
                return `Sent a friend request`;
            case 'friend_request_accepted':
                return `Accepted a friend request`;
            case 'friend_request_declined':
                return `Declined a friend request`;
            case 'profile_view':
                return `Viewed a profile`;
            case 'group_join':
                return `Joined a group`;
            case 'post_created':
                return `Created a new post`;
            case 'post_shared':
                return `Shared a post`;
            default:
                return activity.description || 'Performed an action';
        }
    };
    
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Activity Tracker" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
                            <div className="text-gray-600">Total Activities</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-3xl font-bold text-green-600">{stats.this_week}</div>
                            <div className="text-gray-600">Activities This Week</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-3xl font-bold text-purple-600">
                                {Object.keys(stats.by_type).length}
                            </div>
                            <div className="text-gray-600">Activity Types</div>
                        </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Filter Activities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Action Type
                                </label>
                                <select
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="all">All Activities</option>
                                    {actionTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.replace(/_/g, ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={applyFilters}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Favorite match of all time"
                                    value={data.favorite_match_of_all_time}
                                    onChange={(e) => setData('favorite_match_of_all_time', e.target.value)}
                                />
                            </div>
                    
                    {/* Activities List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Your Activity History</h3>
                        </div>
                        
                        <div className="divide-y">
                            {activities.data.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No activities found. Start interacting to see your activity history!
                                </div>
                            ) : (
                                activities.data.map((activity) => (
                                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">{activity.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-gray-800">
                                                            {getActivityText(activity)}
                                                        </p>
                                                        {activity.target_name && (
                                                            <p className="text-sm text-gray-500">
                                                                With: {activity.target_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </span>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {activities.data.length > 0 && (
                            <div className="p-4 border-t">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Showing {activities.from} to {activities.to} of {activities.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {activities.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}