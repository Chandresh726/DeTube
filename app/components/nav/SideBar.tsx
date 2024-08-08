import Link from 'next/link';
import React from 'react';
import { GoHome, GoHistory } from "react-icons/go";
import { MdOutlineSubscriptions } from "react-icons/md";
import { GrChannel, GrUpload } from "react-icons/gr";
import { BiLike } from "react-icons/bi";

interface SidebarProps {
    session: any;
    isOpen: boolean;
    subscriptions: any;
}

const SideBar: React.FC<SidebarProps> = ({ session, isOpen, subscriptions }) => {

    return (
        <div className={`bg-gray-900 text-white fixed left-0 top-16 z-10 h-[calc(100vh-4rem)] transition-width duration-200 ease-in-out ${isOpen ? 'w-full md:w-64' : 'w-0'} overflow-hidden`}>
            <div className="px-1">
                <ul className="menu">
                    <li>
                        <div className='text-lg'>
                            <GoHome className='w-6 h-6 mr-2' />
                            <Link href="/">Home</Link>
                        </div>
                    </li>
                    {session &&
                        <li>
                            <div className='text-lg'>
                                <MdOutlineSubscriptions className='w-6 h-6 mr-2' />
                                <Link href="/subscription">Subscription</Link>
                            </div>
                        </li>
                    }
                    <div className="divider my-1"></div>
                    {session?.user.channelId &&
                        <li>
                            <div className='text-lg'>
                                <GrChannel className='w-6 h-6 mr-2' />
                                <Link href={"/channel/" + session.user.channelId}>Your Channel</Link>
                            </div>
                        </li>
                    }
                    {session?.user.channelId &&
                        <li>
                            <div className='text-lg md:hidden'>
                                <GrUpload className='w-6 h-6 mr-2' />
                                <Link href={"/uploadVideo"}>Upload Video</Link>
                            </div>
                        </li>
                    }
                    <li>
                        <div className='text-lg'>
                            <GoHistory className='w-6 h-6 mr-2' />
                            <Link href="/history">History</Link>
                        </div>
                    </li>
                    {session &&
                        <li>
                            <div className='text-lg'>
                                <BiLike className='w-6 h-6 mr-2' />
                                <Link href="/liked">Liked Videos</Link>
                            </div>
                        </li>
                    }
                    {session && subscriptions.length > 0 &&
                        <div>
                            <div className="divider my-1"></div>
                            <div className='text-xl text-center'>Subscriptions</div>
                            <ul className="menu mt-2">
                                {subscriptions.map(sub => (
                                    <li key={sub.id} className="">
                                        <div className='text-lg'>
                                            <img src={sub.image} alt={sub.name} className="w-10 h-10 mr-2 rounded-full" />
                                            <Link href={`/channel/${sub.id}`}>{sub.name}</Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                </ul>
            </div>
        </div>
    );
};

export default SideBar;