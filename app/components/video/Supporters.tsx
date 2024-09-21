import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import React from 'react'
import { useTheme } from '../wrapper/ThemeContext';

const Supporters = ({ supporters }) => {
    const { theme } = useTheme();
    return (
        <div className={`w-full border-4 rounded-md ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <div className={`${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} px-2`}>Top Supporters</div>
            <table className="table">
                <tbody>
                    {supporters.map((user, index) => (
                        <tr key={user.id}>
                            <td className='font-bold px-1'>{index + 1}</td>
                            <td>
                                <div className='flex items-center'>
                                    <img src={user.image || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt={user.name} className="w-6 h-6 mr-2 rounded-full" />
                                    {(user.name).split(" ")[0]}
                                </div>
                            </td>
                            <td className='text-sm font-bold px-1'>{(Number(user.amount) / LAMPORTS_PER_SOL).toFixed(1)} YTSol</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {supporters.length < 5 &&
                <div className='text-sm font-thin text-center my-2'>
                    Support the channel to appear here
                </div>
            }
        </div>
    )
}

export default Supporters