import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function GroupChat({ auth, group, messages = [], friends = [] }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState('');

    const isAdmin = group.members?.some(
        m => m.user_id === auth.user.id && m.role === 'admin'
    );

    const memberIds = group.members?.map(m => m.user_id) || [];
    const nonMembers = friends.filter(f => !memberIds.includes(f.id));

    const sendMessage = (e) => {
        e.preventDefault();
        if (!content.trim() && !file) return;

        const formData = new FormData();
        if (content) formData.append('content', content);
        if (file) formData.append('file', file);

        router.post(route('groups.messages.store', group.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setContent('');
                setFile(null);
            },
        });
    };

    const addMember = (e) => {
        e.preventDefault();
        if (!selectedFriend) return;

        router.post(route('groups.addMember', group.id), {
            user_id: selectedFriend,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedFriend('');
                setShowAddMember(false);
            },
        });
    };

    const removeMember = (userId) => {
        router.delete(route('groups.removeMember', { id: group.id, userId: userId }), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={group.name} />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="flex h-[600px] bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="w-1/4 border-r overflow-y-auto">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold text-gray-800">{group.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Members</p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowAddMember(!showAddMember)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>

                                {showAddMember && (
                                    <form onSubmit={addMember} className="mb-3 space-y-2">
                                        <select
                                            value={selectedFriend}
                                            onChange={e => setSelectedFriend(e.target.value)}
                                            className="w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Select a friend</option>
                                            {nonMembers.map(friend => (
                                                <option key={friend.id} value={friend.id}>
                                                    {friend.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                                        >
                                            Add Member
                                        </button>
                                    </form>
                                )}

                                {group.members?.map(member => (
                                    <div key={member.id} className="flex items-center justify-between py-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {member.user?.name?.charAt(0)}
                                            </div>
                                            <p className="text-sm text-gray-700">{member.user?.name}</p>
                                            {member.role === 'admin' && (
                                                <span className="text-xs text-indigo-600 font-semibold">Admin</span>
                                            )}
                                        </div>
                                        {isAdmin && member.user_id !== auth.user.id && (
                                            <button
                                                onClick={() => removeMember(member.user_id)}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="p-4 border-b flex items-center justify-between">
                                <p className="font-semibold">{group.name} Chat</p>
                                <button
                                    onClick={() => router.get(route('groups.index'))}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Back to Groups
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 && (
                                    <p className="text-center text-sm text-gray-400">
                                        No messages yet. Start the conversation!
                                    </p>
                                )}
                                {messages.map(message => (
                                    <div key={message.id} className={`flex ${message.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-xs">
                                            {message.sender_id !== auth.user.id && (
                                                <p className="text-xs text-gray-500 mb-1">{message.sender?.name}</p>
                                            )}
                                            <div className={`rounded-lg px-4 py-2 ${message.sender_id === auth.user.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                                {message.content && (
                                                    <p className="text-sm">{message.content}</p>
                                                )}
                                                {message.file_path && (
                                                    <a href={`/storage/${message.file_path}`} target="_blank" className="text-xs underline">
                                                        {message.file_name}
                                                    </a>
                                                )}
                                                <p className="text-xs mt-1 opacity-70">
                                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendMessage} className="p-4 border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                                        Attach
                                        <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                    </label>
                                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                                        Send
                                    </button>
                                </div>
                                {file && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {file.name}
                                        <button type="button" onClick={() => setFile(null)} className="ml-2 text-red-500">
                                            Remove
                                        </button>
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}