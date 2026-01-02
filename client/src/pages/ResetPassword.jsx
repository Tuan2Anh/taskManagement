import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordAPI } from '../apis/authApi';
import { toast } from 'react-toastify';
import { Lock, Loader, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await resetPasswordAPI(token, password);
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Reset Password
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
