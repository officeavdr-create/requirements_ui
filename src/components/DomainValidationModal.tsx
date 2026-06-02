// ============================================================
// NEW FILE: src/components/DomainValidationModal.tsx
// ============================================================
import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export interface Sys2DomainValidationResult {
  valid: boolean;
  skipped?: boolean;
  reason?: string;
  message?: string;
  sys2_component_domains: string[];
  selected_domain_names: string[];
  mismatched_domains: string[];
  missing_domain_reqs: Array<{ id: string; title: string; epic?: string }>;
  missing_domain_count: number;
  has_components_column: boolean;
}

interface DomainValidationModalProps {
  isOpen: boolean;
  result: Sys2DomainValidationResult | null;
  /** Called when the user decides to proceed despite warnings */
  onConfirm: () => void;
  /** Called when the user wants to go back and fix selections */
  onCancel: () => void;
}

const DomainValidationModal: React.FC<DomainValidationModalProps> = ({
  isOpen,
  result,
  onConfirm,
  onCancel,
}) => {
  const [showMissingList, setShowMissingList] = useState(false);

  if (!result) return null;

  const hasMismatch = result.mismatched_domains.length > 0;
  const hasMissing = result.missing_domain_count > 0;

  // Nothing to warn about (caller should have skipped the modal, but guard anyway)
  if (!hasMismatch && !hasMissing) {
    onConfirm();
    return null;
  }

  // ── Case 2 only: missing domains — BLOCKING (must confirm) ──────────────
  // ── Case 1 only: mismatch — WARNING (can continue or go back) ───────────
  // ── Both       : show both sections ────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Domain Validation Warning
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Issues were detected while analysing your SYS2 file. Review and
            decide how to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Case 1: Mismatched domains ─────────────────────────────── */}
          {hasMismatch && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-800">
                  Some component domains are not in your selection
                </p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                The following domains appear in your SYS2 requirements (
                <code className="font-mono">Components</code> column) but are{' '}
                <strong>not included</strong> in the domains you selected on the
                Configure page. Requirements linked to these domains may be
                generated incorrectly or skipped.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {result.mismatched_domains.map((d) => (
                  <Badge
                    key={d}
                    variant="outline"
                    className="border-amber-400 text-amber-800 bg-white text-xs"
                  >
                    {d}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-amber-600 pt-1">
                💡 Go back to <strong>Step 3 – Configure</strong> and add the
                missing domains, or continue if this is intentional.
              </p>
            </div>
          )}

          {/* ── Case 2: Missing component domain ───────────────────────── */}
          {hasMissing && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">
                  {result.missing_domain_count} requirement
                  {result.missing_domain_count !== 1 ? 's' : ''} with no
                  component domain
                </p>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                These SYS2 requirements have no value in the{' '}
                <code className="font-mono">Components</code> column. They will
                be generated using <strong>all selected domains</strong>, which
                may produce generic or misaligned SWE.1 requirements. Please
                confirm you want to proceed.
              </p>

              {/* Collapsible requirement list */}
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium"
                onClick={() => setShowMissingList((v) => !v)}
              >
                {showMissingList ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showMissingList ? 'Hide' : 'Show'} affected requirements
                {result.missing_domain_count > result.missing_domain_reqs.length &&
                  ` (showing first ${result.missing_domain_reqs.length} of ${result.missing_domain_count})`}
              </button>

              {showMissingList && (
                <div className="max-h-40 overflow-y-auto rounded border border-red-200 bg-white divide-y divide-red-100 text-xs">
                  {result.missing_domain_reqs.map((req) => (
                    <div key={req.id} className="px-3 py-1.5">
                      <span className="font-mono text-red-700 font-medium">
                        {req.id}
                      </span>
                      {req.epic && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px] border-red-300 text-red-500"
                        >
                          {req.epic}
                        </Badge>
                      )}
                      <p className="text-gray-600 mt-0.5 truncate" title={req.title}>
                        {req.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Configure
          </Button>
          <Button
            onClick={onConfirm}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            Continue Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DomainValidationModal;
