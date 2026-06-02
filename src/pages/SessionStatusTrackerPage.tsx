import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, RefreshCw, CheckCircle, AlertCircle, Clock, XCircle, Loader2, FileSpreadsheet, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Progress component replaced with custom enhanced progress bar

interface SessionStatus {
  session_id: string;  // Changed from sessionId
  status: 'pending' | 'uploading' | 'processing_domain' | 'generating_embeddings' |
  'processing_sys2' | 'generating_swe1' | 'completed' | 'failed';
  message: string;
  progress_percentage: number;  // Changed from progressPercentage
  current_step: string | null;   // Changed from currentStep
  created_at: string;            // Changed from createdAt
  updated_at: string;            // Changed from updatedAt
  error_details: string | null;  // Changed from errorDetails
}


const SessionStatusTrackerPage: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [epicPreviews, setEpicPreviews] = useState<any[]>([]);
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  // Poll for status updates
  useEffect(() => {
    if (!isPolling || !sessionStatus) return;

    const isProcessing = !['completed', 'failed', 'pending'].includes(sessionStatus.status);

    if (!isProcessing) {
      setIsPolling(false);
      return;
    }

    const pollInterval = setInterval(() => {
      fetchSessionStatus(sessionId, false);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, sessionStatus, sessionId]);

  // Poll for EPIC previews while processing
  useEffect(() => {
    if (!sessionStatus || !sessionId) return;
    const isProcessing = !['completed', 'failed', 'pending'].includes(sessionStatus.status);
    if (!isProcessing && sessionStatus.status !== 'completed') return;

    const fetchPreviews = async () => {
      try {
        const res = await fetch(`/api/v1/testbed/${sessionId}/epic-previews`);
        if (res.ok) {
          const data = await res.json();
          setEpicPreviews(data.previews || []);
        }
      } catch { /* ignore */ }
    };
    fetchPreviews();
    const interval = setInterval(fetchPreviews, 5000);
    return () => clearInterval(interval);
  }, [sessionStatus?.status, sessionId]);

  // Fetch recent sessions on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/v1/testbed/recent-sessions?limit=3');
        if (res.ok) {
          const data = await res.json();
          setRecentSessions(data.sessions || []);
        }
      } catch { /* ignore */ }
    };
    fetchRecent();
  }, []);

  // Calculate elapsed time
  // Calculate elapsed time
  useEffect(() => {
    if (!sessionStatus || sessionStatus.status === 'completed' || sessionStatus.status === 'failed') {
      return;
    }

    const timer = setInterval(() => {
      const start = new Date(sessionStatus.created_at).getTime();
      const now = Date.now();
      const secondsElapsed = Math.floor((now - start) / 1000);
      console.log('Seconds elapsed:', secondsElapsed); // Add this debug log
      setElapsedTime(secondsElapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStatus]);


  const fetchSessionStatus = useCallback(async (sid: string, showLoading: boolean = true) => {
    if (!sid.trim()) {
      setError('Please enter a session ID');
      return;
    }

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/testbed/${sid}/status`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found. Please check the session ID.');
        }
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched session status:', data); // Debug log
      setSessionStatus(data);

      const isProcessing = !['completed', 'failed', 'pending'].includes(data.status);
      if (isProcessing && !isPolling) {
        setIsPolling(true);
      }
    } catch (err: any) {
      console.error('Error fetching status:', err); // Debug log
      setError(err.message || 'Failed to fetch session status');
      setSessionStatus(null);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [isPolling]);


  const handleCheckStatus = () => {
    fetchSessionStatus(sessionId, true);
  };

  const handleDownload = async () => {
    if (!sessionStatus || !sessionStatus.session_id) {  // Changed from sessionId
      setError('No session ID available');
      console.error('Session status:', sessionStatus); // Debug log
      return;
    }

    try {
      const response = await fetch(`/api/v1/testbed/${sessionStatus.session_id}/download`);  // Changed

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `SWE1_${sessionStatus.session_id.slice(0, 8)}.xlsx`;  // Changed

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err); // Debug log
      setError('Failed to download file');
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-gray-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      uploading: { variant: 'default', label: 'Uploading' },
      processing_domain: { variant: 'default', label: 'Processing Domain' },
      generating_embeddings: { variant: 'default', label: 'Generating Embeddings' },
      processing_sys2: { variant: 'default', label: 'Processing SYS2' },
      generating_swe1: { variant: 'default', label: 'Generating SWE1' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' }
    };

    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Status Tracker</h1>
          <p className="text-gray-500 mt-1">Monitor your SWE.1 generation progress</p>
        </div>
      </div>

      {/* Session ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Session ID</CardTitle>
          <CardDescription>
            Enter your session ID to check the current generation status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="session-id">Session ID</Label>
              <Input
                id="session-id"
                placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckStatus()}
                className="mt-1"
              />
            </div>
          </div>

          {/* Recent Sessions Quick-Select */}
          {recentSessions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent Sessions</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {recentSessions.map((s: any) => (
                  <button
                    key={s.session_id}
                    onClick={() => {
                      setSessionId(s.session_id);
                      fetchSessionStatus(s.session_id, true);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all hover:border-cyan-500/40 ${sessionId === s.session_id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                        : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40'
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs">
                        {s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : s.status === 'pending' ? '⏸️' : '⏳'}
                      </span>
                      <span className="font-mono text-xs truncate">{s.session_id.substring(0, 8)}...</span>
                      <span className="text-xs text-gray-500 truncate">{s.session_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.epic_count > 0 && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                          {s.epic_count} EPICs
                        </span>
                      )}
                      <Badge variant="outline" className={`text-[10px] ${s.status === 'completed' ? 'border-green-500/30 text-green-400'
                          : s.status === 'failed' ? 'border-red-500/30 text-red-400'
                            : 'border-gray-500/30 text-gray-400'
                        }`}>
                        {s.progress}%
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleCheckStatus}
            disabled={isLoading || !sessionId.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check Status
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Display */}
      {/* Status Display */}
      {sessionStatus && (
        <Card className="bg-gray-800/70 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Generation Status</CardTitle>
                <CardDescription className="text-gray-400">
                  {sessionStatus.session_id ? (
                    <>Session: {sessionStatus.session_id.slice(0, 8)}...</>
                  ) : (
                    'Session information loading...'
                  )}
                </CardDescription>
              </div>
              {sessionStatus.status && getStatusBadge(sessionStatus.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Overview */}
            <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
              {sessionStatus.status && getStatusIcon(sessionStatus.status)}
              <div className="flex-1">
                <p className="font-medium text-lg text-white">
                  {sessionStatus.status === 'completed' && 'Generation Complete!'}
                  {sessionStatus.status === 'failed' && 'Generation Failed'}
                  {sessionStatus.status === 'pending' && 'Waiting to Start'}
                  {sessionStatus.status && !['completed', 'failed', 'pending'].includes(sessionStatus.status) &&
                    'Processing...'}
                </p>
                {sessionStatus.current_step && (  // Changed from currentStep
                  <p className="text-sm text-gray-400 mt-1">{sessionStatus.current_step}</p>
                )}
              </div>
              {sessionStatus.status && !['completed', 'failed', 'pending'].includes(sessionStatus.status) && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Elapsed Time</p>
                  <p className="text-lg font-mono font-semibold text-cyan-400">{formatElapsedTime(elapsedTime)}</p>
                </div>
              )}
            </div>

            {/* Enhanced Progress Bar */}
            {sessionStatus.progress_percentage !== undefined && sessionStatus.progress_percentage !== null && (() => {
              // Parse EPIC progress from current_step message
              // Format: "Processing EPIC x/y: [Name] | SYS2: a/b"
              const stepText = sessionStatus.current_step || '';
              const epicMatch = stepText.match(/EPIC\s+(\d+)\/(\d+)/i);
              const sys2Match = stepText.match(/SYS2:\s*(\d+)\/(\d+)/i);
              const epicNameMatch = stepText.match(/EPIC\s+\d+\/\d+:\s*(.+?)(?:\s*\||\s*$)/i);

              const currentEpic = epicMatch ? parseInt(epicMatch[1]) : 0;
              const totalEpics = epicMatch ? parseInt(epicMatch[2]) : 0;
              const currentSys2 = sys2Match ? parseInt(sys2Match[1]) : 0;
              const totalSys2 = sys2Match ? parseInt(sys2Match[2]) : 0;
              const epicName = epicNameMatch ? epicNameMatch[1].trim() : '';

              // Pipeline stages
              const stages = [
                { key: 'upload', label: 'Upload', statuses: ['uploading'] },
                { key: 'embed', label: 'Embeddings', statuses: ['generating_embeddings'] },
                { key: 'process', label: 'Processing', statuses: ['processing_domain', 'processing_sys2'] },
                { key: 'generate', label: 'SWE1 Gen', statuses: ['generating_swe1'] },
                { key: 'done', label: 'Done', statuses: ['completed'] },
              ];

              const currentStageIdx = stages.findIndex(s => s.statuses.includes(sessionStatus.status));

              return (
                <div className="space-y-4">
                  {/* Pipeline Stages */}
                  <div className="flex items-center gap-1">
                    {stages.map((stage, idx) => {
                      const isCompleted = currentStageIdx > idx || sessionStatus.status === 'completed';
                      const isActive = currentStageIdx === idx;
                      const isPending = currentStageIdx < idx && sessionStatus.status !== 'completed';

                      return (
                        <React.Fragment key={stage.key}>
                          <div className={`flex-1 relative rounded-md h-8 flex items-center justify-center text-xs font-medium transition-all duration-500 ${isCompleted
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/20'
                            : isActive
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white animate-pulse shadow-lg shadow-cyan-500/30'
                              : isPending
                                ? 'bg-gray-700/50 text-gray-500'
                                : 'bg-gray-700/50 text-gray-500'
                            }`}>
                            {isCompleted && <CheckCircle className="h-3 w-3 mr-1" />}
                            {isActive && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {stage.label}
                          </div>
                          {idx < stages.length - 1 && (
                            <div className={`w-3 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* EPIC Segmented Progress */}
                  {totalEpics > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">EPIC Progress</span>
                        <span className="font-semibold text-white">{currentEpic} / {totalEpics} EPICs</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: totalEpics }, (_, i) => {
                          const epicIdx = i + 1;
                          const isEpicDone = epicIdx < currentEpic;
                          const isEpicActive = epicIdx === currentEpic;
                          const isEpicPending = epicIdx > currentEpic;

                          const segmentProgress = isEpicDone ? 100 : isEpicActive && totalSys2 > 0
                            ? Math.round((currentSys2 / totalSys2) * 100)
                            : 0;

                          return (
                            <div key={i} className="flex-1 group relative" title={`EPIC ${epicIdx}${isEpicActive && epicName ? `: ${epicName}` : ''}`}>
                              <div className={`h-6 rounded overflow-hidden ${isEpicPending ? 'bg-gray-700/50' : 'bg-gray-700'}`}>
                                <div
                                  className={`h-full transition-all duration-700 ease-out ${isEpicDone
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                    : isEpicActive
                                      ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                                      : ''
                                    }`}
                                  style={{ width: `${segmentProgress}%` }}
                                />
                              </div>
                              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isEpicDone ? 'text-white' : isEpicActive ? 'text-white' : 'text-gray-600'
                                }`}>
                                {isEpicDone ? '✓' : epicIdx}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Current EPIC details */}
                      {epicName && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-400 font-medium truncate max-w-[60%]">
                            ▸ {epicName}
                          </span>
                          {totalSys2 > 0 && (
                            <span className="text-gray-400">
                              SYS2: {currentSys2}/{totalSys2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Overall Progress</span>
                      <span className="font-semibold text-white">{sessionStatus.progress_percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${sessionStatus.progress_percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Error Details */}
            {sessionStatus.error_details && (  // Changed from errorDetails
              <Alert variant="destructive" className="bg-red-900/20 border-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <pre className="text-xs whitespace-pre-wrap">{sessionStatus.error_details}</pre>  {/* Changed */}
                </AlertDescription>
              </Alert>
            )}

            {/* Timeline */}
            {sessionStatus.created_at && sessionStatus.updated_at && (  // Changed
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Created At</p>
                  <p className="font-medium text-white">
                    {new Date(sessionStatus.created_at).toLocaleString()}  {/* Changed */}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated</p>
                  <p className="font-medium text-white">
                    {new Date(sessionStatus.updated_at).toLocaleString()}  {/* Changed */}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <Button
                onClick={() => fetchSessionStatus(sessionId, false)}
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>

              {sessionStatus.status === 'completed' && (
                <Button
                  onClick={handleDownload}
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Results
                </Button>
              )}
            </div>

            {/* Auto-polling indicator */}
            {isPolling && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Auto-refreshing every 2 seconds...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* EPIC-wise Excel Preview */}
      {epicPreviews.length > 0 && (
        <Card className="bg-gray-800/70 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
                  EPIC Output Preview
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {epicPreviews.length} file(s) generated
                </CardDescription>
              </div>
              {epicPreviews.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-gray-600"
                    disabled={activePreviewIdx === 0}
                    onClick={() => setActivePreviewIdx(i => i - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-300">
                    {activePreviewIdx + 1} / {epicPreviews.length}
                  </span>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-gray-600"
                    disabled={activePreviewIdx >= epicPreviews.length - 1}
                    onClick={() => setActivePreviewIdx(i => i + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Tab buttons for each file */}
            {epicPreviews.length > 1 && (
              <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
                {epicPreviews.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewIdx(idx)}
                    className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-all ${idx === activePreviewIdx
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                  >
                    {ep.file_name.replace(/\.[^/.]+$/, '').substring(0, 30)}
                  </button>
                ))}
              </div>
            )}

            {/* Active file preview */}
            {(() => {
              const preview = epicPreviews[activePreviewIdx];
              if (!preview) return null;
              if (preview.error) {
                return (
                  <div className="text-red-400 text-sm p-4 bg-red-900/10 rounded-lg">
                    Error reading file: {preview.error}
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {/* File info */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{preview.file_name}</span>
                    <span>{preview.total_rows} rows · {preview.file_size_kb} KB</span>
                  </div>
                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-900/80">
                          {preview.columns.map((col: string, ci: number) => (
                            <th key={ci} className="px-3 py-2 text-left text-gray-300 font-semibold border-b border-gray-700 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.map((row: Record<string, string>, ri: number) => (
                          <tr key={ri} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            {preview.columns.map((col: string, ci: number) => (
                              <td key={ci} className="px-3 py-2 text-gray-300 max-w-[200px] truncate" title={row[col]}>
                                {row[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.total_rows > preview.preview_rows && (
                    <p className="text-xs text-gray-500 text-center">
                      Showing {preview.preview_rows} of {preview.total_rows} rows
                    </p>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}


      {/* Help Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>1. Enter your session ID from the generation page</p>
          <p>2. Click "Check Status" to fetch the current progress</p>
          <p>3. The page will auto-refresh while processing</p>
          <p>4. Download your results once generation is complete</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionStatusTrackerPage;
