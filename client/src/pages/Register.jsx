import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            toast.success('Registration successful! Please verify your email.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <UserPlus className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create an Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Username"
                            id="username"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            id="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary" // Assuming green variant is not default, or use className to override if needed. 
                        // Actually let's use className to match original green style if wanted, or stick to new design system (slate-900).
                        // Let's stick to the new premium Button design (slate/dark) for consistency, unless user wants green.
                        // The User requested "premium" earlier. Slate is more premium than generic green.
                        className="w-full mt-6"
                    >
                        Register
                    </Button>
                </form>
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
