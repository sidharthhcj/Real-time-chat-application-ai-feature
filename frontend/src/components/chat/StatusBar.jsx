import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBar = ({ statuses, currentUserId, onUploadStatus, onViewStatus }) => {
    const fileInputRef = React.useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadStatus(file);
            e.target.value = ''; // reset so same file can be re-selected
        }
    };

    const myStatus = statuses.find(s => s.user._id === currentUserId);
    const otherStatuses = statuses.filter(s => s.user._id !== currentUserId);

    return (
        <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
                {/* My Status — always first */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                    onClick={() => {
                        if (myStatus && myStatus.statuses.length > 0) {
                            onViewStatus(myStatus);
                        } else {
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg
                            ${myStatus && myStatus.statuses.length > 0
                                ? 'bg-gradient-to-tr from-purple-500 to-blue-500 ring-2 ring-green-400 ring-offset-2 ring-offset-[var(--bg-app)]'
                                : 'bg-gradient-to-tr from-gray-600 to-gray-500'
                            }`}
                        >
                            {myStatus && myStatus.statuses.length > 0 ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}${myStatus.statuses[0].imageUrl}`}
                                    alt="My status"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                '+'
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] rounded-full flex items-center justify-center border-2 border-[var(--bg-app)]">
                            <Plus size={10} className="text-white" />
                        </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] truncate w-14 text-center">My Status</span>
                </motion.div>

                {/* Other users' statuses */}
                {otherStatuses.map((group, idx) => (
                    <motion.div
                        key={group.user._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                        onClick={() => onViewStatus(group)}
                    >
                        <div className="w-14 h-14 rounded-full ring-2 ring-[var(--color-primary-start)] ring-offset-2 ring-offset-[var(--bg-app)] overflow-hidden">
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${group.statuses[0].imageUrl}`}
                                alt={`${group.user.username}'s status`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] truncate w-14 text-center">
                            {group.user.username}
                        </span>
                    </motion.div>
                ))}

                {/* Always show add button if user has existing status */}
                {myStatus && myStatus.statuses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
                            <Plus size={20} className="text-[var(--text-muted)]" />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">Add</span>
                    </motion.div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default StatusBar;
