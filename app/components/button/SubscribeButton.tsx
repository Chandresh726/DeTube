"use client";
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addSubscription, checkIfSubscribed } from '../../util/fetch/subscription';

const SubscribeButton = ({ channelId }) => {
    const { data: session } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSubscription = async () => {
            if (session) {
                const data = await checkIfSubscribed(session.user.id, channelId);
                setIsSubscribed(data);
            }
        };
        checkSubscription();
    }, [session, channelId]);

    const handleSubscribe = async () => {
        if (!session) {
            router.push('/logIn');
            return;
        }

        const newStatus = !isSubscribed;
        setIsSubscribed(newStatus);

        // Update the subscription status on the backend
        const res = await addSubscription(session.user.id, channelId, isSubscribed ? 'unsub' : 'sub');
        if (res.ok) {
            setIsSubscribed(!newStatus);
        }
    };

    return (
        <div className={`flex flex-col mt-4 items-center w-full rounded-3xl ${isSubscribed ? 'bg-slate-600' : ' bg-red-500 text-gray-800'}`}>
            <button
                onClick={handleSubscribe}
                className={`py-2 rounded-lg font-semibold transition-colors duration-300 hover:opacity-75`}
            >
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
        </div>
    );
};

export default SubscribeButton;