import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface JiraConfigProps {
    userId: string;
    onConfigSaved: () => void;
}

interface Project {
    key: string;
    name: string;
}

const JiraConfig: React.FC<JiraConfigProps> = ({ userId, onConfigSaved }) => {
    const [config, setConfig] = useState({
        jira_url: '',
        username: '',
        api_token: '',
        project_key: ''
    });
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [fetchingProjects, setFetchingProjects] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, [userId]);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/v1/jira/config/${userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.jira_url) {
                    setConfig({
                        jira_url: data.jira_url,
                        username: data.username,
                        api_token: data.api_token,
                        project_key: data.project_key
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch config", err);
        }
    };

    const fetchProjects = async () => {
        if (!config.jira_url || !config.username || !config.api_token) {
            setMessage({ type: 'error', text: 'Please enter Jira URL, username, and API token first' });
            return;
        }

        setFetchingProjects(true);
        setMessage(null);
        try {
            const res = await fetch('/api/v1/jira/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jira_url: config.jira_url,
                    username: config.username,
                    api_token: config.api_token
                }),
            });
            const data = await res.json();
            if (data.projects && data.projects.length > 0) {
                setProjects(data.projects);
                setMessage({ type: 'success', text: `Found ${data.projects.length} projects` });
            } else {
                setMessage({ type: 'error', text: 'No projects found or connection failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch projects' });
        } finally {
            setFetchingProjects(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/v1/jira/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, ...config }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Connection successful!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Connection failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to test connection' });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/v1/jira/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, ...config }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                setTimeout(() => onConfigSaved(), 1000);
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Jira Configuration</h2>
                <p className="text-gray-400">Configure your Jira connection details to enable issue processing.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Jira URL</label>
                        <input
                            type="url"
                            required
                            value={config.jira_url}
                            onChange={(e) => setConfig({ ...config, jira_url: e.target.value })}
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-gray-500"
                            placeholder="https://company.atlassian.net"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username / Email</label>
                        <input
                            type="email"
                            required
                            value={config.username}
                            onChange={(e) => setConfig({ ...config, username: e.target.value })}
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-gray-500"
                            placeholder="email@company.com"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">API Token</label>
                        <input
                            type="password"
                            required
                            value={config.api_token}
                            onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-gray-500"
                            placeholder="••••••••••••••••"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-300">Project Key</label>
                            <button
                                type="button"
                                onClick={fetchProjects}
                                disabled={fetchingProjects || !config.jira_url || !config.username || !config.api_token}
                                className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-50"
                            >
                                {fetchingProjects ? 'Loading...' : 'Fetch Projects'}
                            </button>
                        </div>
                        {projects.length > 0 ? (
                            <select
                                required
                                value={config.project_key}
                                onChange={(e) => setConfig({ ...config, project_key: e.target.value })}
                                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                            >
                                <option value="">Select a project...</option>
                                {projects.map((proj) => (
                                    <option key={proj.key} value={proj.key}>
                                        {proj.key} - {proj.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                required
                                value={config.project_key}
                                onChange={(e) => setConfig({ ...config, project_key: e.target.value })}
                                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-gray-500"
                                placeholder="PROJ (or click 'Fetch Projects')"
                            />
                        )}
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

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || loading}
                        className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        {testing ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                        type="submit"
                        disabled={loading || testing}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default JiraConfig;
