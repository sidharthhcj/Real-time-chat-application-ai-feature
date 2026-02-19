import React, { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ currentUser, users, selectedUser, onSelectUser, onLogout, className }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`glass-panel flex flex-col ${className}`}>
            {/* Header: Current User */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {currentUser?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-app)]"></div>
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold text-sm truncate">{currentUser?.username}</h2>
                        <div className="text-xs text-green-400">Online</div>
                    </div>
                </div>
                <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400" title="Logout">
                    <LogOut size={18} />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[var(--color-primary-start)] transition-all placeholder:text-text-muted text-text-main"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-text-muted mt-4 text-sm">No users found</div>
                ) : (
                    filteredUsers.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelectUser(user)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group border border-transparent
                 ${selectedUser?._id === user._id
                                    ? 'bg-white/10 border-white/10 shadow-lg backdrop-blur-sm'
                                    : 'hover:bg-white/5 text-text-main'
                                }
               `}
                        >
                            <div className="relative shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors
                    ${selectedUser?._id === user._id ? 'bg-[var(--color-primary-start)] text-white' : 'bg-gray-700 text-gray-200'}
                  `}>
                                    {user.username[0].toUpperCase()}
                                </div>
                                {/* Mock status for now */}
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-[var(--bg-app)]"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className={`font-semibold truncate ${selectedUser?._id === user._id ? 'text-text-main' : 'text-text-main'}`}>{user.username}</span>
                                    <span className="text-[10px] text-text-muted">12:30 PM</span>
                                </div>
                                <div className="text-xs truncate text-text-muted">
                                    Click to start chatting
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
