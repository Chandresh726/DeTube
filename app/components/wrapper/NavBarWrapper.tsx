'use client';
import React, { useEffect, useState } from 'react';
import type { Session } from 'next-auth';
import Navbar from '../nav/Navbar';
import SideBar from '../nav/SideBar';
import { usePathname } from 'next/navigation';
import { getSubscriptionsData } from '../../util/fetch/subscription';

interface NavBarWrapperProps {
  session: Session | null;
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const rawId = session?.user?.id;
    const numericId = typeof rawId === 'string' ? Number(rawId) : rawId;
    if (typeof numericId === 'number' && Number.isSafeInteger(numericId)) {
      fetchSubscriptions(numericId);
    } else {
      setSubscriptions([]);
    }
  }, [session]);

  const fetchSubscriptions = async (userId: number) => {
    try {
      const data = await getSubscriptionsData(userId);
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setSubscriptions([]);
    }
  };

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (pathname === '/logIn' || pathname === '/signUp') {
      setSidebarState('closed');
      return;
    }
    if (savedState === 'full' || savedState === 'icons' || savedState === 'closed') {
      setSidebarState(savedState);
    } else if (window.innerWidth >= 1024) {
      setSidebarState('full');
    } else {
      setSidebarState('closed');
    }
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((v) => !v);
      return;
    }
    setSidebarState((prevState) => {
      const newState = prevState === 'full' ? 'icons' : 'full';
      localStorage.setItem('sidebarState', newState);
      return newState;
    });
  };

  const isAuthPage = pathname === '/logIn' || pathname === '/signUp';
  const effectiveState = !isAuthPage && mobileOpen ? 'full' : sidebarState;

  return (
    <div>
      <Navbar
        session={session}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={effectiveState === 'full'}
      />
      <div className="flex pt-16">
        <SideBar session={session} sidebarState={effectiveState} subscriptions={subscriptions} />
        {!isAuthPage && mobileOpen ? (
          <button
            aria-label="Close sidebar"
            className="fixed inset-0 top-16 z-[5] bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <div
          className={`grow transition-[margin] duration-200 ease-in-out ${
            effectiveState === 'full' ? 'md:ml-64' : effectiveState === 'icons' ? 'md:ml-16' : 'ml-0'
          }`}
        >
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default NavBarWrapper;
