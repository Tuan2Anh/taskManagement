import { Layout, LogOut, CheckSquare, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-2xl z-50">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="bg-indigo-500 p-2 rounded-lg">
                    <Layout className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    TaskFlow
                </h1>
            </div>

            {/* Navigation */}

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            Free Plan
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
