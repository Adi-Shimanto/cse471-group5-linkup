import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Register() {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        // STEP 1
        name: '',
        email: '',
        password: '',
        password_confirmation: '',

        // STEP 2
        personality: '',
        purpose: [],
        communication_style: '',

        // STEP 3
        group_type: [],
        group_size: '',

        // STEP 4 - Fixed: Added missing fields
        bio: '',
        ideal_person: '',
        dislike_type: '',
        favorite_player: '',      // Added missing field
        favorite_match_of_all_time: '',  // Added missing field
        favorite_venue: '',       // Added missing field
    });

    // ✅ FIXED: Removed history blocking bug
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (step > 1) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [step]);

    // MULTI SELECT HANDLER
    const toggleArrayValue = (field, value) => {
        const exists = data[field].includes(value);

        if (exists) {
            setData(field, data[field].filter((v) => v !== value));
        } else {
            setData(field, [...data[field], value]);
        }
    };

    // VALIDATION PER STEP
    const validateStep = () => {
        if (step === 1) {
            if (!data.name || !data.email || !data.password || !data.password_confirmation) {
                alert('Please fill in all fields.');
                return false;
            }
            if (data.password !== data.password_confirmation) {
                alert('Passwords do not match.');
                return false;
            }
            if (data.password.length < 8) {
                alert('Password must be at least 8 characters.');
                return false;
            }
            return true;
        }

        if (step === 2) {
            if (!data.personality) {
                alert('Please select your personality type.');
                return false;
            }
            if (data.purpose.length === 0) {
                alert('Please select at least one purpose.');
                return false;
            }
            return true;
        }

        if (step === 3) {
            if (data.group_type.length === 0) {
                alert('Please select at least one group type.');
                return false;
            }
            if (!data.group_size) {
                alert('Please select your preferred group size.');
                return false;
            }
            return true;
        }

        return true;
    };

    const nextStep = () => {
        if (!validateStep()) {
            return;
        }
        setStep((prev) => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    // ✅ FIXED: Proper Inertia form submission
    const submit = (e) => {
        e.preventDefault();
        
        // Final validation before submitting
        if (!validateStep()) {
            return;
        }

        post(route('register'), {
            onSuccess: () => {
                // Inertia handles redirect automatically
                // No manual window.location needed!
                console.log('Registration successful!');
            },
            onError: (errors) => {
                console.error('Registration errors:', errors);
                // Stay on current step if there are validation errors
                if (errors.email || errors.name || errors.password) {
                    setStep(1);
                }
            },
            onFinish: () => {
                console.log('Registration request completed');
            },
        });
    };

    // Helper to show field errors
    const showError = (field) => {
        if (errors[field]) {
            return <p className="text-red-500 text-xs mt-1">{errors[field]}</p>;
        }
        return null;
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL2dldHR5aW1hZ2VzLTU0MTM4NTg1Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOiIxMjAwIn19fQ==')",
            }}
        >
            <div className="w-full max-w-xl bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl">
                <Head title="Register - LinkUp" />

                {/* STEP INDICATOR */}
                <div className="flex justify-between mb-6 text-sm font-bold">
                    <span className={step === 1 ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-gray-500'}>
                        Account
                    </span>
                    <span className={step === 2 ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-gray-500'}>
                        Personality
                    </span>
                    <span className={step === 3 ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-gray-500'}>
                        Group
                    </span>
                    <span className={step === 4 ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-gray-500'}>
                        Sports & Profile
                    </span>
                </div>

                <form onSubmit={submit}>
                    {/* ================= STEP 1 ================= */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Create Account</h2>

                            <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Full Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {showError('name')}
                            </div>

                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Email Address"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {showError('email')}
                            </div>

                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Password (min. 8 characters)"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {showError('password')}
                            </div>

                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                                onClick={nextStep}
                            >
                                Next → Personality
                            </button>
                        </div>
                    )}

                    {/* ================= STEP 2 ================= */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Personality & Purpose</h2>

                            <div className="mb-3">
                                <select
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={data.personality}
                                    onChange={(e) => setData('personality', e.target.value)}
                                >
                                    <option value="">Select Personality Type</option>
                                    <option value="introvert">Introvert</option>
                                    <option value="extrovert">Extrovert</option>
                                    <option value="ambivert">Ambivert</option>
                                </select>
                                {showError('personality')}
                            </div>

                            <p className="font-semibold mb-2">Purpose (Select all that apply)</p>
                            <div className="mb-3 space-y-1">
                                {[
                                    'Study improvement',
                                    'Career growth',
                                    'Skill learning',
                                    'Emotional support',
                                    'Networking',
                                    'Casual friendship',
                                    'Romantic connection ❤️',
                                ].map((item) => (
                                    <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.purpose.includes(item)}
                                            onChange={() => toggleArrayValue('purpose', item)}
                                            className="cursor-pointer"
                                        />
                                        <span>{item}</span>
                                    </label>
                                ))}
                                {showError('purpose')}
                            </div>

                            <div className="mb-3">
                                <select
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={data.communication_style}
                                    onChange={(e) => setData('communication_style', e.target.value)}
                                >
                                    <option value="">Communication Style (Optional)</option>
                                    <option value="frequent">Frequent</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="low">Low</option>
                                    <option value="text">Text Only</option>
                                    <option value="voice">Voice Preferred</option>
                                </select>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                                    onClick={prevStep}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className="w-1/2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                                    onClick={nextStep}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 3 ================= */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Group Preferences</h2>

                            <p className="font-semibold mb-2">Group Type (Select all that apply)</p>
                            <div className="mb-3 space-y-1">
                                {[
                                    'Study group',
                                    'Coding group',
                                    'Gaming group',
                                    'Hobby group',
                                    'Fitness group',
                                ].map((item) => (
                                    <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.group_type.includes(item)}
                                            onChange={() => toggleArrayValue('group_type', item)}
                                            className="cursor-pointer"
                                        />
                                        <span>{item}</span>
                                    </label>
                                ))}
                                {showError('group_type')}
                            </div>

                            <div className="mb-3">
                                <select
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={data.group_size}
                                    onChange={(e) => setData('group_size', e.target.value)}
                                >
                                    <option value="">Preferred Group Size</option>
                                    <option value="small">Small (1–5 people)</option>
                                    <option value="medium">Medium (6–10 people)</option>
                                    <option value="large">Large (10+ people)</option>
                                </select>
                                {showError('group_size')}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                                    onClick={prevStep}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className="w-1/2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                                    onClick={nextStep}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 4 ================= */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Sports & Profile</h2>

                            <div className="mb-3">
                                <textarea
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Name of sports..."
                                    rows="3"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">This helps AI match you better</p>
                            </div>

                            <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Favorite Team"
                                    value={data.ideal_person}
                                    onChange={(e) => setData('ideal_person', e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Favorite Player"
                                    value={data.favorite_player}
                                    onChange={(e) => setData('favorite_player', e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Favorite match of all time"
                                    value={data.favorite_match_of_all_time}
                                    onChange={(e) => setData('favorite_match_of_all_time', e.target.value)}
                                />
                            </div>
                            
                            <div className="mb-3">
                                <input
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Favorite Venue"
                                    value={data.favorite_venue}
                                    onChange={(e) => setData('favorite_venue', e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <textarea
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Tell us about yourself (bio)..."
                                    rows="3"
                                    value={data.dislike_type}
                                    onChange={(e) => setData('dislike_type', e.target.value)}
                                />
                            </div>

                            {errors.general && (
                                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                                    {errors.general}
                                </div>
                            )}

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                                    onClick={prevStep}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating Account...' : 'Finish Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}