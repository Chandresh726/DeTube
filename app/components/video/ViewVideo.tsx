import React from 'react';
import Reaction from '../button/Reaction';
import SubscribeButton from '../button/SubscribeButton';
import VideoInfo from './VideoInfo';
import CommentSection from './comment/CommentSection';
import ChannelInfo from './ChannelInfo';
import { useTheme } from '../wrapper/ThemeContext';

const ViewVideo = ({ videoData }) => {
    const { theme } = useTheme();
    return (
        <div className={`container mx-auto px-1 lg:px-16 ${theme==='dark'?'':'text-black'}`}>
            <div className="flex flex-col lg:flex-row">
                <div className="flex-grow lg:w-3/4">
                    <div className="relative aspect-video rounded-md overflow-hidden">
                        <video
                            controls
                            src={videoData.videoUrl}
                            poster={videoData.thumbnailUrl}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <VideoInfo data={videoData} />
                </div>
                <div className="lg:w-1/4 lg:pl-8 mt-4 lg:mt-0">
                    <ChannelInfo channel={videoData.channel}/>
                    <SubscribeButton channelId={videoData.channel.id} />
                    <Reaction stats={videoData.stats} videoId={videoData.id}/>
                </div>
            </div>
            <div className="divider my-4"></div>
            <CommentSection videoId={videoData.id} />
        </div>
    );
};

export default ViewVideo;