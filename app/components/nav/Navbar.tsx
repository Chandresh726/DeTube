import type { Session } from 'next-auth';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavbarRight from './NavbarRight';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface NavbarProps {
  session: Session | null;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ session, onToggleSidebar, sidebarOpen }) => {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-2 md:px-4">
      <div className="flex items-center gap-1">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen ?? false}
        >
          <Menu />
        </Button>
        <Button asChild variant="ghost" className="px-2 text-base md:px-4 md:text-xl">
          <Link href="/" className="flex items-center gap-2" aria-label="DeTube home">
            <Image src="/logo.png" width={26} height={26} alt="DeTube home" priority />
            DeTube
          </Link>
        </Button>
      </div>
      <NavbarRight session={session} />
    </header>
  );
};

export default Navbar;
