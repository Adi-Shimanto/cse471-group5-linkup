import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Register() {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing } = useForm({
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

        // STEP 4
        bio: '',
        ideal_person: '',
        dislike_type: '',
    });

    // ✅ FIXED: Removed history blocking bug
    // Only warn user if leaving mid-registration (safe behavior)
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
            return (
                data.name &&
                data.email &&
                data.password &&
                data.password_confirmation &&
                data.password === data.password_confirmation
            );
        }

        if (step === 2) {
            return data.personality && data.purpose.length > 0;
        }

        if (step === 3) {
            return data.group_type.length > 0 && data.group_size;
        }

        return true;
    };

    const nextStep = () => {
        if (!validateStep()) {
            alert('Please complete required fields before continuing.');
            return;
        }
        setStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onSuccess: () => {
                window.location.href = '/dashboard';
            },
        });
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

                <Head title="Register" />

                {/* STEP INDICATOR */}
                <div className="flex justify-between mb-6 text-sm font-bold">
                    <span className={step === 1 ? 'text-indigo-600' : ''}>Account</span>
                    <span className={step === 2 ? 'text-indigo-600' : ''}>Personality</span>
                    <span className={step === 3 ? 'text-indigo-600' : ''}>Group</span>
                    <span className={step === 4 ? 'text-indigo-600' : ''}>AI Profile</span>
                </div>

                <form onSubmit={submit}>

                    {/* ================= STEP 1 ================= */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Create Account</h2>

                            <input
                                className="w-full mb-3 border p-2 rounded"
                                placeholder="Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />

                            <input
                                className="w-full mb-3 border p-2 rounded"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <input
                                type="password"
                                className="w-full mb-3 border p-2 rounded"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <input
                                type="password"
                                className="w-full mb-3 border p-2 rounded"
                                placeholder="Confirm Password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="w-full bg-indigo-600 text-white py-2 rounded"
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

                            <select
                                className="w-full border p-2 rounded mb-3"
                                value={data.personality}
                                onChange={(e) => setData('personality', e.target.value)}
                            >
                                <option value="">Select Personality</option>
                                <option value="introvert">Introvert</option>
                                <option value="extrovert">Extrovert</option>
                                <option value="ambivert">Ambivert</option>
                            </select>

                            <p className="font-semibold mb-2">Purpose (Select multiple)</p>
                            {[
                                'Study improvement',
                                'Career growth',
                                'Skill learning',
                                'Emotional support',
                                'Networking',
                                'Casual friendship',
                                'Romantic connection ❤️',
                            ].map((item) => (
                                <label key={item} className="block text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.purpose.includes(item)}
                                        onChange={() => toggleArrayValue('purpose', item)}
                                    />{' '}
                                    {item}
                                </label>
                            ))}

                            <select
                                className="w-full border p-2 rounded mt-3"
                                value={data.communication_style}
                                onChange={(e) =>
                                    setData('communication_style', e.target.value)
                                }
                            >
                                <option value="">Communication Style</option>
                                <option value="frequent">Frequent</option>
                                <option value="moderate">Moderate</option>
                                <option value="low">Low</option>
                                <option value="text">Text Only</option>
                                <option value="voice">Voice Preferred</option>
                            </select>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="w-1/2 bg-indigo-600 text-white py-2 rounded"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 3 ================= */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Group Preferences</h2>

                            <p className="font-semibold mb-2">Group Type</p>
                            {[
                                'Study group',
                                'Coding group',
                                'Gaming group',
                                'Hobby group',
                                'Fitness group',
                            ].map((item) => (
                                <label key={item} className="block text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.group_type.includes(item)}
                                        onChange={() => toggleArrayValue('group_type', item)}
                                    />{' '}
                                    {item}
                                </label>
                            ))}

                            <select
                                className="w-full border p-2 rounded mt-3"
                                value={data.group_size}
                                onChange={(e) =>
                                    setData('group_size', e.target.value)
                                }
                            >
                                <option value="">Group Size</option>
                                <option value="small">Small (1–5)</option>
                                <option value="medium">Medium (6–10)</option>
                                <option value="large">Large (10+)</option>
                            </select>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="w-1/2 bg-indigo-600 text-white py-2 rounded"
                                    onClick={nextStep}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 4 ================= */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">AI Profile</h2>

                            <textarea
                                className="w-full border p-2 rounded mb-3"
                                placeholder="Describe yourself..."
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                            />

                            <input
                                className="w-full border p-2 rounded mb-3"
                                placeholder="Ideal person"
                                value={data.ideal_person}
                                onChange={(e) =>
                                    setData('ideal_person', e.target.value)
                                }
                            />

                            <input
                                className="w-full border p-2 rounded mb-3"
                                placeholder="Dislike type"
                                value={data.dislike_type}
                                onChange={(e) =>
                                    setData('dislike_type', e.target.value)
                                }
                            />

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-400 text-white py-2 rounded"
                                    onClick={prevStep}
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/2 bg-green-600 text-white py-2 rounded"
                                >
                                    Finish Registration
                                </button>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}