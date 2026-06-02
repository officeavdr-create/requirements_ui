import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JiraLogin from '../components/jira/JiraLogin';
import JiraConfig from '../components/jira/JiraConfig';
import JiraProcessing from '../components/jira/JiraProcessing';

const STORAGE_KEY = 'jira_processor_state';

const JiraProcessorPage: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [view, setView] = useState<'login' | 'config' | 'processing'>('login');

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const { userId: savedUserId, userEmail: savedEmail, view: savedView } = JSON.parse(savedState);
                if (savedUserId && savedEmail) {
                    setUserId(savedUserId);
                    setUserEmail(savedEmail);
                    setView(savedView || 'processing');
                }
            } catch (e) {
                console.error('Failed to load saved state:', e);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (userId && userEmail) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, userEmail, view }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [userId, userEmail, view]);

    const handleLogin = (id: string, email: string) => {
        setUserId(id);
        setUserEmail(email);
        // Check if we should go to config or processing (could check if config exists, 
        // but for now default to processing, user can switch to config)
        setView('processing');
    };

    const handleLogout = () => {
        setUserId(null);
        setUserEmail(null);
        setView('login');
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Jira Plugin
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Automated issue extraction and documentation generation
                        </p>
                    </div>

                    {userId && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{userEmail}</p>
                                <p className="text-xs text-gray-500">Logged in</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}
                </header>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {view === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <JiraLogin onLogin={handleLogin} />
                        </motion.div>
                    )}

                    {view === 'config' && userId && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-6">
                                <button
                                    onClick={() => setView('processing')}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    ← Back to Processing
                                </button>
                            </div>
                            <JiraConfig
                                userId={userId}
                                onConfigSaved={() => setView('processing')}
                            />
                        </motion.div>
                    )}

                    {view === 'processing' && userId && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <JiraProcessing
                                userId={userId}
                                onBack={() => setView('config')}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default JiraProcessorPage;
