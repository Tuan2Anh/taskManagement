import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Layout, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-lg z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-6 shadow-inner ring-1 ring-indigo-100">
                            <Layout className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 mt-2 text-lg">Enter your details to access your workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <Link to="/forgotpassword" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full py-4 text-base"
                        >
                            <span>Sign in</span>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer safe area */}
                <div className="text-center mt-8 text-slate-400 text-sm">
                    &copy; 2024 TaskFlow. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
