import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children, user: passedUser, friendCount = 0 }) {
    const page = usePage();
    const pageUser = page.props.auth.user;
    const user = passedUser ?? pageUser;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const notifications = page.props.notifications ?? [];
    const unreadNotificationsCount = page.props.unreadNotificationsCount ?? 0;
    const flash = page.props.flash ?? {};
    const subscriptionSummary = page.props.subscriptionSummary ?? { is_premium: false, plan_name: 'Free' };

    const markNotificationRead = (id) => {
        router.post(route('notifications.read', id), {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post(route('notifications.read-all'), {}, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('friends.index')} active={route().current('friends.index')}>
                                    Friends
                                </NavLink>
                                <NavLink href={route('reports.index')} active={route().current('reports.index')}>
                                    Safety
                                </NavLink>
                                <NavLink href={route('subscriptions.index')} active={route().current('subscriptions.index')}>
                                    Plans
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-4">
                            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {subscriptionSummary.is_premium ? `${subscriptionSummary.plan_name}` : 'Free Plan'}
                            </div>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                Notifications
                                                {unreadNotificationsCount > 0 && (
                                                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                                        {unreadNotificationsCount}
                                                    </span>
                                                )}
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content contentClasses="w-96 bg-white">
                                        <div className="flex items-center justify-between border-b px-4 py-2">
                                            <p className="text-sm font-semibold text-gray-900">Recent Notifications</p>
                                            {notifications.length > 0 && (
                                                <button className="text-xs text-indigo-600 hover:text-indigo-800" onClick={markAllRead}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="px-4 py-3 text-sm text-gray-600">No notifications yet.</p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div key={notification.id} className="border-b px-4 py-3 last:border-b-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                                                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                                                                <p className="mt-1 text-xs text-gray-400">{notification.created_at}</p>
                                                            </div>
                                                            {!notification.read_at && (
                                                                <button
                                                                    onClick={() => markNotificationRead(notification.id)}
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                                >
                                                                    Mark read
                                                                </button>
                                                            )}
                                                        </div>
                                                        {notification.url && (
                                                            <Link href={notification.url} className="mt-2 inline-block text-xs text-indigo-600 hover:text-indigo-800">
                                                                Open
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="relative ms-1">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('friends.index')}>Friends ({friendCount})</Dropdown.Link>
                                        <Dropdown.Link href={route('reports.index')}>Safety Center</Dropdown.Link>
                                        <Dropdown.Link href={route('subscriptions.index')}>Subscription</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('friends.index')} active={route().current('friends.index')}>
                            Friends
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('reports.index')} active={route().current('reports.index')}>
                            Safety
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('subscriptions.index')} active={route().current('subscriptions.index')}>
                            Plans
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            <div className="mt-1 text-xs text-gray-500">Friends: {friendCount}</div>
                            <div className="mt-1 text-xs text-indigo-600">Plan: {subscriptionSummary.plan_name}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('friends.index')}>Friends</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('reports.index')}>Safety Center</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('subscriptions.index')}>Subscription</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="mx-auto mt-4 max-w-5xl space-y-3 px-4 sm:px-6 lg:px-8">
                {flash.success && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{flash.success}</div>}
                {flash.error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</div>}
            </div>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}