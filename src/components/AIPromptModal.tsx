import React, { useState, useEffect } from 'react';
import { X, Copy, Save, RefreshCw, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export type PromptType = 'domain_scope' | 'interface_enhancement' | 'swe1_generation';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptType: PromptType;
  originalPrompt: string;
  contextData?: any;
  onExecute: (editedPrompt: string) => Promise<void>;
  title?: string;
}

// Default prompt templates
const DEFAULT_TEMPLATES: Record<PromptType, string> = {
  domain_scope: `You are analyzing a domain specification document. Extract and structure the content into well-defined sections.

Context:
- Domain Type: {domain_type}
- Domain Name: {domain_name}

Task:
1. Identify major sections in the domain scope
2. Extract content for each section
3. Maintain hierarchical relationships
4. Preserve technical accuracy

Domain Scope Content:
{content}

Please structure this into sections with clear headers and organized content.`,

  interface_enhancement: `You are enhancing an interface specification with detailed technical information.

Context:
- Interface Name: {interface_name}
- Interface Type: {interface_type}
- Domain: {domain_name}

Current Interface Description:
{description}

Task:
1. Expand the interface description with technical details
2. Define clear parameters with types and descriptions
3. Specify return values and error conditions
4. Add implementation notes and constraints
5. Include relevant API references

Please provide a comprehensive interface specification.`,

  swe1_generation: `You are converting SYS2 system requirements to SWE.1 software requirements.

Context:
- Domain: {domain_name}
- Total Requirements: {requirement_count}
- Domain Scope Available: {has_domain_scope}

SYS2 Requirements:
{requirements}

Domain Context:
{domain_context}

Task:
1. Convert each SYS2 requirement to detailed SWE.1 format
2. Maintain traceability between SYS2 and SWE.1
3. Add technical implementation details
4. Ensure consistency with domain scope
5. Follow software engineering best practices

Generate comprehensive SWE.1 requirements with proper structure and traceability.`
};

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  promptType,
  originalPrompt,
  contextData = {},
  onExecute,
  title
}) => {
  const [editedPrompt, setEditedPrompt] = useState(originalPrompt);
  const [isExecuting, setIsExecuting] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    setEditedPrompt(originalPrompt);
  }, [originalPrompt]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      await onExecute(editedPrompt);
      onClose();
    } catch (error) {
      console.error('Failed to execute with edited prompt:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(editedPrompt);
  };

  const handleResetToOriginal = () => {
    setEditedPrompt(originalPrompt);
  };

  const handleUseTemplate = () => {
    const template = DEFAULT_TEMPLATES[promptType];
    setEditedPrompt(template);
    setUseTemplate(true);
  };

  // Replace placeholders in prompt with actual data
  const getPreviewPrompt = (prompt: string) => {
    let preview = prompt;
    Object.entries(contextData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return preview;
  };

  const promptTypeLabels: Record<PromptType, string> = {
    domain_scope: 'Domain Scope Builder',
    interface_enhancement: 'Interface Enhancement',
    swe1_generation: 'SWE.1 Generation'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-300 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              {title || 'AI Prompt Editor'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-slate-500 text-slate-100 border-slate-400">{promptTypeLabels[promptType]}</Badge>
              <Badge className="bg-blue-500 text-blue-100 border-blue-400">
                {Object.keys(contextData).length} context variables
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-white hover:bg-slate-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="edit">Edit Prompt</TabsTrigger>
              <TabsTrigger value="preview">Preview with Data</TabsTrigger>
              <TabsTrigger value="context">Context Variables</TabsTrigger>
            </TabsList>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <TabsContent value="edit" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">
                      Edit the AI prompt below. Use {'{variable}'} syntax for placeholders.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUseTemplate}
                        className="text-xs bg-purple-100 border-2 border-purple-300 text-purple-800 hover:bg-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        Use Template
                      </button>
                      <button
                        onClick={handleResetToOriginal}
                        className="text-xs bg-green-100 border-2 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reset
                      </button>
                      <button
                        onClick={handleCopyPrompt}
                        className="text-xs bg-blue-100 border-2 border-blue-300 text-blue-800 hover:bg-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter your AI prompt here..."
                    spellCheck={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Preview of the prompt with actual data substituted:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 overflow-x-auto">
                      {getPreviewPrompt(editedPrompt)}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="context" className="mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Available context variables for this prompt:
                  </p>
                  <div className="space-y-2">
                    {Object.entries(contextData).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <code className="text-sm font-mono text-blue-600 min-w-[200px]">
                          {'{' + key + '}'}
                        </code>
                        <span className="text-sm text-gray-700">
                          {typeof value === 'object' 
                            ? JSON.stringify(value, null, 2) 
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="border-t p-4 flex items-center justify-between bg-gradient-to-r from-gray-100 to-slate-100 rounded-b-lg">
          <div className="text-sm text-gray-700">
            {editedPrompt !== originalPrompt && (
              <span className="text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded">
                ⚠️ Prompt has been modified
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExecuting}
              className="border-gray-400 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !editedPrompt.trim()}
              className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIPromptModal;