import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Shield, Database as DatabaseIcon } from 'lucide-react';
import { Domain } from '@/services/domainService';

interface DomainHealthDashboardProps {
    domains: Domain[];
}

type HealthLevel = 'healthy' | 'warning' | 'critical';

interface DomainHealthScore {
    domain: Domain;
    score: number;
    maxScore: number;
    level: HealthLevel;
    checks: { label: string; passed: boolean; detail: string }[];
}

function assessDomainHealth(domain: Domain): DomainHealthScore {
    const checks: { label: string; passed: boolean; detail: string }[] = [];

    // Check 1: Has description
    const hasDesc = !!domain.description?.trim();
    checks.push({ label: 'Description', passed: hasDesc, detail: hasDesc ? 'Provided' : 'Missing' });

    // Check 2: Has configurations
    const hasConfig = !!domain.configurations?.trim();
    checks.push({ label: 'Configurations', passed: hasConfig, detail: hasConfig ? 'Provided' : 'Missing' });

    // Check 3: Embeddings exist
    checks.push({ label: 'Embeddings', passed: domain.embedding_exists, detail: domain.embedding_exists ? 'Generated' : 'Not generated' });

    // Check 4: Has domain_type assigned
    const hasType = !!domain.domain_type?.trim();
    checks.push({ label: 'Domain Type', passed: hasType, detail: hasType ? domain.domain_type : 'Not assigned' });

    // Check 5: Has embedding model configured
    const hasModel = !!domain.ollama_embedding_model || !!domain.st_embedding_model;
    const modelName = domain.ollama_embedding_model || domain.st_embedding_model || 'None';
    checks.push({ label: 'Embedding Model', passed: hasModel, detail: modelName });

    // Check 6: Has special_input
    const hasSpecial = !!domain.special_input?.trim();
    checks.push({ label: 'Special Input', passed: hasSpecial, detail: hasSpecial ? 'Provided' : 'Not set (optional)' });

    const score = checks.filter(c => c.passed).length;
    const maxScore = checks.length;
    const ratio = score / maxScore;

    const level: HealthLevel = ratio >= 0.8 ? 'healthy' : ratio >= 0.5 ? 'warning' : 'critical';

    return { domain, score, maxScore, level, checks };
}

const healthColors: Record<HealthLevel, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    healthy: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: <CheckCircle className="h-5 w-5 text-green-400" /> },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <AlertTriangle className="h-5 w-5 text-amber-400" /> },
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: <AlertCircle className="h-5 w-5 text-red-400" /> },
};

const DomainHealthDashboard: React.FC<DomainHealthDashboardProps> = ({ domains }) => {
    // Filter out placeholder domains (those with null IDs)
    const realDomains = domains.filter(d => d.id !== null);
    const healthScores = realDomains.map(assessDomainHealth);

    const healthyCt = healthScores.filter(h => h.level === 'healthy').length;
    const warningCt = healthScores.filter(h => h.level === 'warning').length;
    const criticalCt = healthScores.filter(h => h.level === 'critical').length;
    const embeddingCt = realDomains.filter(d => d.embedding_exists).length;
    const avgScore = healthScores.length > 0
        ? Math.round((healthScores.reduce((sum, h) => sum + (h.score / h.maxScore) * 100, 0)) / healthScores.length)
        : 0;

    if (realDomains.length === 0) {
        return (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                <Shield className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-400 font-medium">No Domain Instances</h3>
                <p className="text-gray-500 text-sm mt-1">Create domain instances to see health metrics.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{avgScore}%</p>
                    <p className="text-xs text-gray-400 mt-1">Avg Health</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{healthyCt}</p>
                    <p className="text-xs text-gray-400 mt-1">Healthy</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{warningCt}</p>
                    <p className="text-xs text-gray-400 mt-1">Warning</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{criticalCt}</p>
                    <p className="text-xs text-gray-400 mt-1">Critical</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <DatabaseIcon className="h-4 w-4 text-cyan-400" />
                        <p className="text-2xl font-bold text-cyan-400">{embeddingCt}/{realDomains.length}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Embeddings</p>
                </div>
            </div>

            {/* Domain Health Cards */}
            <div className="space-y-3">
                {healthScores
                    .sort((a, b) => a.score - b.score) // Show worst first
                    .map((health) => {
                        const colors = healthColors[health.level];
                        const pct = Math.round((health.score / health.maxScore) * 100);

                        return (
                            <div
                                key={health.domain.id || health.domain.name}
                                className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all hover:shadow-md`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {colors.icon}
                                        <div>
                                            <h4 className="text-white font-medium">{health.domain.name}</h4>
                                            <span className="text-xs text-gray-400">{health.domain.domain_type}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${colors.text}`}>{pct}%</p>
                                        <p className="text-xs text-gray-500">{health.score}/{health.maxScore} checks</p>
                                    </div>
                                </div>
                                {/* Health bar */}
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${health.level === 'healthy' ? 'bg-green-500'
                                            : health.level === 'warning' ? 'bg-amber-500'
                                                : 'bg-red-500'
                                            }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                {/* Check items */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {health.checks.map((check, ci) => (
                                        <div key={ci} className="flex items-center gap-1.5 text-xs">
                                            {check.passed
                                                ? <CheckCircle className="h-3 w-3 text-green-400 shrink-0" />
                                                : <AlertCircle className="h-3 w-3 text-gray-500 shrink-0" />
                                            }
                                            <span className={check.passed ? 'text-gray-300' : 'text-gray-500'}>
                                                {check.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default DomainHealthDashboard;
