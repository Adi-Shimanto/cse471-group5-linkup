import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Reports({ auth, blockedUsers = [], reports = [] }) {
    const [groupName, setGroupName] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');

    const submitGroupReport = (e) => {
        e.preventDefault();
        router.post(route('reports.store'), {
            reported_group_name: groupName,
            reason,
            description,
        });
    };

    const unblockUser = (userId) => {
        router.delete(route('blocks.destroy', userId), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Safety Center" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900">Safety Center</h2>
                        <p className="mt-2 text-sm text-gray-600">Manage blocked users and submit moderation reports for users or groups.</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900">Blocked Users</h3>
                            {blockedUsers.length === 0 ? (
                                <p className="mt-3 text-sm text-gray-600">You have not blocked anyone yet.</p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {blockedUsers.map((blockedUser) => (
                                        <div key={blockedUser.id} className="rounded-lg border border-gray-200 p-4">
                                            <p className="font-medium text-gray-900">{blockedUser.name}</p>
                                            <p className="text-sm text-gray-600">{blockedUser.email}</p>
                                            <button onClick={() => unblockUser(blockedUser.blocked_user_id)} className="mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800">Unblock</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900">Report a Group</h3>
                            <form onSubmit={submitGroupReport} className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Group name</label>
                                    <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" placeholder="Example: LinkUp Hikers" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                                    <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" placeholder="Harassment, spam, inappropriate content..." required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" rows="4" placeholder="Add context for the admin team..." />
                                </div>
                                <button type="submit" className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Submit Group Report</button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">My Reports</h3>
                        {reports.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">You have not submitted any reports yet.</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="text-left text-sm font-semibold text-gray-700">
                                            <th className="px-3 py-2">Target</th>
                                            <th className="px-3 py-2">Reason</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                                        {reports.map((report) => (
                                            <tr key={report.id}>
                                                <td className="px-3 py-2">{report.target}</td>
                                                <td className="px-3 py-2">{report.reason}</td>
                                                <td className="px-3 py-2"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{report.status}</span></td>
                                                <td className="px-3 py-2">{report.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
