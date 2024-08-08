"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../nav/Navbar';
import SideBar from '../nav/SideBar';
import { usePathname } from 'next/navigation'
import { getSubscriptionsData } from '../../util/fetch/subscription';

interface NavBarWrapperProps {
    session: any;
    children: React.ReactNode;
}

interface Subscription {
    id: number;
    name: string;
    image: string;
}

const NavBarWrapper: React.FC<NavBarWrapperProps> = ({ session, children }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const getInitialSidebarState = () => {
        if (window.innerWidth >= 1024) {
            return true;
        }
        return false;
    };
    const [isSidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
    const pathname = usePathname();

    const handleResize = () => {
        if (window.innerWidth >= 1024) { // Tailwind's 'lg' breakpoint is 1024px
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        if (session?.user.id) {
            // Fetch the user's subscriptions
            fetchSubscriptions(session.user.id);
        }
    }, [session]);

    const fetchSubscriptions = async (userId: number) => {
        try {
            const data = await getSubscriptionsData(userId);
            setSubscriptions(data.subscriptions);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    useEffect(() => {
        handleResize(); // Set initial state based on current window size
        if (pathname === '/logIn' || pathname === '/signUp') {
            setSidebarOpen(false);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [pathname]);

    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            <Navbar session={session} onToggleSidebar={handleToggleSidebar} />
            <div className="flex pt-16">
                <SideBar session={session} isOpen={isSidebarOpen} subscriptions={subscriptions} />
                <div className={`flex-grow transition-margin duration-200 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0 lg:px-20'}`}>
                    <main className="p-4">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default NavBarWrapper;