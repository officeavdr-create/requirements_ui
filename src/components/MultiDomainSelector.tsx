import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, Info, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { domainService } from '@/services';
import { Domain } from '@/services';

interface DomainWithMetadata extends Domain {
  domain_type: string;
  domain_id?: string;
  domain_name?: string;
  has_scope_document: boolean;
  scope_sections_count: number;
  interfaces_count: number;
  last_embedding_update: string | null;
}

interface MultiDomainSelectorProps {
  sessionId: string;
  onDomainsSelected: (domainIds: string[]) => void;
  selectedDomainIds?: string[];
  maxSelection?: number;
}

export const MultiDomainSelector: React.FC<MultiDomainSelectorProps> = ({
  sessionId,
  onDomainsSelected,
  selectedDomainIds = [],
  maxSelection = 10,
}) => {
  const [open, setOpen] = useState(false);
  const [domains, setDomains] = useState<DomainWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(selectedDomainIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Fetch domains only once on mount
  useEffect(() => {
    fetchDomainsWithMetadata();
  }, []);

  // Sync with external changes to selectedDomainIds
  // FIX: Use JSON.stringify for deep comparison to avoid infinite loops
  useEffect(() => {
    const currentIds = JSON.stringify(selectedDomains.sort());
    const newIds = JSON.stringify([...selectedDomainIds].sort());
    if (currentIds !== newIds) {
      setSelectedDomains(selectedDomainIds);
    }
  }, [selectedDomainIds]);

  const fetchDomainsWithMetadata = async () => {
    try {
      setLoading(true);
      const response = await domainService.getAllDomains(true);

      let domainData = response.data || response;
      const domainsArray = Array.isArray(domainData) ? domainData : [];
      const validDomains = domainsArray.filter(domain =>
        domain && (domain.name || domain.domain_name)
      );

      setDomains(validDomains);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  // const toggleDomain = (domainId: string) => {
  //   let newSelection: string[];

  //   if (selectedDomains.includes(domainId)) {
  //     newSelection = selectedDomains.filter(id => id !== domainId);
  //   } else {
  //     if (selectedDomains.length >= maxSelection) {
  //       // Remove the oldest selection to make room
  //       newSelection = [...selectedDomains.slice(1), domainId];
  //     } else {
  //       newSelection = [...selectedDomains, domainId];
  //     }
  //   }

  //   setSelectedDomains(newSelection);
  //   onDomainsSelected(newSelection);
  //   // DON'T close the popover - let user continue selecting
  // };


  const toggleDomain = (domainId: string) => {
    let newSelection: string[];

    if (selectedDomains.includes(domainId)) {
      newSelection = selectedDomains.filter(id => id !== domainId);
    } else {
      if (selectedDomains.length >= maxSelection) {
        // Remove the oldest selection to make room
        newSelection = [...selectedDomains.slice(1), domainId];
      } else {
        newSelection = [...selectedDomains, domainId];
      }
    }


    setSelectedDomains(newSelection);
    onDomainsSelected(newSelection);
  };

  const selectAll = () => {
    const allIds = filteredDomains
      .slice(0, maxSelection)
      .map(d => d.domain_id || d.id);
    setSelectedDomains(allIds);
    onDomainsSelected(allIds);
  };

  const clearAll = () => {
    setSelectedDomains([]);
    onDomainsSelected([]);
  };

  const toggleGroupCollapse = (term: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(term)) {
        newSet.delete(term);
      } else {
        newSet.add(term);
      }
      return newSet;
    });
  };

  const getSelectedDomainNames = () => {
    if (selectedDomains.length === 0) return 'Select domains...';
    if (selectedDomains.length === 1) {
      const domain = domains.find(d => (d.domain_id || d.id) === selectedDomains[0]);
      const domainName = domain?.domain_name || domain?.name || 'Unknown';
      return domainName;
    }
    return `${selectedDomains.length} domain${selectedDomains.length > 1 ? 's' : ''} selected`;
  };

  // ORIGINAL CODE - Commented for easy rollback
  // const filteredDomains = domains.filter(domain => {
  //   const domainName = domain.domain_name || domain.name || '';
  //   const domainType = domain.domain_type || '';
  //   return domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //          domainType.toLowerCase().includes(searchQuery.toLowerCase());
  // });

  // NEW CODE - Multi-word search with AND logic
  const filteredDomains = domains.filter(domain => {
    const domainName = domain.domain_name || domain.name || '';
    const domainType = domain.domain_type || '';
    const searchText = `${domainName} ${domainType}`.toLowerCase();

    // Split search query by spaces and filter out empty strings
    const searchTerms = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0);

    // If no search terms, show all domains
    if (searchTerms.length === 0) {
      return true;
    }

    // Check if ANY search term is found in the combined search text (OR logic)
    return searchTerms.some(term => searchText.includes(term));
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Domain Selection (Multi-Select)</label>
        <span className="text-xs text-gray-500">
          {selectedDomains.length}/{maxSelection} selected
        </span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            <span className="truncate">{getSelectedDomainNames()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-gray-900 border border-gray-700 shadow-xl text-gray-100" align="start">
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="p-2 border-b border-gray-700">
              <div className="flex items-center px-3 pb-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-100 placeholder:text-gray-500"
                />
                {searchQuery && (
                  <X
                    className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white bg-transparent"
                  onClick={selectAll}
                  disabled={filteredDomains.length === 0 || selectedDomains.length === maxSelection}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white bg-transparent"
                  onClick={clearAll}
                  disabled={selectedDomains.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Domain List */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredDomains.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">
                  {searchQuery ? 'No domains found matching your search.' : 'No domains available.'}
                </p>
              ) : (() => {
                // Get search terms
                const searchTerms = searchQuery
                  .toLowerCase()
                  .trim()
                  .split(/\s+/)
                  .filter(term => term.length > 0);

                // If no search or single term, show normal list
                if (searchTerms.length <= 1) {
                  return filteredDomains.map((domain) => {
                    const domainId = domain.domain_id || domain.id || '';
                    const domainName = domain.domain_name || domain.name || 'Unknown';
                    const isSelected = selectedDomains.includes(domainId);
                    const hasScope = domain.has_scope_document;
                    const hasInterfaces = domain.interfaces_count > 0;

                    return (
                      <div
                        key={domainId}
                        onClick={() => toggleDomain(domainId)}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors",
                          "hover:bg-gray-700 hover:text-white",
                          isSelected && "bg-gray-700"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={cn(
                              "flex items-center justify-center w-4 h-4 rounded border",
                              isSelected ? "bg-primary border-primary" : "border-input"
                            )}>
                              <Check
                                className={cn(
                                  "h-3 w-3 text-primary-foreground",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-gray-100">{domainName}</p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {domain.domain_type}
                                </Badge>
                                {hasScope && (
                                  <Badge variant="outline" className="text-xs">
                                    {domain.scope_sections_count} sections
                                  </Badge>
                                )}
                                {hasInterfaces && (
                                  <Badge variant="outline" className="text-xs">
                                    {domain.interfaces_count} interfaces
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {!hasScope && (
                            <div
                              className="flex items-center justify-center w-5 h-5 bg-amber-100 rounded-full cursor-help ml-2 flex-shrink-0"
                              title="⚠️ No Scope Document: This domain has no scope sections. Generate embeddings in Domain Management to enable enhanced processing."
                            >
                              <Info className="h-3 w-3 text-amber-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                }

                // Multiple search terms - group by matching term
                const groupedDomains: { [key: string]: typeof filteredDomains } = {};

                filteredDomains.forEach(domain => {
                  const domainName = domain.domain_name || domain.name || '';
                  const domainType = domain.domain_type || '';
                  const searchText = `${domainName} ${domainType}`.toLowerCase();

                  // Find which term(s) this domain matches
                  searchTerms.forEach(term => {
                    if (searchText.includes(term)) {
                      if (!groupedDomains[term]) {
                        groupedDomains[term] = [];
                      }
                      // Avoid duplicates
                      if (!groupedDomains[term].some(d => (d.domain_id || d.id) === (domain.domain_id || domain.id))) {
                        groupedDomains[term].push(domain);
                      }
                    }
                  });
                });

                // Render grouped domains
                return Object.entries(groupedDomains).map(([term, domainsInGroup], groupIndex) => {
                  // First group (index 0) is collapsed by default, rest are expanded
                  const isCollapsed = groupIndex === 0
                    ? !collapsedGroups.has(term) // First group: collapsed unless explicitly expanded
                    : collapsedGroups.has(term);  // Other groups: expanded unless explicitly collapsed

                  return (
                    <div key={term} className={groupIndex > 0 ? "mt-4" : ""}>
                      {/* Group Header - Clickable */}
                      <div
                        className="px-2 py-1.5 mb-1 bg-gray-800 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors flex items-center justify-between"
                        onClick={() => toggleGroupCollapse(term)}
                      >
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Matching "{term}" ({domainsInGroup.length})
                        </p>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-gray-400 transition-transform",
                            isCollapsed && "transform -rotate-90"
                          )}
                        />
                      </div>

                      {/* Domains in this group - Conditionally rendered */}
                      {!isCollapsed && domainsInGroup.map((domain) => {
                        const domainId = domain.domain_id || domain.id || '';
                        const domainName = domain.domain_name || domain.name || 'Unknown';
                        const isSelected = selectedDomains.includes(domainId);
                        const hasScope = domain.has_scope_document;
                        const hasInterfaces = domain.interfaces_count > 0;

                        return (
                          <div
                            key={domainId}
                            onClick={() => toggleDomain(domainId)}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none transition-colors",
                              "hover:bg-gray-700 hover:text-white",
                              isSelected && "bg-gray-700"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={cn(
                                  "flex items-center justify-center w-4 h-4 rounded border",
                                  isSelected ? "bg-primary border-primary" : "border-input"
                                )}>
                                  <Check
                                    className={cn(
                                      "h-3 w-3 text-primary-foreground",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate text-gray-100">{domainName}</p>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <Badge variant="secondary" className="text-xs">
                                      {domain.domain_type}
                                    </Badge>
                                    {hasScope && (
                                      <Badge variant="outline" className="text-xs">
                                        {domain.scope_sections_count} sections
                                      </Badge>
                                    )}
                                    {hasInterfaces && (
                                      <Badge variant="outline" className="text-xs">
                                        {domain.interfaces_count} interfaces
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {!hasScope && (
                                <div
                                  className="flex items-center justify-center w-5 h-5 bg-amber-100 rounded-full cursor-help ml-2 flex-shrink-0"
                                  title="⚠️ No Scope Document: This domain has no scope sections. Generate embeddings in Domain Management to enable enhanced processing."
                                >
                                  <Info className="h-3 w-3 text-amber-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer with Done Button */}
            <div className="border-t border-gray-700 p-2 bg-gray-900">
              <Button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Done ({selectedDomains.length} selected)
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Domains Badges */}
      {selectedDomains.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-600">Selected domains:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDomains.map(domainId => {
              const domain = domains.find(d => (d.domain_id || d.id) === domainId);
              if (!domain) return null;
              const domainName = domain.domain_name || domain.name || 'Unknown';

              return (
                <Badge
                  key={domainId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => toggleDomain(domainId)}
                >
                  {domainName}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};