import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../chat/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import UserInfo from '../chat/UserInfo';

const ChatLayout = ({
    currentUser,
    users,
    selectedUser,
    messages,
    currentMessage,
    loading,
    onSelectUser,
    onGoBack,
    onMessageChange,
    onSendMessage,
    onLogout,
    // AI props
    smartReplies,
    smartRepliesLoading,
    onUseSmartReply,
    onRequestSmartReplies,
    onSummarize,
    chatSummary,
    summaryLoading,
    showSummary,
    onCloseSummary,
    // Status props
    statuses,
    currentUserId,
    onUploadStatus,
    onViewStatus,
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chatWindowProps = {
        selectedUser,
        messages,
        currentMessage,
        onMessageChange,
        onSendMessage,
        loading,
        smartReplies,
        smartRepliesLoading,
        onUseSmartReply,
        onRequestSmartReplies,
        onSummarize,
        chatSummary,
        summaryLoading,
        showSummary,
        onCloseSummary,
    };

    return (
        <div className="h-screen w-full p-0 md:p-4 lg:p-6 lg:max-w-[1600px] lg:mx-auto gap-4 flex overflow-hidden bg-[var(--bg-app)] relative">

            {isMobile ? (
                <AnimatePresence mode="wait" initial={false}>
                    {!selectedUser ? (
                        <motion.div
                            key="sidebar"
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="w-full h-full flex"
                        >
                            <Sidebar
                                currentUser={currentUser}
                                users={users}
                                selectedUser={selectedUser}
                                onSelectUser={onSelectUser}
                                onLogout={onLogout}
                                statuses={statuses}
                                currentUserId={currentUserId}
                                onUploadStatus={onUploadStatus}
                                onViewStatus={onViewStatus}
                                className="w-full h-full"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="w-full h-full flex flex-col"
                        >
                            <ChatWindow
                                {...chatWindowProps}
                                className="w-full h-full"
                            />
                            <button
                                onClick={onGoBack}
                                className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full z-50 md:hidden"
                            >
                                ←
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            ) : (
                <>
                    <Sidebar
                        currentUser={currentUser}
                        users={users}
                        selectedUser={selectedUser}
                        onSelectUser={onSelectUser}
                        onLogout={onLogout}
                        statuses={statuses}
                        currentUserId={currentUserId}
                        onUploadStatus={onUploadStatus}
                        onViewStatus={onViewStatus}
                        className="w-80 flex-none z-10"
                    />

                    <ChatWindow
                        {...chatWindowProps}
                        className="flex-1 min-w-0"
                    />

                    <UserInfo
                        selectedUser={selectedUser}
                        className="hidden xl:flex w-80 flex-none"
                    />
                </>
            )}

        </div>
    );
};

export default ChatLayout;
