import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layers, Settings2, FileText, CheckCircle2, Circle, Sparkles
} from 'lucide-react';

import { MultiDomainSelector } from '@/components/MultiDomainSelector';
import { InterfaceSelectionPanel } from '@/components/InterfaceSelectionPanel';

export interface EpicDomainSuggestion {
  suggested_domain_ids:   string[];
  matched_domain_names:   string[];
  unmatched_domain_names: string[];
  reason?: string;
}

export interface EpicDomainSelectionProps {
  epics: Array<{
    id: string;
    name: string;
    type: 'file' | 'worksheet';
    fileName?: string;
  }>;
  sessionId: string;
  onSelectionsChange: (selections: Record<string, {
    domainIds: string[];
    interfaceIds: string[];
  }>) => void;
  initialSelections?: Record<string, {
    domainIds: string[];
    interfaceIds: string[];
  }>;
  enableFourTier?: boolean;
  enableEnhancedFiveTier?: boolean;
  extractedComponents?: Record<string, string[]>;
  autoSuggestedDomains?: Record<string, EpicDomainSuggestion>;
}

export const EpicDomainSelector: React.FC<EpicDomainSelectionProps> = ({
  epics,
  sessionId,
  onSelectionsChange,
  initialSelections = {},
  enableFourTier = false,
  enableEnhancedFiveTier = false,
  extractedComponents = {},
  autoSuggestedDomains = {},
}) => {

  const [selections, setSelections] = useState<Record<string, {
    domainIds: string[];
    interfaceIds: string[];
  }>>(initialSelections);

  const [activeTab, setActiveTab] = useState<string>(epics[0]?.id || '');

  // ── Effect 1: Sync to parent whenever selections change ──────────────────
  useEffect(() => {
    onSelectionsChange(selections);
  }, [selections, onSelectionsChange]);

  // ── Effect 2: Reset to empty when the epic list itself changes ───────────
  // (new file upload → new epic IDs → wipe old selections)
  const epicKey = epics.map(e => e.id).join(',');
  useEffect(() => {
    setSelections(initialSelections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epicKey]);

  // ── Effect 3: Apply auto-suggestions — only fires when suggestions prop
  //             changes, and only fills slots that are still empty.
  //             User deselections are NEVER overwritten because this effect
  //             only re-runs when autoSuggestedDomains gets a new reference.
  useEffect(() => {
    if (!autoSuggestedDomains || Object.keys(autoSuggestedDomains).length === 0) return;

    setSelections(prev => {
      const next = { ...prev };
      let changed = false;

      for (const epic of epics) {
        const sug = autoSuggestedDomains[epic.id];
        const alreadyHasDomains = (prev[epic.id]?.domainIds?.length ?? 0) > 0;

        if (sug?.suggested_domain_ids?.length > 0 && !alreadyHasDomains) {
          next[epic.id] = {
            domainIds:    sug.suggested_domain_ids,
            interfaceIds: prev[epic.id]?.interfaceIds ?? [],
          };
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [autoSuggestedDomains]); // ← ONLY re-runs when parent pushes new suggestions

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDomainSelection = useCallback((epicId: string, domainIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [epicId]: {
        ...prev[epicId],
        domainIds,
        interfaceIds: prev[epicId]?.interfaceIds || [],
      },
    }));
  }, []);

  const handleInterfaceSelection = useCallback((epicId: string, interfaceIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [epicId]: {
        ...prev[epicId],
        domainIds: prev[epicId]?.domainIds || [],
        interfaceIds,
      },
    }));
  }, []);

  const getEpicCompletionStatus = (epicId: string) => {
    const selection = selections[epicId];
    const hasDomains    = (selection?.domainIds?.length ?? 0) > 0;
    const hasInterfaces = (selection?.interfaceIds?.length ?? 0) > 0;
    return { hasDomains, hasInterfaces, isComplete: hasDomains };
  };

  const progress = {
    completed: epics.filter(epic => getEpicCompletionStatus(epic.id).hasDomains).length,
    total: epics.length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Epic-wise Domain &amp; Interface Selection
          </div>
          <Badge variant={progress.completed === progress.total ? 'default' : 'secondary'}>
            {progress.completed}/{progress.total} EPICs Configured
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>

          {/* ── Epic tab strip ──────────────────────────────────────────── */}
          <TabsList className="grid w-full grid-cols-1 h-auto">
            <div className="flex flex-wrap gap-1">
              {epics.map((epic) => {
                const status = getEpicCompletionStatus(epic.id);
                const hasSuggestion =
                  (autoSuggestedDomains[epic.id]?.suggested_domain_ids?.length ?? 0) > 0;

                return (
                  <TabsTrigger
                    key={epic.id}
                    value={epic.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {status.isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-32">{epic.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {epic.type}
                    </Badge>
                    {hasSuggestion && !status.isComplete && (
                      <Sparkles
                        className="h-3 w-3 text-blue-400"
                        title="Auto-detected domains available"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </div>
          </TabsList>

          {/* ── Per-epic tab content ────────────────────────────────────── */}
          {epics.map((epic) => {
            const epicComponents = extractedComponents[epic.name] || [];
            const suggestion     = autoSuggestedDomains[epic.id];
            const hasMatched     = (suggestion?.matched_domain_names?.length ?? 0) > 0;
            const hasUnmatched   = (suggestion?.unmatched_domain_names?.length ?? 0) > 0;

            return (
              <TabsContent key={epic.id} value={epic.id} className="mt-4">
                <div className="space-y-4">

                  {/* ── Auto-suggest banner ───────────────────────────── */}
                  {suggestion && (hasMatched || hasUnmatched) && (
                    <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-950/30 flex flex-wrap items-center gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      {hasMatched && (
                        <>
                          <span className="text-blue-300 font-medium">
                            Auto-selected (most recent instance):
                          </span>
                          {suggestion.matched_domain_names.map(name => (
                            <Badge
                              key={name}
                              variant="outline"
                              className="border-blue-400/50 text-blue-300 bg-blue-900/30"
                            >
                              {name}
                            </Badge>
                          ))}
                        </>
                      )}
                      {hasUnmatched && (
                        <span className="text-amber-400 ml-1">
                          {suggestion.unmatched_domain_names.length} value(s) not found in DB:{' '}
                          <span className="font-medium">
                            {suggestion.unmatched_domain_names.join(', ')}
                          </span>
                          {' '}— select manually below.
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Extracted Components Display ──────────────────── */}
                  {epicComponents.length > 0 && (
                    <div className="p-4 rounded-lg border border-teal-500/30 bg-slate-800/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-slate-300">
                          Components in{' '}
                          <strong className="text-teal-400">{epic.name}</strong>:
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-auto bg-teal-500/20 text-teal-300 border-teal-500/30"
                        >
                          {epicComponents.length} components
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {epicComponents.map((component, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-teal-600/20 text-teal-300 border-teal-500/40 hover:bg-teal-600/30"
                          >
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Domain / Interface sub-tabs ───────────────────── */}
                  <Tabs defaultValue="domains" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="domains">
                        <Layers className="mr-2 h-4 w-4" />
                        Domains
                      </TabsTrigger>
                      <TabsTrigger value="interfaces">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Interfaces (Optional)
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="domains" className="mt-4">
                      <MultiDomainSelector
                        sessionId={sessionId}
                        onDomainsSelected={(domainIds) =>
                          handleDomainSelection(epic.id, domainIds)
                        }
                        selectedDomainIds={selections[epic.id]?.domainIds || []}
                        maxSelection={10}
                        key={`domains-${epic.id}`}
                      />
                    </TabsContent>

                    <TabsContent value="interfaces" className="mt-4">
                      {(selections[epic.id]?.domainIds?.length ?? 0) > 0 ? (
                        <InterfaceSelectionPanel
                          sessionId={sessionId}
                          selectedDomainIds={selections[epic.id].domainIds}
                          onInterfacesSelected={(interfaceIds) =>
                            handleInterfaceSelection(epic.id, interfaceIds)
                          }
                          selectedInterfaceIds={selections[epic.id]?.interfaceIds || []}
                          maxSelection={10}
                          key={`interfaces-${epic.id}`}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Please select at least one domain first
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};