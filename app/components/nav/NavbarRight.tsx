import React from 'react';
import { MdUpload } from 'react-icons/md';
import LogIn from '../button/LogInBtn';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import ThemeToggle from '../button/ThemeBtn';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_AVATAR } from '@/lib/constants';

const NavbarRight = ({
  session,
}: {
  session: { user?: { name?: string | null; image?: string | null; channelId?: number | null } } | null;
}) => {
  if (session) {
    const channelId = session.user?.channelId;
    return (
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="hidden text-destructive md:inline-flex"
          aria-label="Upload video"
        >
          <Link href="/uploadVideo">
            <MdUpload className="size-7" aria-hidden />
          </Link>
        </Button>
        <ThemeToggle />
        <div className="mr-2 text-sm md:text-base">{session.user?.name?.split(' ')[0]}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
              <Avatar className="size-10">
                <AvatarImage
                  alt={`${session.user?.name ?? 'User'} avatar`}
                  src={session.user?.image || DEFAULT_AVATAR}
                />
                <AvatarFallback>{(session.user?.name ?? 'U').slice(0, 1)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              {channelId ? (
                <DropdownMenuItem asChild>
                  <Link href={`/channel/${channelId}`}>Your Channel</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/createChannel">Create Channel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LogIn />
      <Button asChild variant="outline" className="hidden sm:inline-flex">
        <Link href="/signUp">Sign Up</Link>
      </Button>
    </div>
  );
};

export default NavbarRight;
