import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftRight as CompareIcon, ChevronDown, AlertCircle, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { Domain } from '@/services/domainService';

interface DomainComparisonTabProps {
    domains: Domain[];
}

// Parse content into sections by markdown headers
interface ContentSection {
    title: string;
    level: number; // 1 = #, 2 = ##, 3 = ###
    content: string;
    index: number;
}

function normalizeForCompare(str: string): string {
    return str.replace(/\s+/g, '').trim();
}

function parseIntoSections(text: string): ContentSection[] {
    if (!text || text === 'NA' || text.trim() === '') return [];
    const lines = text.split('\n');
    const sections: ContentSection[] = [];
    let current: ContentSection | null = null;
    let idx = 0;

    for (const line of lines) {
        const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
        if (headerMatch) {
            if (current) sections.push(current);
            current = {
                title: headerMatch[2].trim(),
                level: headerMatch[1].length,
                content: '',
                index: idx++
            };
        } else if (current) {
            current.content += line + '\n';
        } else {
            // Content before any header — treat as intro
            if (!current) {
                current = { title: '(Introduction)', level: 0, content: '', index: idx++ };
            }
            current.content += line + '\n';
        }
    }
    if (current) sections.push(current);
    return sections.map(s => ({ ...s, content: s.content.trim() }));
}

// Compute word-level diff between two strings
interface DiffSegment {
    type: 'same' | 'added' | 'removed';
    text: string;
}

function computeWordDiff(left: string, right: string): DiffSegment[] {
    const leftWords = left.split(/(\s+)/);
    const rightWords = right.split(/(\s+)/);

    // Simple LCS-based diff for words
    const m = leftWords.length;
    const n = rightWords.length;

    // For performance, if texts are very long, do line-level diff instead
    if (m > 3000 || n > 3000) {
        return computeLineDiff(left, right);
    }

    // Build LCS table
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (leftWords[i - 1] === rightWords[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to get diff
    const segments: DiffSegment[] = [];
    let i = m, j = n;
    const result: DiffSegment[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && leftWords[i - 1] === rightWords[j - 1]) {
            result.push({ type: 'same', text: leftWords[i - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.push({ type: 'added', text: rightWords[j - 1] });
            j--;
        } else {
            result.push({ type: 'removed', text: leftWords[i - 1] });
            i--;
        }
    }

    // Reverse and merge adjacent same-type segments
    result.reverse();
    for (const seg of result) {
        if (segments.length > 0 && segments[segments.length - 1].type === seg.type) {
            segments[segments.length - 1].text += seg.text;
        } else {
            segments.push({ ...seg });
        }
    }

    return segments;
}

function computeLineDiff(left: string, right: string): DiffSegment[] {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    
    const m = leftLines.length;
    const n = rightLines.length;

    // Build LCS table for lines
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (leftLines[i - 1] === rightLines[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to get line diff
    const segments: DiffSegment[] = [];
    let i = m, j = n;
    const result: DiffSegment[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
            result.push({ type: 'same', text: leftLines[i - 1] + '\n' });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.push({ type: 'added', text: rightLines[j - 1] + '\n' });
            j--;
        } else {
            result.push({ type: 'removed', text: leftLines[i - 1] + '\n' });
            i--;
        }
    }

    // Reverse and merge
    result.reverse();
    for (const seg of result) {
        if (segments.length > 0 && segments[segments.length - 1].type === seg.type) {
            segments[segments.length - 1].text += seg.text;
        } else {
            segments.push({ ...seg });
        }
    }

    return segments;
}

// Match sections between two domain contents by title similarity
interface SectionPair {
    leftSection: ContentSection | null;
    rightSection: ContentSection | null;
    matchScore: number; // 0-1 similarity
    fieldName: string;
}

function matchSections(leftSections: ContentSection[], rightSections: ContentSection[]): SectionPair[] {
    const pairs: SectionPair[] = [];
    const usedRight = new Set<number>();

    for (const left of leftSections) {
        let bestMatch: ContentSection | null = null;
        let bestScore = 0;
        let bestIdx = -1;

        for (let i = 0; i < rightSections.length; i++) {
            if (usedRight.has(i)) continue;
            const right = rightSections[i];
            const score = similarityScore(left.title, right.title);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = right;
                bestIdx = i;
            }
        }

        if (bestMatch && bestScore > 0.5) {
            usedRight.add(bestIdx);
            pairs.push({ leftSection: left, rightSection: bestMatch, matchScore: bestScore, fieldName: '' });
        } else {
            pairs.push({ leftSection: left, rightSection: null, matchScore: 0, fieldName: '' });
        }
    }

    // Add unmatched right sections
    for (let i = 0; i < rightSections.length; i++) {
        if (!usedRight.has(i)) {
            pairs.push({ leftSection: null, rightSection: rightSections[i], matchScore: 0, fieldName: '' });
        }
    }

    return pairs;
}

function similarityScore(a: string, b: string): number {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    if (aLower === bLower) return 1;
    if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8;

    // Jaccard similarity on words
    const aWords = new Set(aLower.split(/\s+/));
    const bWords = new Set(bLower.split(/\s+/));
    const intersection = new Set([...aWords].filter(w => bWords.has(w)));
    const union = new Set([...aWords, ...bWords]);
    return intersection.size / union.size;
}

const DomainComparisonTab: React.FC<DomainComparisonTabProps> = ({ domains }) => {
    const [leftDomainId, setLeftDomainId] = useState<string>('');
    const [rightDomainId, setRightDomainId] = useState<string>('');
    const [showMetadata, setShowMetadata] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [scopeSections, setScopeSections] = useState<{ left: any[]; right: any[] }>({ left: [], right: [] });
    const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

    const leftDomain = useMemo(() => domains.find(d => d.id === leftDomainId), [domains, leftDomainId]);
    const rightDomain = useMemo(() => domains.find(d => d.id === rightDomainId), [domains, rightDomainId]);

    // Content fields to compare section-wise
    const contentFields = [
        { key: 'description' as keyof Domain, label: 'Description / Scope', icon: '📋' },
        { key: 'configurations' as keyof Domain, label: 'Configurations', icon: '⚙️' },
        { key: 'special_input' as keyof Domain, label: 'Special Input', icon: '🔧' },
    ];

    // Metadata fields (condensed row)
    const metadataFields: { key: keyof Domain; label: string }[] = [
        { key: 'domain_type', label: 'Type' },
        { key: 'embedding_exists', label: 'Embeddings' },
        { key: 'ollama_embedding_model', label: 'Ollama Model' },
        { key: 'st_embedding_model', label: 'ST Model' },
    ];

    // Try to fetch structured scope sections from API
    useEffect(() => {
        if (!leftDomain || !rightDomain) return;

        const fetchSections = async (domainName: string) => {
            try {
                const res = await fetch(`/api/v1/scope-sections/${encodeURIComponent(domainName)}`);
                if (res.ok) return await res.json();
            } catch { /* ignore */ }
            return [];
        };

        Promise.all([
            fetchSections(leftDomain.name),
            fetchSections(rightDomain.name)
        ]).then(([left, right]) => {
            setScopeSections({ left: left || [], right: right || [] });
        });
    }, [leftDomain?.name, rightDomain?.name]);

    // Parse and match sections for each content field
    const sectionComparisons = useMemo(() => {
        if (!leftDomain || !rightDomain) return [];

        return contentFields.map(field => {
            const leftText = String(leftDomain[field.key] || '');
            const rightText = String(rightDomain[field.key] || '');
            const leftSections = parseIntoSections(leftText);
            const rightSections = parseIntoSections(rightText);

            // If no sections found (no headers), treat entire content as one section
            const ls = leftSections.length > 0 ? leftSections : [{ title: field.label, level: 0, content: leftText.trim(), index: 0 }];
            const rs = rightSections.length > 0 ? rightSections : [{ title: field.label, level: 0, content: rightText.trim(), index: 0 }];

            const pairs = matchSections(ls, rs);
            const identical = pairs.filter(p => p.leftSection && p.rightSection && normalizeForCompare(p.leftSection.content) === normalizeForCompare(p.rightSection.content)).length;
            const different = pairs.length - identical;

            return {
                field,
                pairs,
                stats: { total: pairs.length, identical, different },
                hasContent: leftText.trim() !== '' || rightText.trim() !== ''
            };
        }).filter(c => c.hasContent);
    }, [leftDomain, rightDomain]);

    // Structured scope section comparison
    const structuredComparison = useMemo(() => {
        if (scopeSections.left.length === 0 && scopeSections.right.length === 0) return null;

        const leftByType: Record<string, any> = {};
        const rightByType: Record<string, any> = {};
        scopeSections.left.forEach((s: any) => { leftByType[s.section_type] = s; });
        scopeSections.right.forEach((s: any) => { rightByType[s.section_type] = s; });

        const allTypes = new Set([...Object.keys(leftByType), ...Object.keys(rightByType)]);
        const pairs: SectionPair[] = [];
        allTypes.forEach(type => {
            const left = leftByType[type];
            const right = rightByType[type];
            pairs.push({
                leftSection: left ? { title: left.original_section_header || type, level: 1, content: left.content, index: 0 } : null,
                rightSection: right ? { title: right.original_section_header || type, level: 1, content: right.content, index: 0 } : null,
                matchScore: left && right ? 1 : 0,
                fieldName: type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            });
        });

        return pairs;
    }, [scopeSections]);

    const swapDomains = () => {
        const temp = leftDomainId;
        setLeftDomainId(rightDomainId);
        setRightDomainId(temp);
    };

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const expandAll = () => {
        const allKeys = new Set<string>();
        sectionComparisons.forEach((comp, ci) => {
            comp.pairs.forEach((_, pi) => allKeys.add(`${ci}-${pi}`));
        });
        if (structuredComparison) {
            structuredComparison.forEach((_, i) => allKeys.add(`scope-${i}`));
        }
        setExpandedSections(allKeys);
    };

    const collapseAll = () => setExpandedSections(new Set());

    const formatValue = (value: any, key: string): string => {
        if (value === null || value === undefined || value === '') return '—';
        if (key === 'embedding_exists') return value ? '✅ Yes' : '❌ No';
        return String(value);
    };

    // Total diff stats
    const totalStats = useMemo(() => {
        let identical = 0, different = 0;
        sectionComparisons.forEach(c => { identical += c.stats.identical; different += c.stats.different; });
        return { identical, different, total: identical + different };
    }, [sectionComparisons]);

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        Instance Comparison
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">
                        Compare section-by-section differences with smart whitespace-ignoring diffs.
                    </p>
                </div>
            </div>
            {/* Trendy Domain Selectors */}
            <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full relative group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Original Version</label>
                        <div className="relative">
                            <select
                                value={leftDomainId}
                                onChange={(e) => setLeftDomainId(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700/80 rounded-xl px-5 py-4 text-white appearance-none cursor-pointer hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none font-medium shadow-inner"
                            >
                                <option value="">Select domain instance...</option>
                                {domains.map(d => (
                                    <option key={d.id} value={d.id || ''} disabled={d.id === rightDomainId}>
                                        {d.name} ({d.domain_type})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-cyan-400 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex justify-center mt-6 md:mt-0">
                        <button
                            onClick={swapDomains}
                            disabled={!leftDomainId || !rightDomainId}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 p-4 rounded-full transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            title="Swap versions"
                        >
                            <CompareIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 w-full relative group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Modified Version</label>
                        <div className="relative">
                            <select
                                value={rightDomainId}
                                onChange={(e) => setRightDomainId(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700/80 rounded-xl px-5 py-4 text-white appearance-none cursor-pointer hover:border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all outline-none font-medium shadow-inner"
                            >
                                <option value="">Select domain instance...</option>
                                {domains.map(d => (
                                    <option key={d.id} value={d.id || ''} disabled={d.id === leftDomainId}>
                                        {d.name} ({d.domain_type})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {leftDomain && rightDomain ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Bar - Redesigned */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700/60 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-5">
                            <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gray-800 border border-gray-700 shadow-inner">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
                                    <circle 
                                        cx="28" cy="28" r="24" 
                                        stroke="currentColor" strokeWidth="4" fill="transparent" 
                                        className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" 
                                        strokeDasharray={`${(totalStats.identical / Math.max(1, totalStats.total)) * 150} 150`}
                                    />
                                </svg>
                                <span className="absolute text-[11px] font-bold text-gray-300">
                                    {Math.round((totalStats.identical / Math.max(1, totalStats.total)) * 100)}%
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest mb-1">Similarity Score</h4>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4" /> {totalStats.identical} Identical
                                    </span>
                                    <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium">
                                        <AlertCircle className="h-4 w-4" /> {totalStats.different} Modified
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowOnlyDiffs(!showOnlyDiffs)} 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                    showOnlyDiffs 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
                                }`}
                            >
                                {showOnlyDiffs ? 'Diffs Only' : 'Show All'}
                            </button>
                            <div className="h-6 w-px bg-gray-700 mx-1"></div>
                            <button onClick={expandAll} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm font-semibold hover:text-white hover:border-gray-500 transition-colors">
                                Expand All
                            </button>
                            <button onClick={collapseAll} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm font-semibold hover:text-white hover:border-gray-500 transition-colors">
                                Collapse
                            </button>
                        </div>
                    </div>

                    {/* Condensed Metadata Row */}
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setShowMetadata(!showMetadata)}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-700/30 transition-colors group"
                        >
                            <ChevronRight className={`h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-all duration-300 ${showMetadata ? 'rotate-90' : ''}`} />
                            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Metadata Properties</span>
                            <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded-full border border-gray-700/50">{metadataFields.length} fields</span>
                        </button>
                        <div className={`transition-all duration-500 ease-in-out ${showMetadata ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-[160px_1fr_1fr] text-xs border-t border-gray-700/50">
                                <div className="px-4 py-3 font-bold uppercase tracking-wider text-gray-500 bg-gray-900/60 border-b border-gray-700/50">Property</div>
                                <div className="px-4 py-3 font-bold uppercase tracking-wider text-cyan-400 bg-gray-900/60 border-b border-l border-gray-700/50 truncate">{leftDomain.name}</div>
                                <div className="px-4 py-3 font-bold uppercase tracking-wider text-purple-400 bg-gray-900/60 border-b border-l border-gray-700/50 truncate">{rightDomain.name}</div>
                                {metadataFields.map((f, i) => {
                                    const lv = formatValue(leftDomain[f.key], f.key);
                                    const rv = formatValue(rightDomain[f.key], f.key);
                                    const same = lv === rv;
                                    const isLast = i === metadataFields.length - 1;
                                    const borderB = isLast ? '' : 'border-b border-gray-700/30';
                                    return (
                                        <React.Fragment key={f.key}>
                                            <div className={`px-4 py-2.5 text-gray-400 ${borderB} flex items-center gap-2 font-medium ${!same ? 'bg-amber-500/5' : ''}`}>
                                                {same ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
                                                {f.label}
                                            </div>
                                            <div className={`px-4 py-2.5 border-l border-gray-700/30 text-gray-300 font-mono text-xs ${borderB} ${!same ? 'bg-amber-500/5 text-amber-200' : ''}`}>{lv}</div>
                                            <div className={`px-4 py-2.5 border-l border-gray-700/30 text-gray-300 font-mono text-xs ${borderB} ${!same ? 'bg-amber-500/5 text-amber-200' : ''}`}>{rv}</div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Structured Scope Sections (from API) */}
                    {structuredComparison && structuredComparison.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-400" />
                                Structured Scope Sections
                                <span className="text-xs text-gray-500 font-normal">(from parsed scope data)</span>
                            </h3>
                            {structuredComparison.map((pair, idx) => {
                                const key = `scope-${idx}`;
                                const expanded = expandedSections.has(key);
                                const lContent = pair.leftSection?.content || '';
                                const rContent = pair.rightSection?.content || '';
                                const same = normalizeForCompare(lContent) === normalizeForCompare(rContent);
                                if (showOnlyDiffs && same) return null;

                                return (
                                    <SectionDiffCard
                                        key={key}
                                        sectionKey={key}
                                        title={pair.fieldName || pair.leftSection?.title || pair.rightSection?.title || 'Section'}
                                        leftContent={lContent}
                                        rightContent={rContent}
                                        leftLabel={leftDomain.name}
                                        rightLabel={rightDomain.name}
                                        same={same}
                                        expanded={expanded}
                                        onToggle={() => toggleSection(key)}
                                        onlyLeft={!pair.rightSection}
                                        onlyRight={!pair.leftSection}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Section-wise Content Comparison */}
                    {sectionComparisons.map((comp, ci) => (
                        <div key={comp.field.key} className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <span>{comp.field.icon}</span>
                                {comp.field.label}
                                <span className="text-xs text-gray-500 font-normal">
                                    ({comp.stats.identical} identical, {comp.stats.different} different)
                                </span>
                            </h3>

                            {comp.pairs.map((pair, pi) => {
                                const key = `${ci}-${pi}`;
                                const expanded = expandedSections.has(key);
                                const lContent = pair.leftSection?.content || '';
                                const rContent = pair.rightSection?.content || '';
                                const same = normalizeForCompare(lContent) === normalizeForCompare(rContent);
                                if (showOnlyDiffs && same) return null;

                                return (
                                    <SectionDiffCard
                                        key={key}
                                        sectionKey={key}
                                        title={pair.leftSection?.title || pair.rightSection?.title || 'Section'}
                                        leftContent={lContent}
                                        rightContent={rContent}
                                        leftLabel={leftDomain.name}
                                        rightLabel={rightDomain.name}
                                        same={same}
                                        expanded={expanded}
                                        onToggle={() => toggleSection(key)}
                                        onlyLeft={!pair.rightSection}
                                        onlyRight={!pair.leftSection}
                                    />
                                );
                            })}
                        </div>
                    ))}

                    {sectionComparisons.length === 0 && !structuredComparison && (
                        <div className="bg-gray-800/20 rounded-2xl p-12 text-center border border-gray-700/50 border-dashed">
                            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-base font-medium">No content to compare.</p>
                            <p className="text-gray-500 text-sm mt-1">Both domains have empty description, configurations, and special input fields.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-900/30 border border-gray-700/50 border-dashed rounded-3xl p-16 text-center animate-in fade-in duration-700">
                    <div className="bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CompareIcon className="h-10 w-10 text-cyan-500/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Select Versions to Compare</h3>
                    <p className="text-gray-400 text-base max-w-md mx-auto">
                        Choose a domain instance in each dropdown above to see a beautiful section-by-section diff focusing on actual content changes.
                    </p>
                </div>
            )}
        </div>
    );
};

// Individual Section Diff Card
const SectionDiffCard: React.FC<{
    sectionKey: string;
    title: string;
    leftContent: string;
    rightContent: string;
    leftLabel: string;
    rightLabel: string;
    same: boolean;
    expanded: boolean;
    onToggle: () => void;
    onlyLeft?: boolean;
    onlyRight?: boolean;
}> = ({ title, leftContent, rightContent, leftLabel, rightLabel, same, expanded, onToggle, onlyLeft, onlyRight }) => {
    const diff = useMemo(() => {
        if (same || !leftContent || !rightContent) return null;
        return computeWordDiff(leftContent, rightContent);
    }, [leftContent, rightContent, same]);

    const borderColor = same ? 'border-green-500/30' : onlyLeft ? 'border-cyan-500/30' : onlyRight ? 'border-purple-500/30' : 'border-amber-500/30';
    const bgColor = same ? 'bg-green-500/[0.02]' : 'bg-amber-500/[0.03]';
    
    const statusBadge = same
        ? <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded-full shadow-sm">Identical</span>
        : onlyLeft
            ? <span className="text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full shadow-sm">Only in A</span>
            : onlyRight
                ? <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full shadow-sm">Only in B</span>
                : <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full shadow-sm">Modified</span>;

    return (
        <div className={`border ${borderColor} ${bgColor} rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:border-opacity-50`}>
            {/* Section Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left focus:outline-none"
            >
                <div className={`p-1.5 rounded-md ${expanded ? 'bg-white/10' : 'bg-transparent'} transition-colors`}>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                <FileText className="h-5 w-5 text-cyan-400/70 shrink-0" />
                <span className="text-base text-gray-100 font-semibold truncate tracking-wide">{title}</span>
                <div className="ml-4">{statusBadge}</div>
                {!same && leftContent && rightContent && (
                    <span className="text-xs font-medium text-gray-500 ml-auto shrink-0 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                        {leftContent.trim().split(/\s+/).length} / {rightContent.trim().split(/\s+/).length} words
                    </span>
                )}
            </button>

            {/* Expanded Content */}
            <div className={`transition-all duration-500 ease-in-out ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="border-t border-gray-700/50 bg-gray-900/40">
                    {same ? (
                        <div className="px-6 py-5 text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {leftContent || <span className="text-gray-500 italic">Empty Section</span>}
                        </div>
                    ) : onlyLeft || onlyRight ? (
                        <div className={`px-6 py-5 text-sm whitespace-pre-wrap font-sans leading-relaxed ${onlyLeft ? 'bg-cyan-500/5 text-cyan-100' : 'bg-purple-500/5 text-purple-100'}`}>
                            {onlyLeft ? leftContent : rightContent}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 divide-x divide-gray-700/50">
                            {/* Column Headers */}
                            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-gray-900/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between">
                                <span>{leftLabel}</span>
                                <span className="text-gray-500 font-normal">Original</span>
                            </div>
                            <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-purple-400 bg-gray-900/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between">
                                <span>{rightLabel}</span>
                                <span className="text-gray-500 font-normal">Modified</span>
                            </div>

                            {/* Diff View */}
                            <div className="px-4 py-4 text-[13px] font-sans whitespace-pre-wrap overflow-y-auto leading-relaxed text-gray-300 custom-scrollbar max-h-[600px]">
                                {diff ? diff.map((seg, i) => {
                                    if (seg.type === 'removed') {
                                        return <span key={i} className="bg-red-500/20 text-red-200 px-1 py-0.5 rounded-sm line-through decoration-red-500/50">{seg.text}</span>;
                                    }
                                    if (seg.type === 'same') {
                                        return <span key={i} className="text-gray-400">{seg.text}</span>;
                                    }
                                    return null;
                                }) : <span className="text-gray-500">{leftContent}</span>}
                            </div>
                            <div className="px-4 py-4 text-[13px] font-sans whitespace-pre-wrap overflow-y-auto leading-relaxed text-gray-300 custom-scrollbar max-h-[600px]">
                                {diff ? diff.map((seg, i) => {
                                    if (seg.type === 'added') {
                                        return <span key={i} className="bg-green-500/25 text-green-100 px-1 py-0.5 rounded-sm font-medium shadow-[0_0_8px_rgba(34,197,94,0.2)]">{seg.text}</span>;
                                    }
                                    if (seg.type === 'same') {
                                        return <span key={i} className="text-gray-400">{seg.text}</span>;
                                    }
                                    return null;
                                }) : <span className="text-gray-500">{rightContent}</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DomainComparisonTab;
