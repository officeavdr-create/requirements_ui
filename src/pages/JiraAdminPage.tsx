import React, { useState } from 'react';
import JiraAdminLogin from '@/components/jira/JiraAdminLogin';
import JiraAdminDashboard from '@/components/jira/JiraAdminDashboard';

const JiraAdminPage: React.FC = () => {
    const [authenticated, setAuthenticated] = useState(false);

    const handleLoginSuccess = () => {
        setAuthenticated(true);
    };

    const handleLogout = () => {
        setAuthenticated(false);
    };

    return (
        <>
            {!authenticated ? (
                <JiraAdminLogin onLoginSuccess={handleLoginSuccess} />
            ) : (
                <JiraAdminDashboard onLogout={handleLogout} />
            )}
        </>
    );
};

export default JiraAdminPage;
