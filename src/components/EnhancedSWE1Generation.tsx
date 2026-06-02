import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Layers,
  FileText,
  Cpu,
  Download,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { MultiDomainSelector } from './MultiDomainSelector';
import { InterfaceVersionSelector } from './InterfaceVersionSelector';
import { InterfaceDetailsPage } from './InterfaceDetailsPage';
import { testbedService } from '@/services/api';
import { ProcessingStatus } from '@/services/types';

interface EnhancedSWE1GenerationProps {
  sessionId: string;
  onGenerationComplete?: (outputPath: string) => void;
}

export const EnhancedSWE1Generation: React.FC<EnhancedSWE1GenerationProps> = ({
  sessionId,
  onGenerationComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'domains' | 'versions' | 'interfaces' | 'generation'>('domains');
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [selectedInterfaceIds, setSelectedInterfaceIds] = useState<string[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [currentDomainDetail, setCurrentDomainDetail] = useState<{id: string, name: string, version: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'excel' | 'csv' | 'markdown'>('excel');
  const [includeTraceability, setIncludeTraceability] = useState(true);

  const handleDomainSelection = async (domainIds: string[]) => {
    setSelectedDomainIds(domainIds);
    setError(null);
    
    if (domainIds.length > 0) {
      try {
        // Save domain selection to session
        await testbedService.selectDomains(sessionId, domainIds);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to save domain selection');
      }
    }
  };

  const handleInterfaceSelection = async (interfaceIds: string[]) => {
    setSelectedInterfaceIds(interfaceIds);
    setError(null);
    
    try {
      // Save interface selection to session
      await testbedService.selectInterfaces(sessionId, interfaceIds);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save interface selection');
    }
  };

  const proceedToVersions = () => {
    if (selectedDomainIds.length === 0) {
      setError('Please select at least one domain');
      return;
    }
    setCurrentStep('versions');
  };

  const proceedToGeneration = () => {
    setCurrentStep('generation');
  };

  const handleVersionSelected = (domainId: string, version: string) => {
    setSelectedVersions(prev => ({
      ...prev,
      [domainId]: version
    }));
  };

  const showInterfaceDetails = (domainId: string, domainName: string, version: string) => {
    setCurrentDomainDetail({ id: domainId, name: domainName, version });
    setCurrentStep('interfaces');
  };

  const handleInterfaceDetailsBack = () => {
    setCurrentDomainDetail(null);
    setCurrentStep('versions');
  };

  const handleInterfaceDetailsSelected = async (interfaceIds: string[]) => {
    // Add to selected interfaces
    const updatedIds = [...new Set([...selectedInterfaceIds, ...interfaceIds])];
    setSelectedInterfaceIds(updatedIds);
    
    try {
      // Save interface selection to session
      await testbedService.selectInterfaces(sessionId, updatedIds);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save interface selection');
    }
  };

  const startGeneration = async () => {
    console.log('Starting generation with:', {
      selectedDomainIds,
      selectedInterfaceIds,
      outputFormat,
      includeTraceability
    });
    
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGenerationStatus('Starting enhanced SWE.1 generation...');

    try {
      const response = await testbedService.generateEnhancedSwe1(sessionId, {
        output_format: outputFormat,
        include_traceability: includeTraceability,
        max_context_chunks: 10
      });

      console.log('Generation started:', response.data);
      
      // Start polling for progress
      pollGenerationProgress();
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.response?.data?.detail || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    // Reset all selections and go back to step 1
    setCurrentStep('domains');
    setSelectedDomainIds([]);
    setSelectedInterfaceIds([]);
    setSelectedVersions({});
    setCurrentDomainDetail(null);
    setError(null);
    setGenerationProgress(0);
    setGenerationStatus('');
    setIsGenerating(false);
  };

  const pollGenerationProgress = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/testbed/${sessionId}/status`);
        const status = await response.json();

        setGenerationProgress(status.progress_percentage || 0);
        setGenerationStatus(status.message || 'Processing...');

        if (status.status === ProcessingStatus.COMPLETED) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationStatus('Generation completed successfully!');
          
          if (onGenerationComplete && status.output_file_path) {
            onGenerationComplete(status.output_file_path);
          }
        } else if (status.status === ProcessingStatus.FAILED) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setError(status.error_details || 'Generation failed');
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
      }
    }, 2000);

    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isGenerating) {
        setIsGenerating(false);
        setError('Generation timeout - please check the session status');
      }
    }, 600000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Start Over button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Enhanced SWE.1 Generation</h2>
        {(currentStep !== 'domains' || selectedDomainIds.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartOver}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Start Over
          </Button>
        )}
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep === 'domains' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Layers className="h-5 w-5" />
          <span className="font-medium">Domains</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <div className={`flex items-center space-x-2 ${currentStep === 'versions' || currentStep === 'interfaces' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Cpu className="h-5 w-5" />
          <span className="font-medium">Interface Versions</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <div className={`flex items-center space-x-2 ${currentStep === 'generation' ? 'text-blue-600' : 'text-gray-500'}`}>
          <FileText className="h-5 w-5" />
          <span className="font-medium">Generate</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Domain Selection */}
      {currentStep === 'domains' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Domains</CardTitle>
            <CardDescription>
              Choose up to 5 domains to include in the SWE.1 generation. Domains with scope documents provide better context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiDomainSelector
              sessionId={sessionId}
              onDomainsSelected={handleDomainSelection}
              selectedDomainIds={selectedDomainIds}
              maxSelection={5}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={proceedToVersions}
                disabled={selectedDomainIds.length === 0}
              >
                Continue to Interface Selection
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Version Selection */}
      {currentStep === 'versions' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Interface Versions</CardTitle>
            <CardDescription>
              Choose interface specification versions for each selected domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterfaceVersionSelector
              sessionId={sessionId}
              selectedDomainIds={selectedDomainIds}
              onVersionSelected={handleVersionSelected}
              onProceed={proceedToGeneration}
              onSelectInterfaces={showInterfaceDetails}
            />
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('domains')}
              >
                Back to Domains
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2.5: Interface Details */}
      {currentStep === 'interfaces' && currentDomainDetail && (
        <InterfaceDetailsPage
          domainId={currentDomainDetail.id}
          domainName={currentDomainDetail.name}
          version={currentDomainDetail.version}
          onBack={handleInterfaceDetailsBack}
          onInterfacesSelected={handleInterfaceDetailsSelected}
          preSelectedIds={selectedInterfaceIds}
        />
      )}

      {/* Step 3: Generation Options */}
      {currentStep === 'generation' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generate Enhanced SWE.1</CardTitle>
            <CardDescription>
              Configure output options and start the multi-domain SWE.1 generation process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Domains:</span>
                <span className="text-sm text-gray-600">{selectedDomainIds.length} domains</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Interfaces:</span>
                <span className="text-sm text-gray-600">
                  {selectedInterfaceIds.length} interfaces
                  {selectedInterfaceIds.length === 0 && (
                    <span className="text-red-500 ml-2">(Please select at least one interface)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Output Options */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Output Format</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as any)}
                  disabled={isGenerating}
                >
                  <option value="excel">Excel (.xlsx) - Recommended</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="markdown">Markdown (.md)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeTraceability"
                  checked={includeTraceability}
                  onChange={(e) => setIncludeTraceability(e.target.checked)}
                  disabled={isGenerating}
                />
                <label htmlFor="includeTraceability" className="text-sm">
                  Include full traceability information
                </label>
              </div>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{generationStatus}</span>
                  <span className="text-sm text-gray-600">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentStep('versions');
                  setError(null);
                }}
                disabled={isGenerating}
              >
                Back to Version Selection
              </Button>
              <Button 
                onClick={startGeneration}
                disabled={isGenerating || selectedInterfaceIds.length === 0}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Enhanced SWE.1
                  </>
                )}
              </Button>
            </div>

            {generationStatus.includes('completed') && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {generationStatus}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};