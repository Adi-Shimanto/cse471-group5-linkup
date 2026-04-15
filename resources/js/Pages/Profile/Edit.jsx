import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Edit({ auth }) {
    const [activeTab, setActiveTab] = useState('posts');
    const user = auth?.user;

    // ================= POSTS =================
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const createPost = async () => {
        if (!newPost.trim()) return;

        try {
            const res = await axios.post('/posts', {
                content: newPost,
            });

            setPosts([res.data, ...posts]);
            setNewPost('');
        } catch (error) {
            console.log(error);
        }
    };

    // ================= MODAL =================
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        personality: user?.personality || '',
        purpose: user?.purpose ? JSON.parse(user.purpose) : [],
        communication_style: user?.communication_style || '',
        group_type: user?.group_type ? JSON.parse(user.group_type) : [],
        ideal_person: user?.ideal_person || '',
        dislike_type: user?.dislike_type || '',

        // password
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const toggleArray = (field, value) => {
        let arr = [...form[field]];

        if (arr.includes(value)) {
            arr = arr.filter(i => i !== value);
        } else {
            arr.push(value);
        }

        setForm({ ...form, [field]: arr });
    };

    const handleUpdate = async () => {
        try {
            await axios.patch('/profile', form);
            alert('Profile updated!');
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            console.log(err);
            alert('Update failed');
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title="Profile" />

            <div className="bg-gray-100 min-h-screen">

                {/* COVER */}
                <div className="relative h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

                    <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                        <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 overflow-hidden shadow-lg">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="mb-2 text-white">
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white text-gray-700 px-4 py-1 rounded-lg shadow"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="h-16"></div>

                {/* TABS */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 border-b pb-2 text-sm font-semibold">
                        <button onClick={() => setActiveTab('posts')}>Posts</button>
                        <button onClick={() => setActiveTab('about')}>About</button>
                        <button onClick={() => setActiveTab('settings')}>Settings</button>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-6">

                        {/* LEFT */}
                        <div className="col-span-1 space-y-4">
                            <div className="bg-white p-4 rounded-xl shadow">
                                <h2 className="font-bold mb-2">Intro</h2>
                                <p className="text-sm text-gray-600">
                                    🌍 Welcome to your LinkUp profile
                                </p>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="col-span-2">

                            {/* POSTS */}
                            {activeTab === 'posts' && (
                                <div className="space-y-4">

                                    <div className="bg-white p-4 rounded-xl shadow">
                                        <textarea
                                            className="w-full border p-2 rounded"
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="What's on your mind?"
                                        />
                                        <button
                                            onClick={createPost}
                                            className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded"
                                        >
                                            Post
                                        </button>
                                    </div>

                                    {posts.map((post) => (
                                        <div key={post.id} className="bg-white p-4 rounded-xl shadow">
                                            <h3 className="font-bold">{post.user?.name}</h3>
                                            <p>{post.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ABOUT */}
                            {activeTab === 'about' && (
                                <div className="bg-white p-6 rounded-xl shadow">
                                    <p><b>Bio:</b> {user?.bio}</p>
                                    <p><b>Personality:</b> {user?.personality}</p>
                                    <p><b>Purpose:</b> {user?.purpose}</p>
                                </div>
                            )}

                            {/* SETTINGS */}
                            {activeTab === 'settings' && (
                                <div className="bg-white p-6 rounded-xl shadow">
                                    <p>Settings coming...</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* ================= EDIT MODAL ================= */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                        <div className="bg-white w-full max-w-2xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">

                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

                            {/* NAME */}
                            <label className="font-semibold">Name</label>
                            <input className="w-full border p-2 mb-3"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />

                            {/* BIO */}
                            <label className="font-semibold">Bio</label>
                            <textarea className="w-full border p-2 mb-3"
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            />

                            {/* PERSONALITY */}
                            <label className="font-semibold">Personality</label>
                            <select className="w-full border p-2 mb-3"
                                value={form.personality}
                                onChange={(e) => setForm({ ...form, personality: e.target.value })}
                            >
                                <option value="">Select</option>
                                <option value="introvert">Introvert</option>
                                <option value="extrovert">Extrovert</option>
                                <option value="ambivert">Ambivert</option>
                            </select>

                            {/* PURPOSE */}
                            <label className="font-semibold">Purpose</label>
                            {[
                                'Study improvement',
                                'Career growth',
                                'Skill learning',
                                'Emotional support',
                                'Networking',
                                'Casual friendship',
                                'Romantic connection ❤️',
                            ].map(item => (
                                <label key={item} className="block text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.purpose.includes(item)}
                                        onChange={() => toggleArray('purpose', item)}
                                    /> {item}
                                </label>
                            ))}

                            {/* PASSWORD */}
                            <h3 className="font-bold mt-4">Change Password</h3>

                            <input type="password" className="w-full border p-2 mb-2"
                                placeholder="Current Password"
                                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                            />

                            <input type="password" className="w-full border p-2 mb-2"
                                placeholder="New Password"
                                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                            />

                            <input type="password" className="w-full border p-2 mb-4"
                                placeholder="Confirm Password"
                                onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
                            />

                            <div className="flex gap-2">
                                <button onClick={() => setShowModal(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded">
                                    Cancel
                                </button>

                                <button onClick={handleUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded">
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}