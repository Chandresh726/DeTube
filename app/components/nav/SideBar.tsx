import Link from 'next/link';
import React from 'react';
import { GoHome, GoHistory } from 'react-icons/go';
import { MdOutlineSubscriptions } from 'react-icons/md';
import { GrChannel, GrUpload } from 'react-icons/gr';
import { TbWallet } from 'react-icons/tb';
import { BiLike } from 'react-icons/bi';
import VirtualWallet from '../web3/VirtualWallet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  session: { user?: { channelId?: number | null } } | null;
  sidebarState: 'full' | 'icons' | 'closed';
  subscriptions: Array<{ id: number; image?: string | null; name: string }>;
}

const SideBar: React.FC<SidebarProps> = ({ session, sidebarState, subscriptions }) => {
  const sidebarWidth = sidebarState === 'full' ? 'w-64' : sidebarState === 'icons' ? 'w-16' : 'w-0';

  return (
    <div
      className={cn(
        'fixed left-0 top-16 z-10 flex h-[calc(100vh-4rem)] flex-col overflow-hidden border-r bg-background transition-all duration-200 ease-in-out',
        sidebarWidth,
      )}
    >
      <div
        className={cn(
          'custom-scrollbar grow transition-opacity duration-200 ease-in-out',
          sidebarState !== 'closed' ? 'opacity-100 delay-200' : 'opacity-0',
        )}
      >
        <nav
          className={cn('flex flex-col gap-1 p-2 text-base', sidebarState === 'icons' && 'items-center')}
          aria-label="Primary"
        >
          <SidebarItem
            icon={<GoHome aria-hidden className={sidebarState === 'icons' ? 'size-5' : 'size-6'} />}
            text="Home"
            link="/"
            sidebarState={sidebarState}
          />
          {session && (
            <>
              <SidebarItem
                icon={
                  <MdOutlineSubscriptions
                    aria-hidden
                    className={sidebarState === 'icons' ? 'size-5' : 'size-6'}
                  />
                }
                text="Subscription"
                link="/subscription"
                sidebarState={sidebarState}
              />
              <Separator className="my-1" />
              <SidebarItem
                icon={<GoHistory aria-hidden className={sidebarState === 'icons' ? 'size-5' : 'size-6'} />}
                text="Your Transactions"
                link="/statement"
                sidebarState={sidebarState}
              />
              <SidebarItem
                icon={<BiLike aria-hidden className={sidebarState === 'icons' ? 'size-5' : 'size-6'} />}
                text="Liked Videos"
                link="/liked"
                sidebarState={sidebarState}
              />
            </>
          )}
          {session?.user?.channelId && (
            <>
              <SidebarItem
                icon={<GrChannel aria-hidden className={sidebarState === 'icons' ? 'size-5' : 'size-6'} />}
                text="Your Channel"
                link={`/channel/${session.user.channelId}`}
                sidebarState={sidebarState}
              />
              <SidebarItem
                icon={<GrUpload aria-hidden className={sidebarState === 'icons' ? 'size-5' : 'size-6'} />}
                text="Upload Video"
                link="/uploadVideo"
                sidebarState={sidebarState}
              />
            </>
          )}
          {session && subscriptions.length > 0 && (
            <div className="w-full">
              <Separator className="my-1" />
              {sidebarState === 'full' && (
                <div className="px-3 pt-1 text-sm font-medium text-muted-foreground">Subscriptions</div>
              )}
              <div className="mt-2 flex flex-col gap-1">
                {subscriptions.map((sub) => (
                  <SidebarChannel
                    key={sub.id}
                    id={sub.id}
                    image={sub.image}
                    name={sub.name}
                    sidebarState={sidebarState}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      {session && (
        <div className="mt-auto flex-none">
          {sidebarState === 'full' ? (
            <VirtualWallet />
          ) : sidebarState === 'icons' ? (
            <Button
              asChild
              variant="ghost"
              className="m-1 flex items-center justify-center p-2"
              aria-label="Transactions"
            >
              <Link href="/statement">
                <TbWallet className="size-5" aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({
  icon,
  text,
  link,
  sidebarState,
}: {
  icon: React.ReactNode;
  text: string;
  link: string;
  sidebarState: string;
}) => (
  <Button
    asChild
    variant="ghost"
    className={cn('w-full justify-start', sidebarState === 'icons' && 'justify-center px-2')}
  >
    <Link href={link} className="flex items-center" aria-label={text} title={text}>
      {icon}
      {sidebarState === 'full' && <span className="ml-2 truncate">{text}</span>}
    </Link>
  </Button>
);

const SidebarChannel = ({
  id,
  image,
  name,
  sidebarState,
}: {
  id: number;
  image?: string | null;
  name: string;
  sidebarState: string;
}) => (
  <Button
    asChild
    variant="ghost"
    className={cn('w-full justify-start', sidebarState === 'icons' && 'justify-center px-2')}
    title={name}
  >
    <Link href={`/channel/${id}`} className="relative flex items-center">
      <Avatar className="size-8">
        <AvatarImage src={image ?? undefined} alt={name} />
        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      {sidebarState === 'full' && <span className="ml-2 truncate">{name}</span>}
    </Link>
  </Button>
);

export default SideBar;
