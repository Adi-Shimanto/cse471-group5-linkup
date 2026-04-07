import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{
                backgroundImage:
                    "url('https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL2dldHR5aW1hZ2VzLTU0MTM4NTg1Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOiIxMjAwIn19fQ==')"
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg text-white">

                <Head title="Log in" />

                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-6">
                    Login to LinkUp
                </h1>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-400 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-white" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full bg-white/20 text-white placeholder-gray-200 border-none"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Password */}
                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" className="text-white" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full bg-white/20 text-white placeholder-gray-200 border-none"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Remember me */}
                    <div className="mt-4 flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-white">
                            Remember me
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between">

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-blue-300 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}

                        <PrimaryButton
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                        >
                            Log in
                        </PrimaryButton>
                    </div>

                    {/* Register link */}
                    <p className="text-center mt-6 text-sm text-white">
                        Don’t have an account?{' '}
                        <Link href="/register" className="text-blue-300 hover:underline">
                            Register
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    );
}