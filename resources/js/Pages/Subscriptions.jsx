import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Subscriptions({ auth, plans = [], activeSubscription = null, payments = [], sslcommerzDemoMode = true }) {
    const startCheckout = (planId) => {
        router.post(route('payments.checkout', planId));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Plans & Payments" />
            <div className="py-12">
                <div className="mx-auto max-w-6xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900">Premium Subscription & Payment</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Upgrade with SSLCommerz to unlock unlimited deep matchmaking, priority in feeds, and an ad-free experience.
                        </p>
                        {sslcommerzDemoMode && (
                            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                Demo mode is enabled. Checkout opens a simulated SSLCommerz flow so you can test the feature without live credentials.
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">Current Access</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {activeSubscription
                                ? `${activeSubscription.plan?.name} is active until ${activeSubscription.ends_at ? new Date(activeSubscription.ends_at).toLocaleDateString() : 'N/A'}.`
                                : 'You are currently using the Free plan.'}
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className="rounded-lg bg-white p-6 shadow-sm sm:rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-2 text-3xl font-bold text-indigo-700">{Number(plan.price) === 0 ? 'Free' : `৳${Number(plan.price).toFixed(0)}`}</p>
                                <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">{plan.billing_cycle}</p>
                                <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
                                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                                    {(plan.features ?? []).map((feature) => (
                                        <li key={feature}>• {feature}</li>
                                    ))}
                                </ul>
                                {Number(plan.price) > 0 ? (
                                    <button onClick={() => startCheckout(plan.id)} className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                        Pay with SSLCommerz
                                    </button>
                                ) : (
                                    <button disabled className="mt-6 cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                                        Default Plan
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                        {payments.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">No payments yet.</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="text-left text-sm font-semibold text-gray-700">
                                            <th className="px-3 py-2">Transaction</th>
                                            <th className="px-3 py-2">Plan</th>
                                            <th className="px-3 py-2">Amount</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                                        {payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="px-3 py-2">{payment.transaction_id}</td>
                                                <td className="px-3 py-2">{payment.plan?.name}</td>
                                                <td className="px-3 py-2">৳{Number(payment.amount).toFixed(2)}</td>
                                                <td className="px-3 py-2"><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{payment.status}</span></td>
                                                <td className="px-3 py-2">{new Date(payment.created_at).toLocaleString()}</td>
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
