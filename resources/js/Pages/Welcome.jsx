import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="LinkUp" />

            <div
                className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL2dldHR5aW1hZ2VzLTU0MTM4NTg1Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOiIxMjAwIn19fQ==')"
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Content */}
                <div className="relative z-10 text-center text-white px-4">

                    {/* Title */}
                    <h1 className="text-5xl font-bold mb-4">
                        LinkUp
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg mb-8">
                        Connect with people. Build your network. Grow together.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-center">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}