import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const StatusViewer = ({ statusGroup, currentUserId, onClose, onDelete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const statuses = statusGroup?.statuses || [];
    const isMyStatus = statusGroup?.user?._id === currentUserId;

    const goNext = useCallback(() => {
        if (currentIndex < statuses.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, statuses.length, onClose]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    // Auto-advance timer (5 seconds per status)
    useEffect(() => {
        if (statuses.length === 0) return;

        const duration = 5000;
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);
            if (elapsed >= duration) {
                goNext();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, statuses.length, goNext]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goNext, goPrev]);

    if (!statusGroup || statuses.length === 0) return null;

    const current = statuses[currentIndex];

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center"
                onClick={onClose}
            >
                {/* Progress bars */}
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
                    {statuses.map((_, idx) => (
                        <div key={idx} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-75"
                                style={{
                                    width: idx < currentIndex ? '100%' :
                                        idx === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {statusGroup.user.username[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="text-white font-semibold text-sm">
                                {isMyStatus ? 'My Status' : statusGroup.user.username}
                            </div>
                            <div className="text-white/60 text-xs">{timeAgo(current.createdAt)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isMyStatus && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(current._id);
                                    if (statuses.length <= 1) {
                                        onClose();
                                    } else if (currentIndex >= statuses.length - 1) {
                                        setCurrentIndex(prev => Math.max(0, prev - 1));
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Delete this status"
                            >
                                <Trash2 size={20} className="text-red-400" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Image */}
                <motion.img
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={`${import.meta.env.VITE_BACKEND_URL}${current.imageUrl}`}
                    alt="Status"
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Caption */}
                {current.caption && (
                    <div className="absolute bottom-16 left-0 right-0 text-center">
                        <div className="inline-block bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-2xl text-sm max-w-[80%]">
                            {current.caption}
                        </div>
                    </div>
                )}

                {/* Navigation arrows */}
                {currentIndex > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                )}
                {currentIndex < statuses.length - 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default StatusViewer;
