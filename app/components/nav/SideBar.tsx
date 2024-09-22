import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { GoHome, GoHistory } from "react-icons/go";
import { MdOutlineSubscriptions } from "react-icons/md";
import { GrChannel, GrUpload } from "react-icons/gr";
import { TbMoneybag, TbWallet } from "react-icons/tb";
import { BiLike } from "react-icons/bi";
import { useTheme } from '../wrapper/ThemeContext';
import VirtualWallet from '../web3/VirtualWallet';

interface SidebarProps {
    session: any;
    sidebarState: 'full' | 'icons' | 'closed';
    subscriptions: any;
}

const SideBar: React.FC<SidebarProps> = ({ session, sidebarState, subscriptions }) => {
    const { theme } = useTheme();
    const [disableTransition, setDisableTransition] = useState(false);

    useEffect(() => {
        setDisableTransition(true);
        const timeoutId = setTimeout(() => {
            setDisableTransition(false);
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [theme]);

    const sidebarWidth = sidebarState === 'full' ? 'w-64' : sidebarState === 'icons' ? 'w-16' : 'w-0';

    return (
        <div
            className={`${disableTransition ? 'transition-none' : 'transition-all duration-200 ease-in-out'} 
            ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} 
            fixed left-0 top-16 z-10 h-[calc(100vh-4rem)] 
            ${sidebarWidth} overflow-hidden flex flex-col`}
        >
            <div
                className={`transition-opacity duration-200 ease-in-out flex-grow custom-scrollbar
                ${theme === 'dark' ? 'dark-scrollbar' : 'light-scrollbar'}
                ${sidebarState !== 'closed' ? 'opacity-100 delay-200' : 'opacity-0'}`}
            >
                <ul className={`menu text-lg ${sidebarState === 'icons' ? 'p-1' : ''}`}>
                    <SidebarItem icon={<GoHome className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Home" link="/" sidebarState={sidebarState} />
                    {session && (
                        <>
                            <SidebarItem icon={<MdOutlineSubscriptions className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Subscription" link="/subscription" sidebarState={sidebarState} />
                            <div className="divider my-1"></div>
                            <SidebarItem icon={<GoHistory className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Your Transactions" link="/statement" sidebarState={sidebarState} />
                            <SidebarItem icon={<BiLike className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Liked Videos" link="/liked" sidebarState={sidebarState} />
                        </>
                    )}
                    {session?.user.channelId && (
                        <>
                            <SidebarItem icon={<GrChannel className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Your Channel" link={`/channel/${session.user.channelId}`} sidebarState={sidebarState} />
                            <SidebarItem icon={<TbMoneybag className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Your Earnings" link="/earnings" sidebarState={sidebarState} />
                            <SidebarItem icon={<GrUpload className={`${sidebarState === 'icons' ? 'w-8 h-8' : 'w-6 h-6'}`} />} text="Upload Video" link="/uploadVideo" sidebarState={sidebarState} />
                        </>
                    )}
                    {session && subscriptions.length > 0 && (
                        <div>
                            <div className="divider my-1"></div>
                            {sidebarState === 'full' && <div className='text-xl text-center'>Subscriptions</div>}
                            <ul className="menu mt-2 p-0 text-lg">
                                {subscriptions.map(sub => (
                                    <SidebarChannel key={sub.id} id={sub.id} image={sub.image} name={sub.name} sidebarState={sidebarState} />
                                ))}
                            </ul>
                        </div>
                    )}
                </ul>
            </div>
            {session && (
                <div className="flex-none mt-auto">
                    {sidebarState === 'full' ? (
                        <VirtualWallet />
                    ) : (
                        <Link href="/statement" className={`btn btn-ghost m-1 flex items-center justify-center p-2`}>
                            <TbWallet className="w-8 h-8" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

const SidebarItem = ({ icon, text, link, sidebarState }) => (
    <li>
        <Link href={link} className={`flex items-center ${sidebarState === 'icons' ? 'justify-center p-2' : ''}`}>
            {icon}
            {sidebarState === 'full' && <span className="ml-2">{text}</span>}
        </Link>
    </li>
);

const SidebarChannel = ({ id, image, name, sidebarState }) => (
    <li key={id}>
        <Link
            href={`/channel/${id}`}
            className={`flex items-center ${sidebarState === 'icons' ? 'justify-center p-2' : ''} relative group`}
        >
            <img src={image} alt={name} className={`w-8 h-8 rounded-full`} />
            {sidebarState === 'full' && <span className="ml-2">{toCamelCase(name)}</span>}
        </Link>
    </li>
);

const toCamelCase = (str: String) => {
    return str
        .toLowerCase() // Convert the entire string to lowercase
        .split(/[^a-zA-Z0-9]+/) // Split the string by non-alphanumeric characters
        .map((word, index) =>
            word.charAt(0).toUpperCase() + word.slice(1) // Capitalize the first letter of words
        )
        .join(' '); // Join the words back into a single string
}

export default SideBar;