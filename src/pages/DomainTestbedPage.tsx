import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Play, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  FileText,
  Layers,
  BrainCircuit,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTestbed } from '@/hooks/useTestbed';
import { ProcessingStatus } from '@/services/types';
import AIPromptModal from '@/components/AIPromptModal';
import { promptService } from '@/services';
import type { PromptType } from '@/services/promptService';

const DomainTestbedPage: React.FC = () => {
  const {
    session,
    isLoading,
    error,
    createSession,
    uploadDomainFile,
    uploadSys2File,
    generateSwe1,
    checkStatus,
    downloadSwe1,
    deleteSession,
    clearError,
  } = useTestbed();

  const [sessionName, setSessionName] = useState('');
  const [regenerateEmbeddings, setRegenerateEmbeddings] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'excel' | 'csv'>('markdown');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPromptType, setCurrentPromptType] = useState<PromptType>('swe1_generation');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const domainFileRef = useRef<HTMLInputElement>(null);
  const sys2FileRef = useRef<HTMLInputElement>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll status when processing
  useEffect(() => {
    if (session.sessionId && 
        session.status !== ProcessingStatus.PENDING && 
        session.status !== ProcessingStatus.COMPLETED && 
        session.status !== ProcessingStatus.FAILED) {
      
      statusPollingRef.current = setInterval(() => {
        checkStatus();
      }, 2000); // Poll every 2 seconds

      return () => {
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
        }
      };
    }
  }, [session.sessionId, session.status, checkStatus]);

  const handleCreateSession = async () => {
    try {
      await createSession(sessionName || undefined);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDomainFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      alert('Please select a .md file');
      return;
    }

    try {
      await uploadDomainFile(file);
    } catch (err) {
      console.error('Failed to upload domain file:', err);
    }
  };
  const handleSys2FileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for supported file formats
    const supportedExtensions = ['.md', '.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!supportedExtensions.includes(fileExtension)) {
      alert('Please select a supported file format (.md, .xlsx, .xls, or .csv)');
      return;
    }

    try {
      await uploadSys2File(file);
    } catch (err) {
      console.error('Failed to upload SYS2 file:', err);
    }
  };

  const handleShowPromptModal = () => {
    setCurrentPromptType('swe1_generation');
    setShowPromptModal(true);
  };

  const handleGenerate = async () => {
    try {
      // TODO: Pass custom prompt to generateSwe1 when backend supports it
      await generateSwe1(regenerateEmbeddings, outputFormat);
      setCustomPrompt(''); // Clear custom prompt after generation
    } catch (err) {
      console.error('Failed to start generation:', err);
    }
  };

  const handlePromptSave = (prompt: string) => {
    setCustomPrompt(prompt);
    setShowPromptModal(false);
    // Automatically trigger generation after saving custom prompt
    handleGenerate();
  };

  const getPromptContextData = () => {
    // Build context data for SWE.1 generation prompt
    return promptService.buildSwe1GenerationContext(
      { name: session.sessionName || 'Domain Testbed Session' },
      [], // Requirements will be loaded from session
      session.domainFileUploaded ? 'Domain scope file uploaded' : undefined
    );
  };

  const handleDownload = async () => {
    try {
      await downloadSwe1(outputFormat);
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  const handleDeleteSession = async () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession();
        // Reset file inputs
        if (domainFileRef.current) domainFileRef.current.value = '';
        if (sys2FileRef.current) sys2FileRef.current.value = '';
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  const getStatusIcon = () => {
    switch (session.status) {
      case ProcessingStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ProcessingStatus.FAILED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ProcessingStatus.PENDING:
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };
  const isProcessing = session.status !== ProcessingStatus.PENDING && 
                     session.status !== ProcessingStatus.COMPLETED && 
                     session.status !== ProcessingStatus.FAILED;

  const canGenerate = session.sessionId && 
                     session.domainFileUploaded && 
                     session.sys2FileUploaded && 
                     !isProcessing;

  const canDownload = session.status === ProcessingStatus.COMPLETED;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Domain Testbed</h1>
          <p className="text-muted-foreground mt-2">
            Upload domain scope and SYS2 files to generate SWE.1 requirements using AI
          </p>
        </div>
        {session.sessionId && (
          <Button 
            variant="destructive" 
            onClick={handleDeleteSession}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Session
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-500">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Creation */}
      {!session.sessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>
              Start a new testbed session to process your files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionName">Session Name (Optional)</Label>
              <Input
                id="sessionName"
                placeholder="Enter session name..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleCreateSession} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Create Session
            </Button>
          </CardContent>
        </Card>
      )}
      {/* File Upload Section */}
      {session.sessionId && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Domain File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Domain Scope File
              </CardTitle>
              <CardDescription>
                Upload the domain scope markdown file (.md)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domainFile">Select Domain File</Label>
                <Input
                  id="domainFile"
                  type="file"
                  accept=".md,.xlsx,.xls,.csv"
                  ref={domainFileRef}
                  onChange={handleDomainFileUpload}
                  disabled={isLoading || isProcessing}
                />
              </div>
              {session.domainFileUploaded && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Domain file uploaded successfully
                </div>
              )}
            </CardContent>
          </Card>

          {/* SYS2 File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                SYS2 Requirements File
              </CardTitle>
              <CardDescription>
                Upload the SYS2 requirements markdown file (.md)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sys2File">Select SYS2 File (.md, .xlsx, .xls, .csv)</Label>
                <Input
                  id="sys2File"
                  type="file"
                  accept=".md,.xlsx,.xls,.csv"
                  ref={sys2FileRef}
                  onChange={handleSys2FileUpload}
                  disabled={isLoading || isProcessing}
                />
              </div>
              {session.sys2FileUploaded && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  SYS2 file uploaded successfully
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* Generation Controls */}
      {session.sessionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" />
              SWE.1 Generation
            </CardTitle>
            <CardDescription>
              Generate SWE.1 requirements using AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="regenerateEmbeddings"
                checked={regenerateEmbeddings}
                onChange={(e) => setRegenerateEmbeddings(e.target.checked)}
                disabled={isLoading || isProcessing}
              />
              <Label htmlFor="regenerateEmbeddings">
                Regenerate domain embeddings (recommended for new domains)
              </Label>
            </div>
            
            <div>
              <Label htmlFor="outputFormat">Output Format</Label>
              <select
                id="outputFormat"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'markdown' | 'excel' | 'csv')}
                disabled={isLoading || isProcessing}
              >
                <option value="markdown" className="text-gray-900">Markdown (.md)</option>
                <option value="excel" className="text-gray-900">Excel (.xlsx)</option>
                <option value="csv" className="text-gray-900">CSV (.csv)</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Generate SWE.1
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShowPromptModal}
                disabled={!canGenerate || isLoading}
                title="View and customize AI prompt"
              >
                <Eye className="h-4 w-4 mr-2" />
                AI Prompt
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!canDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Display */}
      {session.sessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
            <CardDescription>Session ID: {session.sessionId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className="font-medium">{session.message}</p>
                  {session.currentStep && (
                    <p className="text-sm text-muted-foreground">{session.currentStep}</p>
                  )}
                </div>
                {session.progressPercentage !== undefined && (
                  <div className="text-sm font-medium">
                    {session.progressPercentage}%
                  </div>
                )}
              </div>
              
              {session.progressPercentage !== undefined && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${session.progressPercentage}%` }}
                  />
                </div>
              )}
              
              {session.errorDetails && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{session.errorDetails}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Prompt Modal */}
      {showPromptModal && (
        <AIPromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          promptType={currentPromptType}
          originalPrompt={customPrompt || 'Generate comprehensive SWE.1 requirements from the provided SYS2 requirements using domain-specific context and knowledge.'}
          contextData={getPromptContextData()}
          onExecute={async (editedPrompt: string) => {
            setCustomPrompt(editedPrompt);
            setShowPromptModal(false);
            await handleGenerateSwe1();
          }}
          title="SWE.1 Generation Prompt"
        />
      )}
    </div>
  );
};

export default DomainTestbedPage;
