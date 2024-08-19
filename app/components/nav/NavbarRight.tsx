import React from 'react'
import { MdUpload } from "react-icons/md";
import LogIn from '../button/LogInBtn';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import ThemeToggle from '../button/ThemeBtn';

const NavbarRight = ({ session }: { session: any }) => {
    if (session) {
        return (
            <div className="navbar-end">
                <div className='hidden md:block'>
                    <button className="btn btn-ghost text-red-500"><Link href="/uploadVideo"><MdUpload className='w-7 h-7' /></Link></button>
                </div>
                <div className='mx-1'>
                    <ThemeToggle />
                </div>
                <div className='mr-2'>{session.user?.name?.split(" ")[0]}</div>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="profile pic"
                                src={session.user?.image || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
                            />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-40 p-2 shadow">
                        <li><button onClick={() => signOut()}>Sign Out</button></li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="navbar-end">
            <div className='mx-1'>
                <ThemeToggle />
            </div>
            <LogIn />
        </div>
    );
}

export default NavbarRight