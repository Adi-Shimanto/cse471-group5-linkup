import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Messages({ auth, friends = [], messages = [], selectedUserId = null }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);

    const selectedFriend = friends.find(f => f.id === selectedUserId);

    const selectFriend = (friendId) => {
        router.get(route('messages.index'), { user: friendId }, {
            preserveState: true,
        });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!content.trim() && !file) return;

        const formData = new FormData();
        formData.append('receiver_id', selectedUserId);
        if (content) formData.append('content', content);
        if (file) formData.append('file', file);

        router.post(route('messages.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setContent('');
                setFile(null);
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Messages" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="flex h-[600px] bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="w-1/3 border-r overflow-y-auto">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold text-gray-800">Messages</h3>
                            </div>
                            {friends.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500">
                                    No friends yet. Connect with people first!
                                </p>
                            ) : (
                                friends.map(friend => (
                                    <button
                                        key={friend.id}
                                        onClick={() => selectFriend(friend.id)}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b ${selectedUserId === friend.id ? 'bg-indigo-50' : ''}`}
                                    >
                                        <p className="font-medium text-gray-800">{friend.name}</p>
                                        <p className="text-xs text-gray-500">{friend.email}</p>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            {!selectedUserId ? (
                                <div className="flex flex-1 items-center justify-center text-gray-400">
                                    Select a friend to start chatting
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1">
                                    <div className="p-4 border-b">
                                        <p className="font-semibold">{selectedFriend?.name}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.length === 0 && (
                                            <p className="text-center text-sm text-gray-400">
                                                No messages yet. Say hello!
                                            </p>
                                        )}
                                        {messages.map(message => (
                                            <div key={message.id} className={`flex ${message.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs rounded-lg px-4 py-2 ${message.sender_id === auth.user.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}