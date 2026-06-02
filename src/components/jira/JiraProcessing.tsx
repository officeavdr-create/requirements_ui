import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface JiraProcessingProps {
  userId: string;
  onBack: () => void;
}
type FilterStates = {
  draft: boolean;
  inReview: boolean;
  approved: boolean;
  rejected: boolean;
};
const JiraProcessing: React.FC<JiraProcessingProps> = ({ userId, onBack }) => {
  const [inputMode, setInputMode] = useState<'excel' | 'keys' | 'sys2'>('keys');
  const [file, setFile] = useState<File | null>(null);
  const [keysInput, setKeysInput] = useState('');
  // const [onlyApproved, setOnlyApproved] = useState(true);
  // // Add new state after onlyApproved
  // const [includeDraft, setIncludeDraft] = useState<boolean>(false);
  const [filterStates, setFilterStates] = useState<FilterStates>({
    draft: false,
    inReview: false,
    approved: true,
    rejected: false
  });
  const [useSequentialHeaders, setUseSequentialHeaders] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ count: number, excel_file: string, markdown_zip: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtifactTypes, setSelectedArtifactTypes] = useState<string[]>(['systemRequirement']);
  const [artifactDropdownOpen, setArtifactDropdownOpen] = useState(false);
  const [ignoreUsedAsDiscipline, setIgnoreUsedAsDiscipline] = useState<boolean>(true);


  const artifactTypes = [
    { value: 'applicationParameter', label: 'Application Parameter' },
    { value: 'clarificationItem', label: 'Clarification Item' },
    { value: 'designInformation', label: 'Design Information' },
    { value: 'generalArtifact', label: 'General Artifact' },
    { value: 'hardwareRequirement', label: 'Hardware Requirement' },
    { value: 'heading', label: 'Heading' },
    { value: 'information', label: 'Information' },
    { value: 'inputSource', label: 'Input Source' },
    { value: 'mechanicalRequirement', label: 'Mechanical Requirement' },
    { value: 'modelDiagram', label: 'Model Diagram' },
    { value: 'modelElement', label: 'Model Element' },
    { value: 'opticalRequirement', label: 'Optical Requirement' },
    { value: 'reuseArtifact', label: 'Reuse Artifact' },
    { value: 'softwareArchitecturalElement', label: 'Software Architectural Element' },
    { value: 'softwareInterface', label: 'Software Interface' },
    { value: 'softwareRequirement', label: 'Software Requirement' },
    { value: 'stakeholderRequirement', label: 'Stakeholder Requirement' },
    { value: 'systemElement', label: 'System Element' },
    { value: 'systemFeature', label: 'System Feature' },
    { value: 'systemFunction', label: 'System Function' },
    { value: 'systemInterface', label: 'System Interface' },
    { value: 'systemRequirement', label: 'System Requirement' },
    { value: 'tcseImportObject', label: 'TcSE Import Object' },
    { value: 'term', label: 'Term' }
  ];
  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);


    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('input_mode', inputMode);
    // formData.append('only_approved', String(onlyApproved));
    formData.append('use_sequential_headers', String(useSequentialHeaders));
    formData.append("artifacttypes", JSON.stringify(selectedArtifactTypes));
    formData.append('ignoreusedasdiscipline', String(ignoreUsedAsDiscipline)); // Add this line
    // In handleProcess, add the new field to formData
    // formData.append("includedraft", String(includeDraft));
    // const selectedStates = Object.keys(filterStates).filter(key => filterStates[key]);
    const selectedStates = (Object.keys(filterStates) as Array<keyof FilterStates>)
      .filter(key => filterStates[key]);
    formData.append("filterstates", JSON.stringify(selectedStates));

    if (inputMode === 'excel') {
      if (!file) {
        setError('Please select an Excel file');
        setProcessing(false);
        return;
      }
      formData.append('file', file);
    } else {
      const keys = keysInput.split('\n').map(k => k.trim()).filter(k => k);
      if (keys.length === 0) {
        setError('Please enter at least one issue key');
        setProcessing(false);
        return;
      }
      formData.append('keys', JSON.stringify(keys));
    }

    try {
      const res = await fetch('/api/v1/jira/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Processing failed');
      }

      setResult({
        count: data.count,
        excel_file: data.excel_file,
        markdown_zip: data.markdown_zip
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };
  const toggleArtifactType = (value: string) => {
    if (selectedArtifactTypes.includes(value)) {
      // Don't allow deselecting if it's the last one
      if (selectedArtifactTypes.length > 1) {
        setSelectedArtifactTypes(selectedArtifactTypes.filter(t => t !== value));
      }
    } else {
      setSelectedArtifactTypes([...selectedArtifactTypes, value]);
    }
  };
  const downloadExcel = () => {
    if (!result?.excel_file) return;
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.excel_file}`;
    link.download = `jira_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMarkdown = () => {
    if (!result?.markdown_zip) return;
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${result.markdown_zip}`;
    link.download = `jira_export_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6 px-3 sm:px-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
            Process Issues
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Extract and process Jira issues to Excel/Markdown
          </p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors"
        >
          ⚙️ JIRA Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Left: Input + Processing Options */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Input Source */}
          <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
              Input Source
            </h3>

            {/* Mode toggle */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              {[
                // { id: 'excel', label: '📊 Excel File' },
                { id: 'keys', label: ' EPIC IDs' },
                { id: 'sys2', label: 'Sys.2 Keys' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setInputMode(mode.id as any)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${inputMode === mode.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-black/20 text-gray-400 hover:bg-black/30'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Mode content */}
            {inputMode === 'excel' ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 sm:p-7 text-center hover:border-blue-500/50 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="text-3xl sm:text-4xl mb-2">📄</div>
                    <div className="text-sm sm:text-base text-white font-medium truncate">
                      {file ? file.name : 'Click to upload Excel file'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                      Must contain <span className="font-mono">'Issue Links'</span> column
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Enter IDs (one per line)
                </label>
                <textarea
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  className="w-full h-32 sm:h-40 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm sm:text-base text-white placeholder-gray-500 font-mono resize-y"
                  placeholder="PROJ1234-5678&#10;INFC26227-22222"
                />
              </div>
            )}
          </div>

          {/* Processing Options */}
          <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-visible">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
              Filter Options
            </h3>
            {/* Artifact Types */}
            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Artifact Types</span>
                <span className="text-[10px] text-gray-500 normal-case font-normal">
                  {selectedArtifactTypes.length} selected
                </span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setArtifactDropdownOpen(!artifactDropdownOpen)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-left text-white flex items-center justify-between hover:border-blue-500/50 hover:bg-black/30 transition-all"
                >
                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {selectedArtifactTypes.length === 0 ? (
                      <span className="text-gray-400 text-xs">Select types...</span>
                    ) : (
                      selectedArtifactTypes.slice(0, 3).map((value) => {
                        const type = artifactTypes.find((t) => t.value === value);
                        return (
                          <span
                            key={value}
                            className="px-1.5 py-0.5 bg-blue-600/20 border border-blue-500/40 rounded text-[10px] font-medium text-blue-300"
                          >
                            {type?.label}
                          </span>
                        );
                      })
                    )}
                    {selectedArtifactTypes.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-600/20 border border-gray-500/40 rounded text-[10px] text-gray-400">
                        +{selectedArtifactTypes.length - 3}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${artifactDropdownOpen ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown - stays visually attached, scrolls inside card if needed */}
                {artifactDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-56 overflow-y-auto z-20">
                    <div className="p-1.5">
                      {artifactTypes.map((type) => (
                        <label
                          key={type.value}
                          className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded cursor-pointer group transition-colors"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${selectedArtifactTypes.includes(type.value)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-500 group-hover:border-blue-400'
                              }`}
                          >
                            {selectedArtifactTypes.includes(type.value) && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedArtifactTypes.includes(type.value)}
                            onChange={() => toggleArtifactType(type.value)}
                            className="hidden"
                          />
                          <span className="text-xs text-gray-300 group-hover:text-white transition-colors flex-1">
                            {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {/* Requirement State */}
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Requirement State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'draft', label: 'Draft', color: 'yellow' },
                    { key: 'inReview', label: 'In Review', color: 'orange' },
                    { key: 'approved', label: 'Approved', color: 'green' },
                    { key: 'rejected', label: 'Rejected', color: 'red' }
                  ].map(({ key, label, color }) => {
                    const active = (filterStates as any)[key];
                    const baseColor =
                      color === 'yellow'
                        ? 'yellow'
                        : color === 'orange'
                          ? 'orange'
                          : color === 'green'
                            ? 'green'
                            : 'red';
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer group transition-all"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${active
                              ? `bg-${baseColor}-600 border-${baseColor}-600`
                              : 'border-gray-500 group-hover:border-gray-300'
                            }`}
                        >
                          {active && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) =>
                            setFilterStates({
                              ...filterStates,
                              [key]: e.target.checked
                            })
                          }
                          className="hidden"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>



              {/* Ignore "Used as Discipline" */}
              <label className="flex items-center gap-2 p-2 rounded-lg border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer group transition-all">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${ignoreUsedAsDiscipline
                      ? 'bg-amber-600 border-amber-600'
                      : 'border-gray-500 group-hover:border-amber-400'
                    }`}
                >
                  {ignoreUsedAsDiscipline && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={ignoreUsedAsDiscipline}
                  onChange={(e) => setIgnoreUsedAsDiscipline(e.target.checked)}
                  className="hidden"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Ignore "Used as Discipline"
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1.5">
                    (uses Refine column)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Status</h3>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              {processing ? (
                <>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-blue-400 font-medium text-sm sm:text-base">Processing issues...</p>
                </>
              ) : result ? (
                <>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-1 sm:mb-2">
                    ✓
                  </div>
                  <div>
                    <p className="text-white font-medium text-base sm:text-lg">Processing Complete</p>
                    <p className="text-gray-400 text-sm">
                      {result.count} issues processed
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    <button
                      onClick={downloadExcel}
                      className="w-full py-2.5 sm:py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>📥</span> Download Excel
                    </button>
                    {result.markdown_zip && (
                      <button
                        onClick={downloadMarkdown}
                        className="w-full py-2.5 sm:py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm"
                      >
                        <span>📝</span> Download Markdown (ZIP)
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base">Ready to start</p>
              )}
            </div>

            {error && (
              <div className="mt-3 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs sm:text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full mt-4 py-3 sm:py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg text-sm sm:text-base"
            >
              {processing ? 'Processing...' : 'Start Fetching'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>

  );
};

export default JiraProcessing;
