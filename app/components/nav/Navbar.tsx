import React from 'react'
import NavbarRight from './NavbarRight'
import { FaYoutube } from "react-icons/fa6"
import { useTheme } from '../wrapper/ThemeContext';

interface NavbarProps {
    session: any;
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ session, onToggleSidebar }) => {
    const { theme } = useTheme();

    return (
        <div className={`fixed top-0 left-0 right-0 z-10 navbar h-16 border-b-2 ${theme === 'dark' ? 'bg-gray-900 border-slate-600' : 'bg-gray-100 border-gray-400 text-black'}`}>
            <div className="navbar-start">
                <button onClick={onToggleSidebar} className="px-2 md:px-4 btn btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </button>
                <a className="px-2 md:px-4 btn btn-ghost text-md md:text-xl" href='/'><FaYoutube className='w-6 h-6 md:w-10 md:h-10' />YouTube 3.0</a>
            </div>
            <NavbarRight session={session} />
        </div>
    )
}

export default Navbar