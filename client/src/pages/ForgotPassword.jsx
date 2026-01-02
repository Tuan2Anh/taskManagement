import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordAPI } from '../apis/authApi';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Loader } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPasswordAPI(email);
            setSubmitted(true);
            toast.success('Reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Forgot Password
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <div className="mb-4 text-green-500 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Check your email</h3>
                        <p className="text-slate-600 mb-6">
                            We have sent a password reset link to <strong>{email}</strong>
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Resend email
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
