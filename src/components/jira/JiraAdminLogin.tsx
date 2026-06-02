import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

interface JiraAdminLoginProps {
    onLoginSuccess: () => void;
}

const JiraAdminLogin: React.FC<JiraAdminLoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/v1/jira/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                onLoginSuccess();
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Shield className="w-16 h-16 text-yellow-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Jira User Management</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-black/20 border border-white/10 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white placeholder-gray-500"
                                placeholder="Enter admin username"
                            />
                            <Shield className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-black/20 border border-white/10 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white placeholder-gray-500"
                                placeholder="Enter admin password"
                            />
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Admin access required • Authorized personnel only</p>
                </div>
            </motion.div>
        </div>
    );
};

export default JiraAdminLogin;
