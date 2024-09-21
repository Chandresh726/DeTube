import React from 'react'
import { useTheme } from '../wrapper/ThemeContext';

const StatementLoading = () => {
    const { theme } = useTheme();
    return (
        <div className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            <div className='text-center text-3xl my-2 font-bold'>Your Transactions</div>

            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" defaultChecked />
                <div className="collapse-title text-xl font-medium">Deposit Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                </div>
            </div>

            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">Withdraw Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                </div>
            </div>

            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">Thanks Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                    <div className='skeleton w-full h-8 my-2'></div>
                </div>
            </div>
        </div>
    )
}

export default StatementLoading