import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ScopeSection {
  id: string;
  domain_name: string;
  section_type: string;
  section_order: number;
  content: string;
  original_section_header: string;
  section_word_count: number;
  section_metadata: {
    extraction_confidence: number;
    validation_status: string;
    section_keywords: string[];
  };
  created_at: string;
}

interface DomainScopeViewerProps {
  domainName: string;
  onClose?: () => void;
}

const DomainScopeViewer: React.FC<DomainScopeViewerProps> = ({ domainName, onClose }) => {
  const [sections, setSections] = useState<ScopeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSections();
  }, [domainName]);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/scope-sections/${domainName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }
      
      const data = await response.json();
      setSections(data);
      
      // Auto-expand primary sections
      const primarySections = data
        .filter((s: ScopeSection) => ['primary_scope', 'domain_boundary'].includes(s.section_type))
        .map((s: ScopeSection) => s.id);
      setExpandedSections(new Set(primarySections));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionIcon = (sectionType: string) => {
    const confidence = sections.find(s => s.section_type === sectionType)?.section_metadata.extraction_confidence || 0;
    const status = sections.find(s => s.section_type === sectionType)?.section_metadata.validation_status;
    
    if (status === 'valid' && confidence > 0.8) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'needs_review' || confidence < 0.6) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatSectionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-gray-400 text-center">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No structured sections found for this domain.</p>
          <p className="text-sm mt-2">The domain scope may need to be migrated to the new structure.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          {domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain Scope Sections
        </h3>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm">
            Close
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sections.sort((a, b) => a.section_order - b.section_order).map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {getSectionIcon(section.section_type)}
                  <h4 className="font-medium text-white">
                    {formatSectionType(section.section_type)}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{section.section_word_count} words</span>
                  <span className="text-xs">
                    {(section.section_metadata.extraction_confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            </div>

            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4">
                <div className="pl-10">
                  {section.section_metadata.section_keywords.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {section.section_metadata.section_keywords.slice(0, 5).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 text-sm">
                      {section.content}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>Status: {section.section_metadata.validation_status}</span>
                    <span>Order: {section.section_order}</span>
                    <span>Created: {new Date(section.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <p className="text-sm text-gray-400">
          <strong>Note:</strong> This domain scope has been parsed into {sections.length} structured sections
          using AI. Each section has its own embeddings for improved retrieval during SWE.1 generation.
        </p>
      </div>
    </div>
  );
};

export default DomainScopeViewer;