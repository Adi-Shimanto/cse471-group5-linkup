import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function PaymentRedirect({ auth, payment, gatewayUrl, payload, demoMode = true }) {
    const formRef = useRef(null);

    useEffect(() => {
        if (!demoMode && formRef.current) {
            formRef.current.submit();
        }
    }, [demoMode]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Redirecting to Payment" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900">SSLCommerz Checkout</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Transaction <span className="font-semibold">{payment.transaction_id}</span> for <span className="font-semibold">{payment.plan?.name}</span>
                        </p>
                        <p className="mt-1 text-sm text-gray-600">Amount: ৳{Number(payment.amount).toFixed(2)}</p>

                        {demoMode ? (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                    Demo mode is enabled. Use the buttons below to simulate SSLCommerz success, failure, or cancellation.
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('payments.demo-success', payment.id)} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Simulate Success</Link>
                                    <Link href={route('payments.demo-fail', payment.id)} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">Simulate Fail</Link>
                                    <Link href={route('payments.demo-cancel', payment.id)} className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">Simulate Cancel</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <p className="text-sm text-gray-600">You are being redirected to SSLCommerz. If nothing happens, use the button below.</p>
                                <form ref={formRef} method="POST" action={gatewayUrl}>
                                    {Object.entries(payload).map(([key, value]) => (
                                        <input key={key} type="hidden" name={key} value={value} />
                                    ))}
                                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Continue to SSLCommerz</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
