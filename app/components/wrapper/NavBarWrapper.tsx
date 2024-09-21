"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../nav/Navbar';
import SideBar from '../nav/SideBar';
import { usePathname } from 'next/navigation';
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
    const [sidebarState, setSidebarState] = useState<'full' | 'icons' | 'closed'>('full');
    const pathname = usePathname();

    // Load the sidebar state from localStorage on mount
    // useEffect(() => {
    //     const savedState = localStorage.getItem('sidebarState');
    //     if (savedState) {
    //         setSidebarState(savedState as 'full' | 'icons' | 'closed');
    //     }
    // }, []);

    const handleResize = () => {
        if (window.innerWidth >= 1024) { // Tailwind's 'lg' breakpoint
            setSidebarState('full');
        } else {
            setSidebarState('closed');
        }
    };

    useEffect(() => {
        if (session?.user.id) {
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
        const savedState = localStorage.getItem('sidebarState');
        if (savedState) {
            setSidebarState(savedState as 'full' | 'icons' | 'closed');
        } else {
            handleResize();
        }
        if (pathname === '/logIn' || pathname === '/signUp') {
            setSidebarState('closed');
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [pathname]);

    const handleToggleSidebar = () => {
        setSidebarState(prevState => {
            const newState = window.innerWidth >= 1024
                ? (prevState === 'full' ? 'icons' : 'full')
                : (prevState === 'closed' ? 'full' : 'closed');
            
            // Save the new sidebar state to localStorage
            localStorage.setItem('sidebarState', newState);
            
            return newState;
        });
    };

    return (
        <div>
            <Navbar session={session} onToggleSidebar={handleToggleSidebar} />
            <div className="flex pt-16">
                <SideBar session={session} sidebarState={sidebarState} subscriptions={subscriptions} />
                <div className={`flex-grow transition-margin duration-200 ease-in-out ${
                    sidebarState === 'full' ? 'md:ml-64' : 
                    sidebarState === 'icons' ? 'md:ml-16' : 'ml-0 lg:px-20'
                }`}>
                    <main className="p-4">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default NavBarWrapper;