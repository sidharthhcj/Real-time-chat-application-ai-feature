import React, { useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Sparkles, BookOpen, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({
    selectedUser,
    messages,
    currentMessage,
    onMessageChange,
    onSendMessage,
    loading,
    className,
    // AI props
    smartReplies = [],
    smartRepliesLoading = false,
    onUseSmartReply,
    onRequestSmartReplies,
    onSummarize,
    chatSummary = "",
    summaryLoading = false,
    showSummary = false,
    onCloseSummary,
}) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!selectedUser) {
        return (
            <div className={`glass-panel flex flex-col items-center justify-center p-8 text-center ${className}`}>
                <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--text-main)]">Welcome to Chat</h3>
                <p className="text-[var(--text-muted)] max-w-sm">
                    Select a conversation from the sidebar to start chatting with your friends and colleagues.
                </p>
            </div>
        );
    }

    return (
        <div className={`glass-panel flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {selectedUser.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-main)]">{selectedUser.username}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-[var(--text-muted)]">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    {/* Summarize Button */}
                    {messages.length > 0 && (
                        <button
                            onClick={onSummarize}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors group relative"
                            title="Summarize Chat"
                        >
                            <BookOpen size={20} />
                        </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Video size={20} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Summary Modal/Banner */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-4 mt-3 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl relative">
                            <button
                                onClick={onCloseSummary}
                                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors text-[var(--text-muted)]"
                            >
                                <X size={16} />
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-purple-400" />
                                <span className="text-sm font-bold text-purple-400">AI Summary</span>
                            </div>
                            {summaryLoading ? (
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Analyzing conversation...</span>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-main)] leading-relaxed">{chatSummary}</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center mt-10"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] mt-10">No messages yet. Say hi! 👋</div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender === 'me';
                            return (
                                <motion.div
                                    key={msg._id || idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 flex items-center justify-center text-xs self-end mb-1 text-white">
                                            {selectedUser.username[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group
                     ${isMe
                                            ? "bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white rounded-tr-sm"
                                            : "bg-white/10 text-[var(--text-main)] rounded-tl-sm border border-white/5"
                                        }`}
                                    >
                                        {msg.message}
                                        <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Smart Reply Suggestions */}
            <AnimatePresence>
                {(smartReplies.length > 0 || smartRepliesLoading) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-2 overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span className="text-xs font-semibold text-[var(--text-muted)]">AI Suggestions</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {smartRepliesLoading ? (
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-xs">Getting suggestions...</span>
                                </div>
                            ) : (
                                smartReplies.map((reply, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => onUseSmartReply(reply)}
                                        className="text-sm px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-[var(--text-main)] hover:bg-[var(--color-primary-start)]/20 hover:border-[var(--color-primary-start)]/50 transition-all cursor-pointer"
                                    >
                                        {reply}
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-2 bg-black/20 rounded-2xl p-2 px-4 focus-within:ring-2 ring-[var(--color-primary-start)] transition-all">
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><Smile size={20} /></button>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><Paperclip size={20} /></button>
                    <button
                        onClick={onRequestSmartReplies}
                        disabled={smartRepliesLoading}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                        title="Get AI reply suggestions"
                    >
                        {smartRepliesLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    </button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={currentMessage}
                        onChange={(e) => onMessageChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)] py-2 mx-2"
                    />

                    {currentMessage.trim() ? (
                        <button
                            onClick={onSendMessage}
                            className="p-2 bg-[var(--color-primary-start)] rounded-full text-white hover:opacity-90 transition-opacity"
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><Mic size={20} /></button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
