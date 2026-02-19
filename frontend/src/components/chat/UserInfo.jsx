import React from 'react';

const UserInfo = ({ selectedUser, className }) => {
    if (!selectedUser) return null;

    return (
        <div className={`glass-panel p-6 flex flex-col items-center text-center ${className}`}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                {selectedUser.username[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mb-1">{selectedUser.username}</h2>
            {/* Mock data for now */}
            <p className="text-sm text-gray-400 mb-6">Online</p>

            <div className="w-full space-y-4 text-left">
                <div>
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wider">Shared Media</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"></div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wider">Privacy & Support</h3>
                    <div className="space-y-1">
                        <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-sm text-gray-300 transition-colors">Block User</button>
                        <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-sm text-red-400 transition-colors">Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
