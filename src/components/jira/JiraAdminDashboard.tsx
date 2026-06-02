import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, RefreshCw, Users, LogOut } from 'lucide-react';

interface User {
    id: string;
    email: string;
    created_at: string;
    last_login: string | null;
}

interface JiraAdminDashboardProps {
    onLogout: () => void;
}

const JiraAdminDashboard: React.FC<JiraAdminDashboardProps> = ({ onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', pin: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/jira/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(newUser.pin)) {
            setMessage({ type: 'error', text: 'PIN must be exactly 6 digits' });
            return;
        }

        setCreating(true);
        setMessage(null);
        try {
            const res = await fetch('/api/v1/jira/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                setNewUser({ email: '', pin: '' });
                fetchUsers();
            } else {
                throw new Error('Failed to create user');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create user' });
        } finally {
            setCreating(false);
        }
    };

    const deleteUser = async (userId: string, email: string) => {
        if (!confirm(`Delete user ${email}?`)) return;

        try {
            const res = await fetch(`/api/v1/jira/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'User deleted successfully!' });
                fetchUsers();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Jira Admin Panel</h1>
                        <p className="text-gray-400">Manage Jira users and access</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Create User Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Create New User
                    </h2>
                    <form onSubmit={createUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white placeholder-gray-500"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">6-Digit PIN</label>
                                <input
                                    type="text"
                                    required
                                    pattern="\d{6}"
                                    value={newUser.pin}
                                    onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white placeholder-gray-500"
                                    placeholder="123456"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                        >
                            {creating ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                </motion.div>

                {/* Users List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Registered Users ({users.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
                            <p className="text-gray-400">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                            <p className="text-gray-400">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Login</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-white">{user.email}</td>
                                            <td className="py-3 px-4 text-gray-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-sm">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => deleteUser(user.id, user.email)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default JiraAdminDashboard;
