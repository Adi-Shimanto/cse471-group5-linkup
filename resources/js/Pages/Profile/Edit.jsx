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

    // ================= INITIALIZE FORM =================
    const [form, setForm] = useState({
        // Basic Info
        name: '',
        bio: '',
        location: '',
        
        // Quiz Fields (from registration)
        personality: '',
        purpose: [],
        communication_style: '',
        group_type: [],
        group_size: '',
        ideal_person: '',
        ideal_person_description: '',
        dislike_type: '',
        
        // Sports Preference Fields (NEW)
        favorite_sport: '',
        favorite_team: '',
        favorite_player: '',
        favorite_match: '',
        favorite_venue: '',
        
        // Additional Profile Fields
        interests: [],  // Tags for interests/hobbies
        privacy_show_email: true,
        privacy_show_location: true,
        
        // Photo
        profile_photo: null,
        profile_photo_preview: null,
        
        // Password
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Available options for selects and checkboxes
    const personalityOptions = [
        { value: 'introvert', label: 'Introvert' },
        { value: 'extrovert', label: 'Extrovert' },
        { value: 'ambivert', label: 'Ambivert' }
    ];

    const purposeOptions = [
        'Study improvement',
        'Career growth',
        'Skill learning',
        'Emotional support',
        'Networking',
        'Casual friendship',
        'Romantic connection ❤️'
    ];

    const communicationStyleOptions = [
        { value: 'frequent', label: 'Frequent (daily)' },
        { value: 'moderate', label: 'Moderate (few times a week)' },
        { value: 'low', label: 'Low (occasionally)' },
        { value: 'text', label: 'Text Only' },
        { value: 'voice', label: 'Voice Preferred' }
    ];

    const groupTypeOptions = [
        'Study group',
        'Coding group',
        'Gaming group',
        'Hobby group',
        'Fitness group'
    ];

    const groupSizeOptions = [
        { value: 'small', label: 'Small (1–5 people)' },
        { value: 'medium', label: 'Medium (6–10 people)' },
        { value: 'large', label: 'Large (10+ people)' }
    ];

    const interestOptions = [
        'Reading', 'Gaming', 'Sports', 'Music', 'Movies',
        'Travel', 'Cooking', 'Art', 'Photography', 'Dancing',
        'Yoga', 'Meditation', 'Technology', 'Science', 'Writing'
    ];

    const sportOptions = [
        'Cricket', 'Football', 'Basketball', 'Tennis', 'Baseball',
        'Hockey', 'Volleyball', 'Rugby', 'Golf', 'Swimming',
        'Boxing', 'MMA', 'Badminton', 'Table Tennis', 'Athletics'
    ];

    // ================= LOAD USER DATA INTO FORM =================
    useEffect(() => {
        if (user) {
            setForm({
                name: user?.name || '',
                bio: user?.bio || '',
                location: user?.location || '',
                personality: user?.personality || '',
                purpose: user?.purpose ? (typeof user.purpose === 'string' ? JSON.parse(user.purpose) : user.purpose) : [],
                communication_style: user?.communication_style || '',
                group_type: user?.group_type ? (typeof user.group_type === 'string' ? JSON.parse(user.group_type) : user.group_type) : [],
                group_size: user?.group_size || '',
                ideal_person: user?.ideal_person || '',
                ideal_person_description: user?.ideal_person_description || '',
                dislike_type: user?.dislike_type || '',
                favorite_sport: user?.favorite_sport || '',
                favorite_team: user?.favorite_team || '',
                favorite_player: user?.favorite_player || '',
                favorite_match: user?.favorite_match || '',
                favorite_venue: user?.favorite_venue || '',
                interests: user?.interests ? (typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests) : [],
                privacy_show_email: user?.privacy_show_email !== false,
                privacy_show_location: user?.privacy_show_location !== false,
                profile_photo: null,
                profile_photo_preview: user?.profile_photo_url || null,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        }
    }, [user]);

    // ================= MODAL =================
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const toggleArray = (field, value) => {
        let arr = [...form[field]];

        if (arr.includes(value)) {
            arr = arr.filter(i => i !== value);
        } else {
            arr.push(value);
        }

        setForm({ ...form, [field]: arr });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({
                ...form,
                profile_photo: file,
                profile_photo_preview: URL.createObjectURL(file)
            });
        }
    };

    // ================= HANDLE UPDATE =================
    const handleUpdate = async () => {
        setSaving(true);
        setErrors({});
        
        try {
            const submitData = new FormData();
            
            // Basic fields
            submitData.append('name', form.name);
            submitData.append('bio', form.bio || '');
            submitData.append('location', form.location || '');
            submitData.append('personality', form.personality || '');
            submitData.append('communication_style', form.communication_style || '');
            submitData.append('group_size', form.group_size || '');
            submitData.append('ideal_person', form.ideal_person || '');
            submitData.append('ideal_person_description', form.ideal_person_description || '');
            submitData.append('dislike_type', form.dislike_type || '');
            
            // Sports Preference fields
            submitData.append('favorite_sport', form.favorite_sport || '');
            submitData.append('favorite_team', form.favorite_team || '');
            submitData.append('favorite_player', form.favorite_player || '');
            submitData.append('favorite_match', form.favorite_match  || '');
            submitData.append('favorite_venue', form.favorite_venue || '');
            
            // JSON fields
            submitData.append('purpose', JSON.stringify(form.purpose));
            submitData.append('group_type', JSON.stringify(form.group_type));
            submitData.append('interests', JSON.stringify(form.interests));
            
            // Privacy settings
            submitData.append('privacy_show_email', form.privacy_show_email ? '1' : '0');
            submitData.append('privacy_show_location', form.privacy_show_location ? '1' : '0');
            
            // Photo
            if (form.profile_photo) {
                submitData.append('profile_photo', form.profile_photo);
            }
            
            // Password fields
            if (form.current_password) {
                submitData.append('current_password', form.current_password);
                submitData.append('password', form.new_password);
                submitData.append('password_confirmation', form.new_password_confirmation);
            }
            
            // Method spoofing for PUT
            submitData.append('_method', 'PUT');

            const response = await axios.post('/profile', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                }
            });

            if (response.data.success) {
                alert('Profile updated successfully!');
                setShowModal(false);
                window.location.reload();
            } else {
                alert(response.data.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update error:', err);
            
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                const firstError = Object.values(err.response.data.errors)[0][0];
                alert(`Validation failed: ${firstError}`);
            } else if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert('Update failed. Please check the console for details.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title="Profile" />

            <div className="bg-gray-100 min-h-screen">

                {/* COVER */}
                <div className="relative h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

                    <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                        {/* Profile Photo */}
                        <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 overflow-hidden shadow-lg">
                            {form.profile_photo_preview ? (
                                <img
                                    src={form.profile_photo_preview}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            )}
                        </div>

                        <div className="mb-2 text-black">
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-sm">{user?.email}</p>
                            {user?.location && <p className="text-sm">📍 {user?.location}</p>}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white text-gray-700 px-4 py-1 rounded-lg shadow hover:bg-gray-100"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="h-16"></div>

                {/* TABS */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 border-b pb-2 text-sm font-semibold">
                        <button 
                            onClick={() => setActiveTab('posts')}
                            className={activeTab === 'posts' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' : 'text-gray-500'}
                        >
                            Posts
                        </button>
                        <button 
                            onClick={() => setActiveTab('about')}
                            className={activeTab === 'about' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' : 'text-gray-500'}
                        >
                            About
                        </button>
                        <button 
                            onClick={() => setActiveTab('quiz')}
                            className={activeTab === 'quiz' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' : 'text-gray-500'}
                        >
                            Quiz Answers
                        </button>
                        <button 
                            onClick={() => setActiveTab('sports')}
                            className={activeTab === 'sports' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' : 'text-gray-500'}
                        >
                            Sports Preference
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' : 'text-gray-500'}
                        >
                            Privacy & Settings
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-6">

                        {/* LEFT SIDEBAR */}
                        <div className="col-span-1 space-y-4">
                            <div className="bg-white p-4 rounded-xl shadow">
                                <h2 className="font-bold mb-2">Intro</h2>
                                <p className="text-sm text-gray-600">
                                    {user?.bio || 'No bio yet. Click Edit Profile to add one!'}
                                </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl shadow">
                                <h2 className="font-bold mb-2">Details</h2>
                                <p className="text-sm text-gray-600">🎭 Personality: {user?.personality || 'Not set'}</p>
                                <p className="text-sm text-gray-600">🎯 Purpose: {user?.purpose ? (typeof user.purpose === 'string' ? JSON.parse(user.purpose).join(', ') : user.purpose.join(', ')) : 'Not set'}</p>
                                <p className="text-sm text-gray-600">👥 Group: {user?.group_type ? (typeof user.group_type === 'string' ? JSON.parse(user.group_type).join(', ') : user.group_type.join(', ')) : 'Not set'}</p>
                                {user?.favorite_sport && (
                                    <p className="text-sm text-gray-600 mt-2">⚽ Favorite Sport: {user?.favorite_sport}</p>
                                )}
                            </div>
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="col-span-2">

                            {/* POSTS TAB */}
                            {activeTab === 'posts' && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl shadow">
                                        <textarea
                                            className="w-full border p-2 rounded"
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="What's on your mind?"
                                            rows="3"
                                        />
                                        <button
                                            onClick={createPost}
                                            className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                                        >
                                            Post
                                        </button>
                                    </div>

                                    {posts.length === 0 ? (
                                        <div className="bg-white p-4 rounded-xl shadow text-center text-gray-500">
                                            No posts yet. Create your first post!
                                        </div>
                                    ) : (
                                        posts.map((post) => (
                                            <div key={post.id} className="bg-white p-4 rounded-xl shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">
                                                        {post.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{post.user?.name || 'User'}</h3>
                                                        <p className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="mt-2">{post.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* ABOUT TAB */}
                            {activeTab === 'about' && (
                                <div className="bg-white p-6 rounded-xl shadow space-y-4">
                                    <h2 className="text-xl font-bold">About Me</h2>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Bio</h3>
                                        <p>{user?.bio || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Location</h3>
                                        <p>📍 {user?.location || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Interests</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {user?.interests ? (typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests).map(interest => (
                                                <span key={interest} className="bg-gray-200 px-2 py-1 rounded-full text-sm">{interest}</span>
                                            )) : 'Not provided'}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Ideal Person</h3>
                                        <p>{user?.ideal_person || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Dislikes</h3>
                                        <p>{user?.dislike_type || 'Not provided'}</p>
                                    </div>
                                </div>
                            )}

                            {/* QUIZ ANSWERS TAB */}
                            {activeTab === 'quiz' && (
                                <div className="bg-white p-6 rounded-xl shadow space-y-4">
                                    <h2 className="text-xl font-bold">Your Quiz Answers</h2>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Personality Type</h3>
                                        <p className="capitalize">{user?.personality || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Purpose</h3>
                                        <ul className="list-disc list-inside">
                                            {(user?.purpose ? (typeof user.purpose === 'string' ? JSON.parse(user.purpose) : user.purpose) : []).map(p => (
                                                <li key={p}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Communication Style</h3>
                                        <p>{user?.communication_style || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Preferred Group Type</h3>
                                        <ul className="list-disc list-inside">
                                            {(user?.group_type ? (typeof user.group_type === 'string' ? JSON.parse(user.group_type) : user.group_type) : []).map(g => (
                                                <li key={g}>{g}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Group Size Preference</h3>
                                        <p>{user?.group_size || 'Not provided'}</p>
                                    </div>
                                </div>
                            )}

                            {/* SPORTS PREFERENCE TAB (NEW) */}
                            {activeTab === 'sports' && (

                                <div className="bg-white p-6 rounded-xl shadow space-y-4">

                                    <h2 className="text-xl font-bold">Sports Preference</h2>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Favorite Sport</h3>
                                        <p>{user?.favorite_sport || 'Not provided'}</p>

                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Favorite Team</h3>
                                        <p>{user?.favorite_team || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Favorite Player</h3>
                                        <p>{user?.favorite_player || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Favorite Match of All Time</h3>
                                        <p>{user?.favorite_match || 'Not provided'}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Favorite Venue</h3>
                                        <p>{user?.favorite_venue || 'Not provided'}</p>
                                    </div>
                                </div>
                            )}

                            {/* PRIVACY & SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="bg-white p-6 rounded-xl shadow space-y-4">
                                    <h2 className="text-xl font-bold">Privacy Settings</h2>
                                    
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={form.privacy_show_email}
                                                onChange={(e) => setForm({ ...form, privacy_show_email: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <span>Show my email on profile</span>
                                        </label>
                                        
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={form.privacy_show_location}
                                                onChange={(e) => setForm({ ...form, privacy_show_location: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <span>Show my location on profile</span>
                                        </label>
                                    </div>
                                    
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-500">More privacy controls coming soon...</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* ================= EDIT MODAL (FULL VERSION) ================= */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                        <div className="bg-white w-full max-w-3xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">

                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

                            {/* Profile Photo Upload */}
                            <div className="mb-4">
                                <label className="font-semibold block mb-1">Profile Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                                        {form.profile_photo_preview ? (
                                            <img src={form.profile_photo_preview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                📷
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            {/* Basic Info */}
                            <label className="font-semibold block mb-1">Name</label>
                            <input 
                                className={`w-full border p-2 mb-3 rounded ${errors.name ? 'border-red-500' : ''}`}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-500 text-sm -mt-2 mb-2">{errors.name[0]}</p>}

                            <label className="font-semibold block mb-1">Bio</label>
                            <textarea 
                                className="w-full border p-2 mb-3 rounded"
                                rows="3"
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            />

                            <label className="font-semibold block mb-1">Location</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="City, Country"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />

                            {/* Tags/Interests */}
                            <label className="font-semibold block mb-1">Interests/Hobbies</label>
                            <div className="mb-3 p-3 border rounded max-h-40 overflow-y-auto">
                                <div className="grid grid-cols-3 gap-2">
                                    {interestOptions.map(interest => (
                                        <label key={interest} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={form.interests.includes(interest)}
                                                onChange={() => toggleArray('interests', interest)}
                                                className="cursor-pointer"
                                            />
                                            <span>{interest}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Personality */}
                            <label className="font-semibold block mb-1">Personality</label>
                            <select 
                                className="w-full border p-2 mb-3 rounded"
                                value={form.personality}
                                onChange={(e) => setForm({ ...form, personality: e.target.value })}
                            >
                                <option value="">Select Personality</option>
                                {personalityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Purpose */}
                            <label className="font-semibold block mb-2">Purpose</label>
                            <div className="mb-3 p-3 border rounded">
                                {purposeOptions.map(item => (
                                    <label key={item} className="flex items-center gap-2 text-sm mb-1">
                                        <input
                                            type="checkbox"
                                            checked={form.purpose.includes(item)}
                                            onChange={() => toggleArray('purpose', item)}
                                            className="cursor-pointer"
                                        />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Communication Style */}
                            <label className="font-semibold block mb-1">Communication Style</label>
                            <select 
                                className="w-full border p-2 mb-3 rounded"
                                value={form.communication_style}
                                onChange={(e) => setForm({ ...form, communication_style: e.target.value })}
                            >
                                <option value="">Select Communication Style</option>
                                {communicationStyleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Group Type */}
                            <label className="font-semibold block mb-2">Group Type</label>
                            <div className="mb-3 p-3 border rounded">
                                {groupTypeOptions.map(item => (
                                    <label key={item} className="flex items-center gap-2 text-sm mb-1">
                                        <input
                                            type="checkbox"
                                            checked={form.group_type.includes(item)}
                                            onChange={() => toggleArray('group_type', item)}
                                            className="cursor-pointer"
                                        />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Group Size */}
                            <label className="font-semibold block mb-1">Group Size Preference</label>
                            <select 
                                className="w-full border p-2 mb-3 rounded"
                                value={form.group_size}
                                onChange={(e) => setForm({ ...form, group_size: e.target.value })}
                            >
                                <option value="">Select Group Size</option>
                                {groupSizeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Ideal Person */}
                            <label className="font-semibold block mb-1">Ideal Person/Connection</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="Who are you looking to connect with?"
                                value={form.ideal_person}
                                onChange={(e) => setForm({ ...form, ideal_person: e.target.value })}
                            />

                            <label className="font-semibold block mb-1">Ideal Person Description</label>
                            <textarea 
                                className="w-full border p-2 mb-3 rounded"
                                rows="2"
                                placeholder="Describe your ideal connection in more detail..."
                                value={form.ideal_person_description}
                                onChange={(e) => setForm({ ...form, ideal_person_description: e.target.value })}
                            />

                            {/* Dislikes */}
                            <label className="font-semibold block mb-1">Things You Dislike</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="What do you want to avoid?"
                                value={form.dislike_type}
                                onChange={(e) => setForm({ ...form, dislike_type: e.target.value })}
                            />

                            {/* ================= SPORTS PREFERENCE SECTION (NEW) ================= */}
                            <h3 className="font-bold mt-4 mb-2">Sports Preference</h3>
                            
                            <label className="font-semibold block mb-1">Favorite Sport</label>
                            <select 
                                className="w-full border p-2 mb-3 rounded"
                                value={form.favorite_sport}
                                onChange={(e) => setForm({ ...form, favorite_sport: e.target.value })}
                            >
                                <option value="">Select Favorite Sport</option>
                                {sportOptions.map(sport => (
                                    <option key={sport} value={sport}>{sport}</option>
                                ))}
                            </select>

                            <label className="font-semibold block mb-1">Favorite Team</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="e.g., Barcelona, Lakers, Yankees"
                                value={form.favorite_team}
                                onChange={(e) => setForm({ ...form, favorite_team: e.target.value })}
                            />

                            <label className="font-semibold block mb-1">Favorite Player</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="e.g., Messi, LeBron James, Kohli"
                                value={form.favorite_player}
                                onChange={(e) => setForm({ ...form, favorite_player: e.target.value })}
                            />

                            <label className="font-semibold block mb-1">Favorite Match of All Time</label>
                            <textarea 
                                className="w-full border p-2 mb-3 rounded"
                                rows="2"
                                placeholder="Describe your favorite match/sporting event of all time..."
                                value={form.favorite_match}
                                onChange={(e) => setForm({ ...form, favorite_match: e.target.value })}
                            />

                            <label className="font-semibold block mb-1">Favorite Venue</label>
                            <input 
                                className="w-full border p-2 mb-3 rounded"
                                placeholder="e.g., Camp Nou, Wembley, MCG"
                                value={form.favorite_venue}
                                onChange={(e) => setForm({ ...form, favorite_venue: e.target.value })}
                            />

                            {/* Privacy Controls */}
                            <h3 className="font-bold mt-4 mb-2">Privacy Controls</h3>
                            <div className="mb-4 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.privacy_show_email}
                                        onChange={(e) => setForm({ ...form, privacy_show_email: e.target.checked })}
                                    />
                                    Show my email on profile
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.privacy_show_location}
                                        onChange={(e) => setForm({ ...form, privacy_show_location: e.target.checked })}
                                    />
                                    Show my location on profile
                                </label>
                            </div>

                            {/* Password Change */}
                            <h3 className="font-bold mt-4 mb-2">Change Password (Optional)</h3>

                            <input 
                                type="password" 
                                className={`w-full border p-2 mb-2 rounded ${errors.current_password ? 'border-red-500' : ''}`}
                                placeholder="Current Password"
                                value={form.current_password}
                                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                            />
                            {errors.current_password && <p className="text-red-500 text-sm -mt-1 mb-2">{errors.current_password[0]}</p>}

                            <input 
                                type="password" 
                                className={`w-full border p-2 mb-2 rounded ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="New Password"
                                value={form.new_password}
                                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                            />

                            <input 
                                type="password" 
                                className={`w-full border p-2 mb-4 rounded ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="Confirm New Password"
                                value={form.new_password_confirmation}
                                onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
                            />
                            {errors.password && <p className="text-red-500 text-sm -mt-3 mb-2">{errors.password[0]}</p>}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>

                                <button 
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}